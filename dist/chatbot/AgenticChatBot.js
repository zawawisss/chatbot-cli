/**
 * Agentic ChatBot
 * Enhanced ChatBot with agentic loop capabilities similar to Gemini CLI
 */
import { ChatBot } from './ChatBot.js';
import { AgenticTurn, TurnEventType } from '../core/AgenticTurn.js';
import chalk from 'chalk';
export class AgenticChatBot extends ChatBot {
    agenticTurn;
    agenticOptions;
    constructor(config, options = {}) {
        super(config);
        this.agenticOptions = {
            useAgenticLoop: options.useAgenticLoop ?? true,
            maxTurns: options.maxTurns ?? 10,
            maxToolCalls: options.maxToolCalls ?? 50,
            timeout: options.timeout ?? 300000,
            requireConfirmation: options.requireConfirmation ?? false,
            showProgress: options.showProgress ?? true,
            debug: options.debug ?? false
        };
        this.agenticTurn = new AgenticTurn(this.toolManager, this.history, {
            maxTurns: this.agenticOptions.maxTurns,
            maxToolCalls: this.agenticOptions.maxToolCalls,
            timeout: this.agenticOptions.timeout,
            debug: this.agenticOptions.debug
        });
        this.setupAgenticEventListeners();
    }
    /**
     * Enhanced ask method with agentic loop
     */
    async ask(question, options = {}) {
        // Check if it's a system command first
        if (question.startsWith('/')) {
            return super.ask(question, options);
        }
        // Check if we should use agentic loop
        const useAgentic = options.useAgenticLoop ?? this.agenticOptions.useAgenticLoop;
        const isComplexTask = this.isComplexAgenticTask(question);
        if (!useAgentic || !isComplexTask) {
            // Use normal chat for simple queries
            return super.ask(question, options);
        }
        // Use agentic loop for complex tasks
        return this.askWithAgenticLoop(question, options);
    }
    /**
     * Ask with agentic loop
     */
    async askWithAgenticLoop(question, options = {}) {
        const userMessage = {
            role: 'user',
            content: question,
            timestamp: new Date()
        };
        this.history.addMessage(userMessage);
        if (this.agenticOptions.showProgress) {
            console.log(chalk.blue('\n🔄 Starting agentic task execution...\n'));
        }
        try {
            const chatOptions = {
                model: this.config.getCurrentModel(),
                temperature: this.config.getCurrentTemperature(),
                maxTokens: this.config.getCurrentMaxTokens(),
                systemPrompt: this.getAgenticSystemPrompt(),
                ...options
            };
            let finalResponse = '';
            let turnCount = 0;
            // Execute agentic loop
            for await (const event of this.agenticTurn.executeAgenticLoop(question, this.provider, chatOptions)) {
                switch (event.type) {
                    case TurnEventType.TurnStart:
                        if (this.agenticOptions.showProgress) {
                            console.log(chalk.cyan(`🚀 Task: ${event.data.prompt}\n`));
                        }
                        break;
                    case TurnEventType.AIResponse:
                        turnCount = event.data.turn;
                        finalResponse = event.data.response;
                        if (this.agenticOptions.showProgress) {
                            console.log(chalk.white(`💭 Turn ${turnCount}: ${event.data.response}\n`));
                        }
                        break;
                    case TurnEventType.ToolCallRequest:
                        if (this.agenticOptions.showProgress) {
                            console.log(chalk.yellow(`🔧 Executing: ${event.data.name}(${JSON.stringify(event.data.arguments)})`));
                        }
                        // Ask for confirmation if enabled
                        if (this.agenticOptions.requireConfirmation) {
                            const confirmed = await this.confirmToolExecution(event.data);
                            if (!confirmed) {
                                throw new Error('Tool execution cancelled by user');
                            }
                        }
                        break;
                    case TurnEventType.ToolCallResponse:
                        if (this.agenticOptions.showProgress) {
                            if (event.data.error) {
                                console.log(chalk.red(`❌ ${event.data.name}: ${event.data.error}`));
                            }
                            else {
                                console.log(chalk.green(`✅ ${event.data.name}: Success`));
                            }
                        }
                        break;
                    case TurnEventType.TurnComplete:
                        if (this.agenticOptions.showProgress && event.data.isComplete) {
                            console.log(chalk.green(`\n🎯 Task completed in ${turnCount} turns!\n`));
                        }
                        break;
                    case TurnEventType.Error:
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
    /**
     * Stream version with agentic loop
     */
    async *askStreamWithAgenticLoop(question, options = {}) {
        const userMessage = {
            role: 'user',
            content: question,
            timestamp: new Date()
        };
        this.history.addMessage(userMessage);
        const chatOptions = {
            model: this.config.getCurrentModel(),
            temperature: this.config.getCurrentTemperature(),
            maxTokens: this.config.getCurrentMaxTokens(),
            systemPrompt: this.getAgenticSystemPrompt(),
            ...options
        };
        let fullResponse = '';
        try {
            for await (const event of this.agenticTurn.executeAgenticLoop(question, this.provider, chatOptions)) {
                switch (event.type) {
                    case TurnEventType.AIResponse:
                        // Stream the AI response
                        const response = event.data.response;
                        for (let i = 0; i < response.length; i += 10) {
                            const chunk = response.slice(i, i + 10);
                            yield chunk;
                            await new Promise(resolve => setTimeout(resolve, 10)); // Simulate streaming
                        }
                        fullResponse = response;
                        break;
                    case TurnEventType.ToolCallRequest:
                        yield `\n🔧 ${event.data.name}(${JSON.stringify(event.data.arguments)})\n`;
                        break;
                    case TurnEventType.ToolCallResponse:
                        if (event.data.error) {
                            yield `❌ Error: ${event.data.error}\n`;
                        }
                        else {
                            yield `✅ Success\n`;
                        }
                        break;
                    case TurnEventType.TurnComplete:
                        if (event.data.isComplete) {
                            yield '\n🎯 Task completed!\n';
                        }
                        break;
                }
            }
            // Add final response to history
            const assistantMessage = {
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date()
            };
            this.history.addMessage(assistantMessage);
        }
        catch (error) {
            yield `\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`;
            throw error;
        }
    }
    /**
     * Check if task is complex enough for agentic loop
     */
    isComplexAgenticTask(question) {
        const complexityIndicators = [
            // Multi-step tasks
            'create', 'build', 'develop', 'implement', 'setup', 'configure',
            'analyze', 'optimize', 'refactor', 'migrate', 'install',
            // File operations
            'file', 'directory', 'folder', 'project', 'repository',
            // System operations  
            'run', 'execute', 'command', 'script', 'process',
            // Complex analysis
            'debug', 'troubleshoot', 'investigate', 'research', 'compare',
            // Workflow indicators
            'step', 'then', 'after', 'next', 'following', 'sequence',
            // Conjunction words indicating multiple tasks
            'and', 'also', 'then', 'additionally', 'furthermore'
        ];
        const lowerQuestion = question.toLowerCase();
        // Check for complexity indicators
        const hasComplexityIndicators = complexityIndicators.some(indicator => lowerQuestion.includes(indicator));
        // Check for multiple sentences (potential multi-step)
        const sentenceCount = question.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const hasMultipleSentences = sentenceCount > 1;
        // Check for tool-related keywords
        const availableTools = this.toolManager.getToolNames();
        const mentionsTools = availableTools.some(tool => lowerQuestion.includes(tool.replace('_', ' ')));
        // Complex if has indicators, multiple sentences, or mentions tools
        return hasComplexityIndicators || hasMultipleSentences || mentionsTools;
    }
    /**
     * Get enhanced system prompt for agentic mode
     */
    getAgenticSystemPrompt() {
        const basePrompt = this.config.getSystemPrompt();
        const agenticPrompt = `
You are an advanced AI assistant with access to powerful tools. You MUST execute multiple actions in sequence to complete complex tasks autonomously.

CRITICAL INSTRUCTIONS:
1. ALWAYS use the appropriate tools to complete tasks - do not just explain what you would do
2. When given a file operation task, IMMEDIATELY use write_file, read_file, list_files, or delete_file tools
3. Break down complex tasks into smaller steps and execute each step with tools
4. Continue working until the task is fully completed
5. If a tool fails, try alternative approaches
6. Always verify your work using available tools

Available Tools:
${this.toolManager.getTools().map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

IMPORTANT: You have access to function calling. Use the tools directly rather than just describing what you would do. 
For example:
- To create a file: Use write_file function immediately
- To check files: Use list_files function immediately  
- To delete files: Use delete_file function immediately

Do NOT just explain - ACT by using the tools!
`;
        return basePrompt ? `${basePrompt}\n\n${agenticPrompt}` : agenticPrompt;
    }
    /**
     * Confirm tool execution with user
     */
    async confirmToolExecution(toolCall) {
        // In a real implementation, you'd prompt the user
        // For now, we'll auto-confirm non-destructive tools
        const safeTool = [
            'read_file', 'list_files', 'file_info', 'get_current_time',
            'calculate', 'get_system_info', 'web_search'
        ].includes(toolCall.name);
        if (safeTool) {
            return true;
        }
        // For destructive tools, we'd normally prompt the user
        console.log(chalk.yellow(`⚠️  Confirm execution of ${toolCall.name}? (auto-confirmed for demo)`));
        return true;
    }
    /**
     * Setup event listeners for monitoring
     */
    setupAgenticEventListeners() {
        if (this.agenticOptions.debug) {
            this.agenticTurn.addEventListener(TurnEventType.TurnStart, (event) => {
                console.log(chalk.dim(`[DEBUG] Turn started: ${JSON.stringify(event.data)}`));
            });
            this.agenticTurn.addEventListener(TurnEventType.ToolCallRequest, (event) => {
                console.log(chalk.dim(`[DEBUG] Tool requested: ${event.data.name}`));
            });
            this.agenticTurn.addEventListener(TurnEventType.ToolCallResponse, (event) => {
                console.log(chalk.dim(`[DEBUG] Tool completed: ${event.data.name} - ${event.data.error ? 'Error' : 'Success'}`));
            });
        }
    }
    /**
     * Enable/disable agentic mode
     */
    setAgenticMode(enabled) {
        this.agenticOptions.useAgenticLoop = enabled;
    }
    /**
     * Get agentic statistics
     */
    getAgenticStats() {
        return {
            maxTurns: this.agenticOptions.maxTurns,
            maxToolCalls: this.agenticOptions.maxToolCalls,
            timeout: this.agenticOptions.timeout / 1000 // Convert to seconds
        };
    }
    /**
     * Configure agentic options
     */
    setAgenticOptions(options) {
        this.agenticOptions = {
            ...this.agenticOptions,
            ...options
        };
        // Recreate agentic turn with new options
        this.agenticTurn = new AgenticTurn(this.toolManager, this.history, {
            maxTurns: this.agenticOptions.maxTurns,
            maxToolCalls: this.agenticOptions.maxToolCalls,
            timeout: this.agenticOptions.timeout,
            debug: this.agenticOptions.debug
        });
        this.setupAgenticEventListeners();
    }
    /**
     * Check if agentic mode is enabled
     */
    isAgenticModeEnabled() {
        return this.agenticOptions.useAgenticLoop ?? false;
    }
    /**
     * Execute a complete agentic task
     */
    async executeAgenticTask(task) {
        const startTime = Date.now();
        const toolsUsed = new Set();
        const userMessage = {
            role: 'user',
            content: task,
            timestamp: new Date()
        };
        this.history.addMessage(userMessage);
        const chatOptions = {
            model: this.config.getCurrentModel(),
            temperature: this.config.getCurrentTemperature(),
            maxTokens: this.config.getCurrentMaxTokens(),
            systemPrompt: this.getAgenticSystemPrompt()
        };
        let finalResponse = '';
        let totalTurns = 0;
        try {
            // Execute agentic loop
            for await (const event of this.agenticTurn.executeAgenticLoop(task, this.provider, chatOptions)) {
                switch (event.type) {
                    case TurnEventType.AIResponse:
                        finalResponse = event.data.response;
                        totalTurns = event.data.turn;
                        break;
                    case TurnEventType.ToolCallRequest:
                        toolsUsed.add(event.data.name);
                        break;
                    case TurnEventType.Error:
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
            const totalTime = Date.now() - startTime;
            return {
                finalResponse,
                toolsUsed: Array.from(toolsUsed),
                totalTurns,
                totalTime
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Agentic task execution failed: ${errorMessage}`);
        }
    }
}
//# sourceMappingURL=AgenticChatBot.js.map