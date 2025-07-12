import { Config } from '../config/Config.js';
import { Provider, Message, ChatOptions, ModelInfo } from '../providers/types.js';
import { ChatHistory } from './ChatHistory.js';
import { ToolManager } from '../tools/ToolManager.js';
import { AgenticTurn } from '../core/AgenticTurn.js';
export interface AgenticChatOptions {
    useAgenticLoop?: boolean;
    maxTurns?: number;
    maxToolCalls?: number;
    timeout?: number;
    requireConfirmation?: boolean;
    showProgress?: boolean;
    debug?: boolean;
}
export declare class ChatBot {
    protected config: Config;
    protected provider: Provider;
    protected history: ChatHistory;
    protected toolManager: ToolManager;
    protected agenticTurn: AgenticTurn;
    protected agenticOptions: AgenticChatOptions;
    constructor(config: Config, agenticOptions?: AgenticChatOptions);
    private createProvider;
    switchProvider(providerType: string): Promise<void>;
    ask(question: string, options?: ChatOptions): Promise<string>;
    askStream(question: string, options?: ChatOptions): AsyncGenerator<string>;
    listModels(): Promise<string[]>;
    getModelInfo(): Promise<ModelInfo[]>;
    clearHistory(): void;
    getHistory(): Message[];
    getConversationSummary(): string;
    getCurrentProvider(): string;
    getCurrentModel(): string;
    getCurrentConfig(): any;
    getAvailableTools(): Promise<any[]>;
    validateCurrentProvider(): Promise<boolean>;
    executeSystemCommand(command: string, args: string[]): Promise<string>;
    private getHelpText;
    setAgenticMode(enabled: boolean): void;
    isAgenticModeEnabled(): boolean;
    updateAgenticOptions(options: Partial<AgenticChatOptions>): void;
    getAgenticStats(): {
        maxTurns: number;
        maxToolCalls: number;
        timeout: number;
    };
    private setupEventListeners;
    private isComplexTask;
    askWithAgenticMode(question: string, options?: ChatOptions): Promise<string>;
    private executeAgenticLoop;
    protected getAgenticSystemPrompt(): string;
    protected getUnifiedAgenticSystemPrompt(): string;
    protected confirmToolExecution(toolCall: any): Promise<boolean>;
    executeAgenticTask(task: string): Promise<{
        finalResponse: string;
        toolsUsed: string[];
        totalTurns: number;
        totalTime: number;
    }>;
}
//# sourceMappingURL=ChatBot.d.ts.map