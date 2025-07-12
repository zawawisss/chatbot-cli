import { Provider, ProviderType, Message, ChatOptions, ChatResponse, StreamResponse, ModelInfo, ProviderConfig } from './types.js';
import { HumanIntentAnalyzer, HumanIntent, ConversationContext } from '../ai/HumanIntentAnalyzer.js';
import { PromptEnhancer } from '../ai/PromptEnhancer.js';
export declare abstract class BaseProvider implements Provider {
    abstract name: ProviderType;
    protected config: ProviderConfig;
    protected humanIntentAnalyzer: HumanIntentAnalyzer;
    protected promptEnhancer: PromptEnhancer;
    protected conversationHistory: Message[];
    constructor(config: ProviderConfig);
    abstract chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
    abstract streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamResponse>;
    abstract listModels(): Promise<ModelInfo[]>;
    abstract validateConfig(config: ProviderConfig): Promise<boolean>;
    protected formatMessages(messages: Message[], systemPrompt?: string): Message[];
    protected handleError(error: any): ChatResponse;
    protected makeRequest(url: string, options: RequestInit): Promise<Response>;
    protected validateRequiredConfig(requiredFields: string[]): void;
    protected getDefaultModel(): string;
    protected abstract getProviderDefaultModel(): string;
    protected analyzeHumanIntent(userMessage: string): HumanIntent;
    protected enhanceSystemPrompt(originalMessage: string, originalSystemPrompt?: string): string;
    protected getHumanAwareSystemPrompt(userMessage: string, originalSystemPrompt?: string): string;
    updateConversationFlow(flow: ConversationContext['conversationFlow']): void;
    markUserSatisfaction(satisfaction: ConversationContext['previousSatisfaction']): void;
    getConversationInsights(): {
        intent: HumanIntent | null;
        context: ConversationContext;
    };
}
//# sourceMappingURL=BaseProvider.d.ts.map