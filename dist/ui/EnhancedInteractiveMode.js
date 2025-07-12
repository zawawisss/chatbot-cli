import { ChatBot } from '../chatbot/ChatBot.js';
import { EnhancedUIComponents } from './EnhancedUIComponents.js';
import { ProviderFactory } from '../providers/ProviderFactory.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createInterface } from 'readline';
import { randomUUID } from 'crypto';
export class EnhancedInteractiveMode {
    config;
    chatbot;
    isRunning = false;
    sessionInfo;
    messageHistory = [];
    rl;
    constructor(config) {
        this.config = config;
        // Create chatbot with agentic configuration enabled
        const agenticConfig = {
            useAgenticLoop: true,
            maxTurns: 10,
            maxToolCalls: 50,
            timeout: 300000,
            requireConfirmation: false,
            showProgress: true,
            debug: true
        };
        this.chatbot = new ChatBot(config, agenticConfig);
        this.sessionInfo = {
            sessionId: randomUUID().split('-')[0],
            messageCount: 0,
            totalTokens: 0,
            startTime: new Date(),
            provider: this.chatbot.getCurrentProvider(),
            model: this.chatbot.getCurrentModel()
        };
    }
    async start() {
        this.isRunning = true;
        // Initialize enhanced UI
        await this.initializeUI();
        // Show welcome and setup
        await this.showEnhancedWelcome();
        // Start interactive loop
        await this.startInteractiveLoop();
    }
    async initializeUI() {
        // Clear screen with enhanced banner
        EnhancedUIComponents.clearScreenWithFade();
        // Show session dashboard
        EnhancedUIComponents.showSessionDashboard(this.sessionInfo);
        // Validate provider and show live status
        const isValid = await this.chatbot.validateCurrentProvider();
        const statusInfo = {
            provider: this.chatbot.getCurrentProvider(),
            model: this.chatbot.getCurrentModel(),
            status: isValid ? 'online' : 'error',
            tools: 12, // Get from tool manager
            responseTime: 0
        };
        EnhancedUIComponents.showLiveStatusBar(statusInfo);
    }
    async runSetup() {
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
        // Update chatbot with new config and maintain agentic configuration
        const agenticConfig = {
            useAgenticLoop: true,
            maxTurns: 10,
            maxToolCalls: 50,
            timeout: 300000,
            requireConfirmation: false,
            showProgress: true,
            debug: true
        };
        this.chatbot = new ChatBot(this.config, agenticConfig);
        console.log(chalk.green('✅ Setup complete!'));
        console.log(chalk.gray(`   Configuration saved to: ${this.config.getConfigPath()}`));
    }
    async configureProvider(provider) {
        const currentConfig = this.config.getProviderConfig(provider);
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
    async showEnhancedWelcome() {
        console.log(chalk.bold.cyan('\n🎉 Welcome to Enhanced ChatBot CLI!'));
        console.log(chalk.gray('Your intelligent AI assistant with multiple providers'));
        // Show quick stats
        EnhancedUIComponents.showQuickStats({
            'Session ID': this.sessionInfo.sessionId,
            'Active Provider': this.sessionInfo.provider,
            'Model': this.sessionInfo.model,
            'Started': this.sessionInfo.startTime.toLocaleTimeString()
        });
        // Show command palette
        EnhancedUIComponents.showCommandPalette();
        console.log(chalk.green('\n✨ Ready to chat! Type your message or use commands starting with /'));
        console.log(chalk.gray('─'.repeat(60)));
    }
    async startInteractiveLoop() {
        // Create readline interface for better input handling
        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.cyan('💬 You: '),
            completer: this.autoComplete.bind(this)
        });
        this.rl.prompt();
        this.rl.on('line', async (input) => {
            const trimmedInput = input.trim();
            if (!trimmedInput) {
                this.rl.prompt();
                return;
            }
            if (trimmedInput.startsWith('/')) {
                await this.handleEnhancedCommand(trimmedInput);
            }
            else {
                await this.handleEnhancedChat(trimmedInput);
            }
            if (this.isRunning) {
                this.rl.prompt();
            }
        });
        this.rl.on('close', () => {
            this.isRunning = false;
            console.log(chalk.yellow('\n👋 Session ended. Goodbye!'));
            process.exit(0);
        });
    }
    autoComplete(line) {
        const commands = [
            '/help', '/setup', '/switch', '/stream', '/nostream', '/save', '/load',
            '/providers', '/tools', '/clear', '/exit', '/dashboard', '/stats'
        ];
        const hits = commands.filter(cmd => cmd.startsWith(line));
        return [hits.length ? hits : commands, line];
    }
    async handleEnhancedCommand(input) {
        const parts = input.slice(1).split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        switch (command) {
            case 'help':
                EnhancedUIComponents.showCommandPalette();
                break;
            case 'dashboard':
                EnhancedUIComponents.showSessionDashboard(this.sessionInfo);
                break;
            case 'stats':
                await this.showSessionStats();
                break;
            case 'clear':
                await this.clearSession();
                break;
            case 'stream':
                if (args.length === 0) {
                    EnhancedUIComponents.showEnhancedError('Usage: /stream <message>', ['Provide a message to get streaming response']);
                    break;
                }
                await this.handleStreamingChat(args.join(' '));
                break;
            case 'nostream':
                if (args.length === 0) {
                    EnhancedUIComponents.showEnhancedError('Usage: /nostream <message>', ['Provide a message to get non-streaming response']);
                    break;
                }
                await this.handleNonStreamingChat(args.join(' '));
                break;
            case 'switch':
                if (args.length === 0) {
                    await this.showProviderSwitcher();
                }
                else {
                    await this.switchProvider(args[0]);
                }
                break;
            case 'providers':
                await this.showEnhancedProviders();
                break;
            case 'exit':
            case 'quit':
                console.log(chalk.yellow('\\n👋 Ending session...'));
                EnhancedUIComponents.showSessionDashboard(this.sessionInfo);
                this.rl.close();
                break;
            default:
                EnhancedUIComponents.showEnhancedError(`Unknown command: /${command}`, ['Type /help to see available commands', 'Check your spelling']);
        }
    }
    async handleEnhancedChat(message) {
        // Use streaming by default for better user experience
        await this.handleStreamingChat(message);
    }
    async handleStreamingChat(message) {
        const startTime = Date.now();
        // Add user message
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        this.messageHistory.push(userMessage);
        EnhancedUIComponents.displayMessage(userMessage);
        // Start streaming response
        const streamResponse = EnhancedUIComponents.showStreamingResponse();
        streamResponse.start();
        try {
            let fullResponse = '';
            for await (const chunk of this.chatbot.askStream(message)) {
                streamResponse.addText(chunk);
                fullResponse += chunk;
            }
            const responseTime = Date.now() - startTime;
            const estimatedTokens = Math.ceil(fullResponse.length / 4);
            streamResponse.complete({ responseTime, tokens: estimatedTokens });
            // Add to history
            const assistantMessage = {
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date(),
                responseTime,
                tokens: estimatedTokens
            };
            this.messageHistory.push(assistantMessage);
            // Update session stats
            this.sessionInfo.messageCount += 2;
            this.sessionInfo.totalTokens += estimatedTokens;
        }
        catch (error) {
            streamResponse.error(error instanceof Error ? error.message : String(error));
        }
    }
    async handleNonStreamingChat(message) {
        const startTime = Date.now();
        // Add user message to history
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        this.messageHistory.push(userMessage);
        EnhancedUIComponents.displayMessage(userMessage);
        // Show typing indicator
        const typingIndicator = EnhancedUIComponents.showTypingIndicator('Assistant');
        typingIndicator.start();
        try {
            const response = await this.chatbot.ask(message);
            typingIndicator.stop();
            const responseTime = Date.now() - startTime;
            const estimatedTokens = Math.ceil(response.length / 4); // Rough estimate
            // Add assistant response to history
            const assistantMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                responseTime,
                tokens: estimatedTokens
            };
            this.messageHistory.push(assistantMessage);
            EnhancedUIComponents.displayMessage(assistantMessage);
            // Update session stats
            this.sessionInfo.messageCount += 2;
            this.sessionInfo.totalTokens += estimatedTokens;
        }
        catch (error) {
            typingIndicator.stop();
            EnhancedUIComponents.showEnhancedError(error instanceof Error ? error.message : String(error), ['Check your API key', 'Verify network connection', 'Try switching providers']);
        }
    }
    async showSessionStats() {
        const duration = Date.now() - this.sessionInfo.startTime.getTime();
        const avgResponseTime = this.messageHistory
            .filter(msg => msg.role === 'assistant' && msg.responseTime)
            .reduce((acc, msg) => acc + (msg.responseTime || 0), 0) /
            this.messageHistory.filter(msg => msg.role === 'assistant').length;
        const stats = {
            'Messages': this.sessionInfo.messageCount,
            'Total Tokens': this.sessionInfo.totalTokens,
            'Duration': `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`,
            'Avg Response': `${Math.round(avgResponseTime || 0)}ms`,
            'Provider': this.sessionInfo.provider,
            'Model': this.sessionInfo.model
        };
        EnhancedUIComponents.showQuickStats(stats);
    }
    async clearSession() {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to clear the session?',
                default: false
            }
        ]);
        if (confirm) {
            this.messageHistory = [];
            this.chatbot.clearHistory();
            this.sessionInfo.messageCount = 0;
            this.sessionInfo.totalTokens = 0;
            this.sessionInfo.startTime = new Date();
            EnhancedUIComponents.clearScreenWithFade();
            await this.initializeUI();
            console.log(chalk.green('✅ Session cleared successfully!'));
        }
    }
    async showProviderSwitcher() {
        const providers = [
            { name: 'gemini', status: 'online', description: 'Google Gemini AI', model: 'gemini-2.5-flash' },
            { name: 'deepseek', status: 'online', description: 'DeepSeek AI', model: 'deepseek-chat' },
            { name: 'ollama', status: 'offline', description: 'Local Ollama', model: 'llama3.2:latest' }
        ];
        EnhancedUIComponents.showProviderCards(providers);
        const { selectedProvider } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedProvider',
                message: 'Select a provider:',
                choices: providers.map(p => ({
                    name: `${p.status === 'online' ? '🟢' : '🔴'} ${p.name} - ${p.description}`,
                    value: p.name
                }))
            }
        ]);
        await this.switchProvider(selectedProvider);
    }
    async switchProvider(providerName) {
        const loader = EnhancedUIComponents.showLoadingAnimation(`Switching to ${providerName}...`);
        loader.start();
        try {
            await this.chatbot.switchProvider(providerName);
            await this.config.save();
            // Update session info
            this.sessionInfo.provider = providerName;
            this.sessionInfo.model = this.chatbot.getCurrentModel();
            loader.succeed(`Successfully switched to ${providerName}`);
            // Update status bar
            const statusInfo = {
                provider: providerName,
                model: this.chatbot.getCurrentModel(),
                status: 'online',
                tools: 12,
                responseTime: 0
            };
            EnhancedUIComponents.showLiveStatusBar(statusInfo);
        }
        catch (error) {
            loader.fail(`Failed to switch to ${providerName}`);
            EnhancedUIComponents.showEnhancedError(error instanceof Error ? error.message : String(error), ['Check provider configuration', 'Verify API keys', 'Use /setup to configure']);
        }
    }
    async showEnhancedProviders() {
        const providers = [
            { name: 'gemini', status: 'online', description: 'Google Gemini AI - Advanced reasoning', model: 'gemini-2.5-flash' },
            { name: 'deepseek', status: 'online', description: 'DeepSeek AI - Fast and efficient', model: 'deepseek-chat' },
            { name: 'ollama', status: 'offline', description: 'Local Ollama - Privacy focused', model: 'llama3.2:latest' }
        ];
        EnhancedUIComponents.showProviderCards(providers);
    }
}
//# sourceMappingURL=EnhancedInteractiveMode.js.map