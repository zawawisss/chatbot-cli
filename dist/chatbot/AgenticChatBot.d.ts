/**
 * Agentic ChatBot
 * Enhanced ChatBot with agentic loop capabilities similar to Gemini CLI
 */
import { ChatBot } from './ChatBot.js';
import { AgenticTurn } from '../core/AgenticTurn.js';
import { Config } from '../config/Config.js';
export interface AgenticChatOptions {
    useAgenticLoop?: boolean;
    maxTurns?: number;
    maxToolCalls?: number;
    timeout?: number;
    requireConfirmation?: boolean;
    showProgress?: boolean;
    debug?: boolean;
}
export declare class AgenticChatBot extends ChatBot {
    protected agenticTurn: AgenticTurn;
    protected agenticOptions: AgenticChatOptions;
    constructor(config: Config, options?: AgenticChatOptions);
    /**
     * Enhanced ask method with agentic loop
     */
    ask(question: string, options?: any): Promise<string>;
    /**
     * Ask with agentic loop
     */
    askWithAgenticLoop(question: string, options?: any): Promise<string>;
    /**
     * Stream version with agentic loop
     */
    askStreamWithAgenticLoop(question: string, options?: any): AsyncGenerator<string>;
    /**
     * Check if task is complex enough for agentic loop
     */
    private isComplexAgenticTask;
    /**
     * Get enhanced system prompt for agentic mode
     */
    protected getAgenticSystemPrompt(): string;
    /**
     * Confirm tool execution with user
     */
    protected confirmToolExecution(toolCall: any): Promise<boolean>;
    /**
     * Setup event listeners for monitoring
     */
    private setupAgenticEventListeners;
    /**
     * Enable/disable agentic mode
     */
    setAgenticMode(enabled: boolean): void;
    /**
     * Get agentic statistics
     */
    getAgenticStats(): {
        maxTurns: number;
        maxToolCalls: number;
        timeout: number;
    };
    /**
     * Configure agentic options
     */
    setAgenticOptions(options: Partial<AgenticChatOptions>): void;
    /**
     * Check if agentic mode is enabled
     */
    isAgenticModeEnabled(): boolean;
    /**
     * Execute a complete agentic task
     */
    executeAgenticTask(task: string): Promise<{
        finalResponse: string;
        toolsUsed: string[];
        totalTurns: number;
        totalTime: number;
    }>;
}
//# sourceMappingURL=AgenticChatBot.d.ts.map