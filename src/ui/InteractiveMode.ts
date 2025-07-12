import { Config } from '../config/Config.js';
import { ChatBot } from '../chatbot/ChatBot.js';
import { ProviderFactory } from '../providers/ProviderFactory.js';
import { ProviderType } from '../providers/types.js';
import { UIComponents, StatusInfo } from './components/UIComponents.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { ToolManager } from '../tools/ToolManager.js';

export class InteractiveMode {
  private config: Config;
  private chatbot: ChatBot;
  private isRunning: boolean = false;

  constructor(config: Config) {
    this.config = config;
    this.chatbot = new ChatBot(config);
  }

  async start(): Promise<void> {
    this.isRunning = true;
    
    // Show welcome message
    await this.showWelcomeMessage();
    
    // Validate current provider
    const isValid = await this.chatbot.validateCurrentProvider();
    if (!isValid) {
      UIComponents.showWarning(
        'Current provider configuration might be invalid',
        'Use the /setup command to configure providers'
      );
    }

    // Main interaction loop
    while (this.isRunning) {
      try {
        const input = await this.getInput();
        
        if (!input.trim()) {
          continue;
        }

        // Handle system commands
        if (input.startsWith('/')) {
          await this.handleSystemCommand(input);
          continue;
        }

        // Handle regular chat
        await this.handleChatMessage(input);
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
          this.isRunning = false;
          console.log(chalk.yellow('\n👋 Goodbye!'));
          break;
        }
        console.error(chalk.red('Error:'), error);
      }
    }
  }

  private async showWelcomeMessage(): Promise<void> {
    // Clear screen and show banner
    UIComponents.clearScreen();
    
    // Get tools count
    const toolManager = new ToolManager();
    const toolsCount = toolManager.getTools().length;
    
    // Validate provider status
    const isValid = await this.chatbot.validateCurrentProvider();
    
    // Show enhanced status bar
    const statusInfo: StatusInfo = {
      provider: this.chatbot.getCurrentProvider(),
      model: this.chatbot.getCurrentModel(),
      mode: 'Interactive',
      tools: toolsCount,
      status: isValid ? 'online' : 'error'
    };
    
    UIComponents.showStatusBar(statusInfo);
    
    // Show quick help
    UIComponents.showInfo('Type your message to start chatting, or use /help for commands', '💬');
    UIComponents.showSeparator();
  }

  private async getInput(): Promise<string> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: chalk.cyan('You:'),
        prefix: ''
      }
    ]);
    
    return answers.message;
  }

  private async handleSystemCommand(input: string): Promise<void> {
    const parts = input.slice(1).split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'quit':
      case 'exit':
        this.isRunning = false;
        console.log(chalk.yellow('👋 Goodbye!'));
        break;

      case 'setup':
        await this.runSetup();
        break;

      case 'stream':
        if (args.length === 0) {
          console.log(chalk.red('Usage: /stream <message>'));
          break;
        }
        await this.handleStreamChat(args.join(' '));
        break;

      case 'save':
        await this.saveConversation();
        break;

      case 'load':
        await this.loadConversation();
        break;

      case 'providers':
        await this.showProviders();
        break;

      case 'switch':
        if (args.length === 0) {
          console.log(chalk.red('Usage: /switch <provider>'));
          break;
        }
        await this.switchProvider(args[0]);
        break;

      case 'tools':
        await this.showTools();
        break;

      default:
        const result = await this.chatbot.executeSystemCommand(command, args);
        console.log(chalk.blue('System:'), result);
        break;
    }
  }

  private async handleChatMessage(message: string): Promise<void> {
    const spinner = ora(chalk.gray('Thinking...')).start();
    
    try {
      const response = await this.chatbot.ask(message);
      spinner.stop();
      
      console.log(chalk.blue('Assistant:'), response);
      console.log();
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    }
  }

  private async handleStreamChat(message: string): Promise<void> {
    // Show API connection status
    UIComponents.showStreamingStatus(
      this.chatbot.getCurrentProvider(),
      this.chatbot.getCurrentModel(),
      'connecting'
    );
    
    const streamDisplay = UIComponents.createStreamDisplay('Assistant');
    
    try {
      streamDisplay.start();
      
      // Update status to streaming
      UIComponents.showStreamingStatus(
        this.chatbot.getCurrentProvider(),
        this.chatbot.getCurrentModel(),
        'streaming'
      );
      
      let response = '';
      let chunkCount = 0;
      
      for await (const chunk of this.chatbot.askStream(message)) {
        streamDisplay.write(chunk);
        response += chunk;
        chunkCount++;
        
        // Show periodic stats for very long responses
        if (chunkCount % 50 === 0) {
          const stats = streamDisplay.getStats();
          process.stdout.write(chalk.gray(` [${stats.charCount} chars, ${stats.wpm} WPM]`));
        }
      }
      
      streamDisplay.complete();
      
      // Show completion status
      UIComponents.showStreamingStatus(
        this.chatbot.getCurrentProvider(),
        this.chatbot.getCurrentModel(),
        'complete'
      );
      
    } catch (error) {
      streamDisplay.error(error instanceof Error ? error.message : String(error));
      
      // Show error status
      UIComponents.showStreamingStatus(
        this.chatbot.getCurrentProvider(),
        this.chatbot.getCurrentModel(),
        'error'
      );
    }
  }

  private async saveConversation(): Promise<void> {
    try {
      const { filename } = await inquirer.prompt([
        {
          type: 'input',
          name: 'filename',
          message: 'Enter filename to save conversation:',
          default: `conversation_${new Date().toISOString().slice(0, 10)}.json`
        }
      ]);

      const history = this.chatbot.getHistory();
      const conversationData = JSON.stringify({
        timestamp: new Date().toISOString(),
        provider: this.chatbot.getCurrentProvider(),
        model: this.chatbot.getCurrentModel(),
        messages: history
      }, null, 2);

      const fs = await import('fs/promises');
      await fs.writeFile(filename, conversationData);
      console.log(chalk.green(`✅ Conversation saved to ${filename}`));
    } catch (error) {
      console.error(chalk.red('Error saving conversation:'), error);
    }
  }

  private async loadConversation(): Promise<void> {
    try {
      const { filename } = await inquirer.prompt([
        {
          type: 'input',
          name: 'filename',
          message: 'Enter filename to load conversation:'
        }
      ]);

      const fs = await import('fs/promises');
      const data = await fs.readFile(filename, 'utf8');
      const conversationData = JSON.parse(data);

      // Clear current history and load the saved messages
      this.chatbot.clearHistory();
      
      if (conversationData.messages) {
        for (const msg of conversationData.messages) {
          // Add messages to history manually
          this.chatbot.getHistory().push(msg);
        }
      }

      console.log(chalk.green(`✅ Conversation loaded from ${filename}`));
      console.log(chalk.gray(`   ${conversationData.messages?.length || 0} messages loaded`));
    } catch (error) {
      console.error(chalk.red('Error loading conversation:'), error);
    }
  }

  private async showProviders(): Promise<void> {
    console.log(chalk.blue('Available providers:'));
    
    const providers = ProviderFactory.getSupportedProviders();
    const validationResults = await this.config.validateAllProviders();
    
    for (const provider of providers) {
      const isCurrent = provider === this.config.get('provider');
      const isValid = validationResults[provider];
      
      const status = isValid ? chalk.green('✅') : chalk.red('❌');
      const current = isCurrent ? chalk.yellow(' (current)') : '';
      const description = ProviderFactory.getProviderDescription(provider);
      
      console.log(`  ${status} ${chalk.bold(provider)}${current}`);
      console.log(`    ${chalk.gray(description)}`);
    }
  }

  private async switchProvider(providerName: string): Promise<void> {
    try {
      const spinner = ora(`Switching to ${providerName}...`).start();
      
      await this.chatbot.switchProvider(providerName);
      await this.config.save();
      
      spinner.stop();
      console.log(chalk.green(`✅ Switched to ${providerName}`));
      console.log(chalk.gray(`   Model: ${this.chatbot.getCurrentModel()}`));
    } catch (error) {
      console.error(chalk.red('Error switching provider:'), error);
    }
  }

  private async showTools(): Promise<void> {
    console.log(chalk.blue('Available tools:'));
    
    const result = await this.chatbot.executeSystemCommand('tools', []);
    console.log(result);
  }

  async runSetup(): Promise<void> {
    console.log(chalk.blue('🔧 Setup Wizard'));
    console.log(chalk.gray('━'.repeat(30)));

    // Choose provider
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select a provider:',
        choices: ProviderFactory.getSupportedProviders().map(p => ({
          name: `${p} - ${ProviderFactory.getProviderDescription(p)}`,
          value: p
        }))
      }
    ]);

    this.config.set('provider', provider);

    // Configure provider-specific settings
    await this.configureProvider(provider);

    // Set general options
    const { temperature, maxTokens, systemPrompt } = await inquirer.prompt([
      {
        type: 'number',
        name: 'temperature',
        message: 'Temperature (0-1):',
        default: 0.7,
        validate: (value) => value >= 0 && value <= 1 || 'Temperature must be between 0 and 1'
      },
      {
        type: 'number',
        name: 'maxTokens',
        message: 'Max tokens:',
        default: 4096
      },
      {
        type: 'input',
        name: 'systemPrompt',
        message: 'System prompt:',
        default: 'You are a helpful AI assistant.'
      }
    ]);

    this.config.set('temperature', temperature);
    this.config.set('maxTokens', maxTokens);
    this.config.set('systemPrompt', systemPrompt);

    // Save configuration
    await this.config.save();
    
    // Update chatbot with new config
    this.chatbot = new ChatBot(this.config);

    console.log(chalk.green('✅ Setup complete!'));
    console.log(chalk.gray(`   Configuration saved to: ${this.config.getConfigPath()}`));
  }

  private async configureProvider(provider: string): Promise<void> {
    const currentConfig = this.config.getProviderConfig(provider as ProviderType);

    switch (provider) {
      case 'gemini':
        const { geminiApiKey, geminiModel } = await inquirer.prompt([
          {
            type: 'password',
            name: 'geminiApiKey',
            message: 'Gemini API Key:',
            default: currentConfig.apiKey,
            mask: '*'
          },
          {
            type: 'input',
            name: 'geminiModel',
            message: 'Gemini Model:',
            default: currentConfig.model || 'gemini-2.5-flash'
          }
        ]);

        this.config.setProviderConfig('gemini', {
          apiKey: geminiApiKey,
          model: geminiModel
        });
        break;

      case 'deepseek':
        const { deepseekApiKey, deepseekModel } = await inquirer.prompt([
          {
            type: 'password',
            name: 'deepseekApiKey',
            message: 'DeepSeek API Key:',
            default: currentConfig.apiKey,
            mask: '*'
          },
          {
            type: 'input',
            name: 'deepseekModel',
            message: 'DeepSeek Model:',
            default: currentConfig.model || 'deepseek-chat'
          }
        ]);

        this.config.setProviderConfig('deepseek', {
          apiKey: deepseekApiKey,
          model: deepseekModel,
          baseUrl: 'https://api.deepseek.com/v1'
        });
        break;

      case 'ollama':
        const { ollamaBaseUrl, ollamaModel } = await inquirer.prompt([
          {
            type: 'input',
            name: 'ollamaBaseUrl',
            message: 'Ollama Base URL:',
            default: currentConfig.baseUrl || 'http://localhost:11434'
          },
          {
            type: 'input',
            name: 'ollamaModel',
            message: 'Ollama Model:',
            default: currentConfig.model || 'llama3.2:latest'
          }
        ]);

        this.config.setProviderConfig('ollama', {
          baseUrl: ollamaBaseUrl,
          model: ollamaModel
        });
        break;
    }
  }
}
