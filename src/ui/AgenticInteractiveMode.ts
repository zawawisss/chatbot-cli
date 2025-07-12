/**
 * Agentic Interactive Mode
 * Enhanced interactive mode with agentic loop capabilities
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { AgenticChatBot, AgenticChatOptions } from '../chatbot/AgenticChatBot.js';
import { Config } from '../config/Config.js';
import { InteractiveMode } from './InteractiveMode.js';
import { UIComponents, StatusInfo } from './components/UIComponents.js';
import { ToolManager } from '../tools/ToolManager.js';

export class AgenticInteractiveMode extends InteractiveMode {
  private agenticBot: AgenticChatBot;
  private agenticOptions: AgenticChatOptions;

  constructor(agenticBot: AgenticChatBot, config: Config, options: AgenticChatOptions = {}) {
    super(config);
    
    this.agenticOptions = {
      useAgenticLoop: true,
      maxTurns: 10,
      maxToolCalls: 50,
      timeout: 300000,
      requireConfirmation: false,
      showProgress: true,
      debug: false,
      ...options
    };

    this.agenticBot = agenticBot;
  }

  async start(): Promise<void> {
    // Show modern welcome screen
    await this.showAgenticWelcome();
    
    while (true) {
      try {
        const { input } = await inquirer.prompt([
          {
            type: 'input',
            name: 'input',
            message: this.getPromptMessage(),
            prefix: ''
          }
        ]);

        if (!input.trim()) continue;

        // Handle special commands
        if (await this.handleAgenticCommands(input.trim())) {
          continue;
        }

        // Process with agentic bot
        await this.processInput(input.trim());

      } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
          break;
        }
        console.error(chalk.red('Error:', error));
      }
    }

    console.log(chalk.yellow('\nGoodbye! 👋'));
  }

  private async showAgenticWelcome(): Promise<void> {
    // Clear screen and show banner
    UIComponents.clearScreen();
    
    // Get tools count
    const tools = await this.agenticBot.getAvailableTools();
    const toolsCount = tools.length;
    
    // Validate provider status
    const isValid = await this.agenticBot.validateCurrentProvider();
    
    // Show enhanced status bar
    const statusInfo: StatusInfo = {
      provider: this.agenticBot.getCurrentProvider(),
      model: this.agenticBot.getCurrentModel(),
      mode: 'Agentic',
      tools: toolsCount,
      status: isValid ? 'online' : 'error'
    };
    
    UIComponents.showStatusBar(statusInfo);
    
    // Show agentic mode info
    UIComponents.showSectionHeader('Agentic Mode Active', '🚀');
    UIComponents.showInfo('AI with autonomous tool execution capabilities', '🤖');
    
    const stats = this.agenticBot.getAgenticStats();
    UIComponents.showInfo(`Limits: ${stats.maxTurns} turns, ${stats.maxToolCalls} tool calls, 5min timeout`, '📊');
    
    // Show commands help
    const commands = [
      { cmd: '/agentic', desc: 'Toggle agentic mode on/off' },
      { cmd: '/config', desc: 'Configure agentic settings' },
      { cmd: '/stats', desc: 'Show current statistics' },
      { cmd: '/tools', desc: 'List available tools' },
      { cmd: '/demo [type]', desc: 'Run demonstration tasks', example: 'Try: /demo simple' },
      { cmd: '/help', desc: 'Show detailed help' },
      { cmd: '/exit', desc: 'Exit the application' }
    ];
    
    UIComponents.showCommandHelp(commands);
    UIComponents.showSeparator();
  }

  private getPromptMessage(): string {
    const mode = this.agenticBot.isAgenticModeEnabled() ? 
      chalk.green('🔄 AGENTIC') : 
      chalk.yellow('💬 NORMAL');
    
    const provider = this.agenticBot.getCurrentProvider();
    const model = this.agenticBot.getCurrentModel();
    
    return `${mode} [${chalk.cyan(provider)}/${chalk.dim(model)}] ❯`;
  }

  private async handleAgenticCommands(input: string): Promise<boolean> {
    if (!input.startsWith('/')) {
      return false;
    }

    const [command, ...args] = input.slice(1).split(' ');

    switch (command.toLowerCase()) {
      case 'agentic':
        await this.toggleAgenticMode();
        return true;

      case 'config':
        await this.configureAgenticMode();
        return true;

      case 'stats':
        await this.showStats();
        return true;

      case 'tools':
        await this.showAgenticTools();
        return true;

      case 'demo':
        await this.runDemo(args[0]);
        return true;

      case 'help':
        await this.showHelp();
        return true;

      case 'exit':
      case 'quit':
        process.exit(0);
        return true;

      default:
        // Check if parent has this command
        if (input.startsWith('/')) {
          const command = input.slice(1).split(' ')[0];
          const validCommands = ['clear', 'history', 'summary', 'config', 'models', 'provider', 'model', 'temperature', 'help'];
          if (validCommands.includes(command)) {
            const response = await this.agenticBot.ask(input);
            console.log(response);
            return true;
          }
        }
        return false;
    }
  }

  private async processInput(input: string): Promise<void> {
    console.log(''); // Add spacing

    try {
      if (this.agenticBot.isAgenticModeEnabled()) {
        // Use agentic mode - this will show progress automatically
        const response = await this.agenticBot.askWithAgenticLoop(input);
        console.log(chalk.white('\n📋 Final Result:'));
        console.log(chalk.green(response));
      } else {
        // Use normal mode
        const response = await this.agenticBot.ask(input, { useAgenticLoop: false });
        console.log(chalk.cyan('💬 Response:'));
        console.log(response);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : String(error));
    }

    console.log(''); // Add spacing
  }

  private async toggleAgenticMode(): Promise<void> {
    const currentMode = this.agenticBot.isAgenticModeEnabled();
    this.agenticBot.setAgenticMode(!currentMode);
    
    const newMode = this.agenticBot.isAgenticModeEnabled();
    console.log(chalk.green(`✅ Agentic mode ${newMode ? 'enabled' : 'disabled'}`));
    
    if (newMode) {
      console.log(chalk.cyan('🔄 AI can now execute tools autonomously to complete complex tasks'));
    } else {
      console.log(chalk.yellow('💬 AI will only respond with text (no tool execution)'));
    }
  }

  private async configureAgenticMode(): Promise<void> {
    const currentStats = this.agenticBot.getAgenticStats();
    
    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'maxTurns',
        message: 'Maximum turns per task:',
        default: currentStats.maxTurns,
        validate: (value: number) => value > 0 && value <= 50
      },
      {
        type: 'number',
        name: 'maxToolCalls',
        message: 'Maximum tool calls per task:',
        default: currentStats.maxToolCalls,
        validate: (value: number) => value > 0 && value <= 200
      },
      {
        type: 'number',
        name: 'timeout',
        message: 'Timeout (minutes):',
        default: 5,
        validate: (value: number) => value > 0 && value <= 30
      },
      {
        type: 'confirm',
        name: 'debug',
        message: 'Enable debug mode?',
        default: false
      },
      {
        type: 'confirm',
        name: 'confirmToolCalls',
        message: 'Require confirmation for tool calls?',
        default: false
      }
    ]);

    this.agenticBot.setAgenticOptions({
      maxTurns: answers.maxTurns,
      maxToolCalls: answers.maxToolCalls,
      timeout: answers.timeout * 60 * 1000, // Convert to milliseconds
      debug: answers.debug
    });

    this.agenticOptions.requireConfirmation = answers.confirmToolCalls;

    console.log(chalk.green('✅ Agentic configuration updated'));
  }

  private async showStats(): Promise<void> {
    const stats = this.agenticBot.getAgenticStats();
    const config = this.agenticBot.getCurrentConfig();
    
    console.log(chalk.cyan('\n📊 Current Statistics:'));
    console.log(chalk.white(`Max Turns: ${stats.maxTurns}`));
    console.log(chalk.white(`Max Tool Calls: ${stats.maxToolCalls}`));
    console.log(chalk.white(`Timeout: ${stats.timeout} seconds`));
    
    console.log(chalk.cyan('\n⚙️ Configuration:'));
    console.log(chalk.white(`Provider: ${config.provider}`));
    console.log(chalk.white(`Model: ${config.model}`));
    console.log(chalk.white(`Temperature: ${config.temperature}`));
    console.log(chalk.white(`Max Tokens: ${config.maxTokens}`));
    console.log(chalk.white(`Agentic Mode: ${this.agenticBot.isAgenticModeEnabled() ? 'ON' : 'OFF'}`));
    
    const history = this.agenticBot.getHistory();
    console.log(chalk.white(`Messages in History: ${history.length}`));
  }

  private async showAgenticTools(): Promise<void> {
    const tools = await this.agenticBot.getAvailableTools();
    
    console.log(chalk.cyan(`\n🔧 Available Tools (${tools.length}):`));
    
    for (const tool of tools) {
      console.log(chalk.green(`\n📦 ${tool.name}`));
      console.log(chalk.white(`   ${tool.description}`));
      
      if (tool.parameters?.properties) {
        console.log(chalk.dim('   Parameters:'));
        for (const [param, info] of Object.entries(tool.parameters.properties)) {
          const paramInfo = info as any;
          const required = tool.parameters.required?.includes(param) ? chalk.red(' (required)') : '';
          console.log(chalk.dim(`     • ${param}: ${paramInfo.description || paramInfo.type}${required}`));
        }
      }
    }
  }

  private async showHelp(): Promise<void> {
    console.log(chalk.cyan('\n🚀 Agentic Chatbot CLI Help\n'));
    
    console.log(chalk.white('What is Agentic Mode?'));
    console.log(chalk.dim('Agentic mode allows the AI to autonomously execute multiple tools in sequence'));
    console.log(chalk.dim('to complete complex tasks, similar to how Gemini CLI works.\n'));
    
    console.log(chalk.white('How it works:'));
    console.log(chalk.dim('1. You give a complex task (e.g., "analyze and fix all bugs in my project")'));
    console.log(chalk.dim('2. AI breaks it down into steps'));
    console.log(chalk.dim('3. AI executes tools autonomously (read files, run commands, etc.)'));
    console.log(chalk.dim('4. AI continues until the task is complete\n'));
    
    console.log(chalk.white('Example Tasks:'));
    console.log(chalk.green('• "Create a new Node.js project with Express and TypeScript"'));
    console.log(chalk.green('• "Analyze all JavaScript files and fix syntax errors"'));
    console.log(chalk.green('• "Find all TODO comments and create a task list"'));
    console.log(chalk.green('• "Setup a React project and create a basic component"'));
    console.log(chalk.green('• "Debug the failing tests and fix the issues"\n'));
    
    console.log(chalk.white('Commands:'));
    console.log(chalk.yellow('/agentic') + chalk.dim(' - Toggle agentic mode on/off'));
    console.log(chalk.yellow('/config') + chalk.dim(' - Configure agentic settings'));
    console.log(chalk.yellow('/tools') + chalk.dim(' - List all available tools'));
    console.log(chalk.yellow('/stats') + chalk.dim(' - Show current statistics'));
    console.log(chalk.yellow('/demo') + chalk.dim(' - Run demonstration tasks'));
    console.log(chalk.yellow('/clear') + chalk.dim(' - Clear conversation history'));
    console.log(chalk.yellow('/exit') + chalk.dim(' - Exit the application\n'));
  }

  private async runDemo(demoType?: string): Promise<void> {
    const demos = {
      'simple': 'Calculate 25 * 48 + 17 and tell me the current time',
      'files': 'List all files in the current directory and read package.json',
      'analysis': 'Analyze the project structure and create a summary report',
      'task': 'Check system info and create a status report file'
    };

    if (!demoType || !demos[demoType as keyof typeof demos]) {
      console.log(chalk.cyan('\n🎮 Available Demos:'));
      for (const [key, description] of Object.entries(demos)) {
        console.log(chalk.green(`  ${key}`) + chalk.dim(`: ${description}`));
      }
      console.log(chalk.dim('\nUsage: /demo <demo_name>'));
      return;
    }

    const demoTask = demos[demoType as keyof typeof demos];
    console.log(chalk.cyan(`\n🎮 Running Demo: ${demoType}`));
    console.log(chalk.dim(`Task: ${demoTask}\n`));

    await this.processInput(demoTask);
  }

}
