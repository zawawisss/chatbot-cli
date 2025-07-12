import { ProviderFactory } from '../providers/ProviderFactory.js';
import { ChatHistory } from './ChatHistory.js';
import { ToolManager } from '../tools/ToolManager.js';
import { AgenticTurn } from '../core/AgenticTurn.js';
import chalk from 'chalk';
export class ChatBot {
    config;
    provider;
    history;
    toolManager;
    agenticTurn;
    agenticOptions;
    constructor(config, agenticOptions = {}) {
        this.config = config;
        this.history = new ChatHistory();
        this.toolManager = new ToolManager();
        this.provider = this.createProvider();
        // Initialize agentic options
        this.agenticOptions = {
            useAgenticLoop: agenticOptions.useAgenticLoop ?? false,
            maxTurns: agenticOptions.maxTurns ?? 10,
            maxToolCalls: agenticOptions.maxToolCalls ?? 50,
            timeout: agenticOptions.timeout ?? 300000,
            requireConfirmation: agenticOptions.requireConfirmation ?? false,
            showProgress: agenticOptions.showProgress ?? true,
            debug: agenticOptions.debug ?? false
        };
        this.agenticTurn = new AgenticTurn(this.toolManager, this.history, {
            maxTurns: this.agenticOptions.maxTurns,
            maxToolCalls: this.agenticOptions.maxToolCalls,
            timeout: this.agenticOptions.timeout,
            debug: this.agenticOptions.debug
        });
        this.setupEventListeners();
    }
    createProvider() {
        const providerConfig = this.config.getProviderConfig();
        return ProviderFactory.createProvider(this.config.get('provider'), providerConfig);
    }
    async switchProvider(providerType) {
        if (!ProviderFactory.getSupportedProviders().includes(providerType)) {
            throw new Error(`Unsupported provider: ${providerType}`);
        }
        this.config.set('provider', providerType);
        this.provider = this.createProvider();
        if (this.config.isDebugEnabled()) {
            console.log(`Switched to provider: ${providerType}`);
        }
    }
    async ask(question, options) {
        // Check if it's a system command
        if (question.startsWith('/')) {
            const parts = question.slice(1).split(' ');
            const command = parts[0];
            const args = parts.slice(1);
            return await this.executeSystemCommand(command, args);
        }
        // SIMPLIFIED: Always use agentic loop for all questions
        // This ensures AI keeps looping until task is complete
        return this.executeAgenticLoop(question, options);
    }
    async *askStream(question, options) {
        const userMessage = {
            role: 'user',
            content: question,
            timestamp: new Date()
        };
        this.history.addMessage(userMessage);
        try {
            const chatOptions = {
                model: this.config.getCurrentModel(),
                temperature: this.config.getCurrentTemperature(),
                maxTokens: this.config.getCurrentMaxTokens(),
                systemPrompt: this.config.getSystemPrompt(),
                ...options
            };
            let fullResponse = '';
            for await (const chunk of this.provider.streamChat(this.history.getMessages(), chatOptions)) {
                if (chunk.error) {
                    throw new Error(chunk.error);
                }
                if (chunk.content) {
                    fullResponse += chunk.content;
                    yield chunk.content;
                }
                if (chunk.done) {
                    break;
                }
            }
            const assistantMessage = {
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date()
            };
            this.history.addMessage(assistantMessage);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Stream chat error:', errorMessage);
            throw error;
        }
    }
    async listModels() {
        try {
            const models = await this.provider.listModels();
            return models.map(model => model.name);
        }
        catch (error) {
            console.error('Error listing models:', error);
            return [];
        }
    }
    async getModelInfo() {
        try {
            return await this.provider.listModels();
        }
        catch (error) {
            console.error('Error getting model info:', error);
            return [];
        }
    }
    clearHistory() {
        this.history.clear();
    }
    getHistory() {
        return this.history.getMessages();
    }
    getConversationSummary() {
        const messages = this.history.getMessages();
        const userMessages = messages.filter(m => m.role === 'user').length;
        const assistantMessages = messages.filter(m => m.role === 'assistant').length;
        return `Conversation: ${userMessages} user messages, ${assistantMessages} assistant messages`;
    }
    getCurrentProvider() {
        return this.provider.name;
    }
    getCurrentModel() {
        return this.config.getCurrentModel();
    }
    getCurrentConfig() {
        return {
            provider: this.getCurrentProvider(),
            model: this.getCurrentModel(),
            temperature: this.config.getCurrentTemperature(),
            maxTokens: this.config.getCurrentMaxTokens(),
            systemPrompt: this.config.getSystemPrompt()
        };
    }
    async getAvailableTools() {
        return this.toolManager.getTools();
    }
    async validateCurrentProvider() {
        return await this.config.validateProvider(this.config.get('provider'));
    }
    // System commands
    async executeSystemCommand(command, args) {
        switch (command.toLowerCase()) {
            case 'clear':
                this.clearHistory();
                return 'Conversation history cleared.';
            case 'history':
                const messages = this.getHistory();
                return messages.map((msg, i) => `${i + 1}. [${msg.role}] ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`).join('\n');
            case 'summary':
                return this.getConversationSummary();
            case 'config':
                return JSON.stringify(this.getCurrentConfig(), null, 2);
            case 'models':
                const models = await this.listModels();
                return 'Available models:\n' + models.map(m => `- ${m}`).join('\n');
            case 'provider':
                if (args.length > 0) {
                    await this.switchProvider(args[0]);
                    return `Switched to provider: ${args[0]}`;
                }
                return `Current provider: ${this.getCurrentProvider()}`;
            case 'model':
                if (args.length > 0) {
                    this.config.set('model', args[0]);
                    return `Switched to model: ${args[0]}`;
                }
                return `Current model: ${this.getCurrentModel()}`;
            case 'temperature':
                if (args.length > 0) {
                    const temp = parseFloat(args[0]);
                    if (isNaN(temp) || temp < 0 || temp > 1) {
                        return 'Temperature must be a number between 0 and 1';
                    }
                    this.config.set('temperature', temp);
                    return `Temperature set to: ${temp}`;
                }
                return `Current temperature: ${this.config.getCurrentTemperature()}`;
            case 'tools':
                const tools = this.toolManager.getTools();
                return 'Available tools:\n' + tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n');
            case 'agentic':
                if (args.length > 0 && (args[0] === 'on' || args[0] === 'off')) {
                    const enabled = args[0] === 'on';
                    this.setAgenticMode(enabled);
                    return `Agentic mode ${enabled ? 'enabled' : 'disabled'}`;
                }
                else {
                    const currentStatus = this.isAgenticModeEnabled() ? 'enabled' : 'disabled';
                    this.setAgenticMode(!this.isAgenticModeEnabled());
                    const newStatus = this.isAgenticModeEnabled() ? 'enabled' : 'disabled';
                    return `Agentic mode toggled from ${currentStatus} to ${newStatus}`;
                }
            case 'help':
                return this.getHelpText();
            default:
                return `Unknown command: ${command}. Type 'help' for available commands.`;
        }
    }
    getHelpText() {
        return `
Available commands:
  clear           - Clear conversation history
  history         - Show conversation history
  summary         - Show conversation summary
  config          - Show current configuration
  models          - List available models
  tools           - List available tools
  provider [name] - Switch provider or show current
  model [name]    - Switch model or show current
  temperature [n] - Set temperature (0-1) or show current
  agentic         - Toggle agentic mode
  help            - Show this help message

Supported providers: ${ProviderFactory.getSupportedProviders().join(', ')}
    `.trim();
    }
    // Agentic methods
    setAgenticMode(enabled) {
        this.agenticOptions.useAgenticLoop = enabled;
    }
    isAgenticModeEnabled() {
        return this.agenticOptions.useAgenticLoop ?? false;
    }
    updateAgenticOptions(options) {
        this.agenticOptions = { ...this.agenticOptions, ...options };
        // Update AgenticTurn configuration
        this.agenticTurn = new AgenticTurn(this.toolManager, this.history, {
            maxTurns: this.agenticOptions.maxTurns,
            maxToolCalls: this.agenticOptions.maxToolCalls,
            timeout: this.agenticOptions.timeout,
            debug: this.agenticOptions.debug
        });
    }
    getAgenticStats() {
        return {
            maxTurns: this.agenticOptions.maxTurns,
            maxToolCalls: this.agenticOptions.maxToolCalls,
            timeout: this.agenticOptions.timeout / 1000 // Convert to seconds
        };
    }
    setupEventListeners() {
        // Set up agentic turn event listeners
        // These will be handled by the UI layer
    }
    isComplexTask(question) {
        const complexityIndicators = [
            'create', 'build', 'develop', 'implement', 'setup', 'configure', 'analyze', 'debug',
            'install', 'deploy', 'test', 'fix', 'optimize', 'refactor', 'migrate', 'generate',
            'find', 'search', 'organize', 'manage', 'process', 'convert', 'transform'
        ];
        const multiStepIndicators = [
            'and then', 'after that', 'next', 'also', 'furthermore', 'additionally',
            'first', 'second', 'third', 'step by step', 'multiple', 'several'
        ];
        const fileOperations = [
            'file', 'files', 'directory', 'folder', 'project', 'code', 'script',
            'document', 'config', 'configuration', 'package', 'module'
        ];
        const lowerQuestion = question.toLowerCase();
        // Check for complexity indicators
        const hasComplexity = complexityIndicators.some(indicator => lowerQuestion.includes(indicator));
        // Check for multi-step indicators
        const hasMultiStep = multiStepIndicators.some(indicator => lowerQuestion.includes(indicator));
        // Check for file operations
        const hasFileOps = fileOperations.some(indicator => lowerQuestion.includes(indicator));
        // Check for tool mentions
        const tools = this.toolManager.getTools();
        const hasToolMentions = tools.some(tool => lowerQuestion.includes(tool.name.toLowerCase()));
        // Check for multiple sentences (potential multi-step)
        const sentenceCount = question.split(/[.!?]+/).filter(s => s.trim()).length;
        const hasMultipleSentences = sentenceCount > 1;
        return hasComplexity || hasMultiStep || hasFileOps || hasToolMentions || hasMultipleSentences;
    }
    async askWithAgenticMode(question, options) {
        // Check if it's a system command first
        if (question.startsWith('/')) {
            return this.ask(question, options);
        }
        // Check if we should use agentic loop
        const useAgentic = this.agenticOptions.useAgenticLoop;
        const isComplexTask = this.isComplexTask(question);
        if (!useAgentic || !isComplexTask) {
            // Use normal chat for simple queries
            return this.ask(question, options);
        }
        // Use agentic loop for complex tasks
        return this.executeAgenticLoop(question, options);
    }
    async executeAgenticLoop(question, options) {
        const userMessage = {
            role: 'user',
            content: question,
            timestamp: new Date()
        };
        this.history.addMessage(userMessage);
        // Always show progress for unified mode
        if (this.agenticOptions.showProgress) {
            console.log(chalk.blue('🤖 AI analyzing task and executing until completion...\n'));
        }
        try {
            const chatOptions = {
                model: this.config.getCurrentModel(),
                temperature: this.config.getCurrentTemperature(),
                maxTokens: this.config.getCurrentMaxTokens(),
                systemPrompt: this.getUnifiedAgenticSystemPrompt(),
                ...options
            };
            let finalResponse = '';
            let turnCount = 0;
            // Execute agentic loop - AI will keep looping until task is complete
            for await (const event of this.agenticTurn.executeAgenticLoop(question, this.provider, chatOptions)) {
                switch (event.type) {
                    case 'turn_start':
                        if (this.agenticOptions.showProgress) {
                            console.log(chalk.cyan(`🚀 Turn ${turnCount + 1}: ${event.data.prompt}\n`));
                        }
                        break;
                    case 'ai_response':
                        turnCount = event.data.turn;
                        finalResponse = event.data.response;
                        if (this.agenticOptions.showProgress) {
                            console.log(chalk.white(`💭 AI Response: ${event.data.response}\n`));
                        }
                        break;
                    case 'tool_call_request':
                        if (this.agenticOptions.showProgress) {
                            console.log(chalk.yellow(`🔧 Executing: ${event.data.name}(${JSON.stringify(event.data.arguments)})`));
                        }
                        // Auto-confirm tools in unified mode for seamless experience
                        if (this.agenticOptions.requireConfirmation) {
                            const confirmed = await this.confirmToolExecution(event.data);
                            if (!confirmed) {
                                throw new Error('Tool execution cancelled by user');
                            }
                        }
                        break;
                    case 'tool_call_response':
                        if (this.agenticOptions.showProgress) {
                            if (event.data.error) {
                                console.log(chalk.red(`❌ ${event.data.name}: ${event.data.error}`));
                            }
                            else {
                                console.log(chalk.green(`✅ ${event.data.name}: Success`));
                            }
                        }
                        break;
                    case 'turn_complete':
                        if (this.agenticOptions.showProgress && event.data.isComplete) {
                            console.log(chalk.green(`\n🎯 Task completed in ${turnCount} turns!\n`));
                        }
                        break;
                    case 'error':
                        console.error(chalk.red(`❌ Error in turn ${event.data.turn}: ${event.data.error}`));
                        throw new Error(event.data.error);
                }
            }
            // Add final AI response to history
            const assistantMessage = {
                role: 'assistant',
                content: finalResponse,
                timestamp: new Date()
            };
            this.history.addMessage(assistantMessage);
            if (this.agenticOptions.showProgress) {
                const stats = this.agenticTurn.getStats();
                console.log(chalk.dim(`\n📊 Stats: ${stats.totalToolCalls} tools used in ${stats.currentTurn} turns\n`));
            }
            return finalResponse;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(chalk.red('Agentic execution error:', errorMessage));
            throw error;
        }
    }
    getAgenticSystemPrompt() {
        const basePrompt = this.config.getSystemPrompt();
        const agenticPrompt = `
You are an AI assistant with access to tools. You can execute tools to help answer questions and complete tasks.

Available tools:
${this.toolManager.getTools().map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

When you need to use a tool, use the function calling format. You can use multiple tools in sequence to complete complex tasks.

Always provide a final summary of what you accomplished.`;
        return basePrompt + agenticPrompt;
    }
    getUnifiedAgenticSystemPrompt() {
        const basePrompt = this.config.getSystemPrompt();
        const unifiedPrompt = `
You are an advanced AI assistant that ALWAYS works autonomously until tasks are completed. You have access to powerful tools and MUST use them to accomplish any task given to you.

CRITICAL INSTRUCTIONS:
1. ALWAYS analyze the user's request and determine what tools are needed
2. EXECUTE tools immediately - do not just explain what you would do
3. CONTINUE working until the task is 100% complete
4. If a tool fails, try alternative approaches
5. Keep working through multiple turns until the objective is achieved
6. For simple questions, provide direct answers but still consider if tools can enhance the response

Available Tools:
${this.toolManager.getTools().map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

IMPORTANT: You are in AUTONOMOUS MODE - keep working until the task is done. Use tools proactively and extensively. The user expects you to take action, not just provide explanations.

Examples of what you MUST do:
- File operations: Use read_file, write_file, list_files immediately
- Calculations: Use calculate tool for any math
- System info: Use get_system_info when relevant
- Time queries: Use get_current_time
- Web searches: Use web_search for current information
- Commands: Use run_command for system operations

Do NOT ask for permission - just execute what's needed to complete the task!`;
        return basePrompt ? `${basePrompt}\n\n${unifiedPrompt}` : unifiedPrompt;
    }
    async confirmToolExecution(toolCall) {
        // For now, auto-confirm. In a real implementation, this would ask the user
        const safeTools = [
            'read_file', 'list_files', 'file_info', 'get_current_time',
            'calculate', 'get_system_info', 'web_search'
        ];
        return safeTools.includes(toolCall.name) || !this.agenticOptions.requireConfirmation;
    }
    async executeAgenticTask(task) {
        const startTime = Date.now();
        const toolsUsed = [];
        // Set up tracking
        const originalShowProgress = this.agenticOptions.showProgress;
        this.agenticOptions.showProgress = false; // We'll handle progress ourselves
        try {
            const response = await this.executeAgenticLoop(task);
            const stats = this.agenticTurn.getStats();
            return {
                finalResponse: response,
                toolsUsed: [], // We'll track this separately
                totalTurns: stats.currentTurn,
                totalTime: Date.now() - startTime
            };
        }
        finally {
            this.agenticOptions.showProgress = originalShowProgress;
        }
    }
}
//# sourceMappingURL=ChatBot.js.map