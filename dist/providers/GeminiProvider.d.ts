import { BaseProvider } from './BaseProvider.js';
import { ProviderType, Message, ChatOptions, ChatResponse, StreamResponse, ModelInfo, ProviderConfig } from './types.js';
export declare class GeminiProvider extends BaseProvider {
    name: ProviderType;
    private genAI;
    private toolManager;
    constructor(config: ProviderConfig);
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
    streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamResponse>;
    listModels(): Promise<ModelInfo[]>;
    validateConfig(config: ProviderConfig): Promise<boolean>;
    protected getProviderDefaultModel(): string;
    private getDefaultModels;
    private getFunctionDeclarations;
    private convertToGeminiSchema;
    private supportsToolCalling;
}
//# sourceMappingURL=GeminiProvider.d.ts.map