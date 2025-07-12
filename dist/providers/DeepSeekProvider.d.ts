import { BaseProvider } from './BaseProvider.js';
import { ProviderType, Message, ChatOptions, ChatResponse, StreamResponse, ModelInfo, ProviderConfig } from './types.js';
export declare class DeepSeekProvider extends BaseProvider {
    name: ProviderType;
    private client;
    private toolManager;
    constructor(config: ProviderConfig);
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
    streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamResponse>;
    listModels(): Promise<ModelInfo[]>;
    validateConfig(config: ProviderConfig): Promise<boolean>;
    protected getProviderDefaultModel(): string;
    private getDefaultModels;
    private getOpenAITools;
    private supportsToolCalling;
}
//# sourceMappingURL=DeepSeekProvider.d.ts.map