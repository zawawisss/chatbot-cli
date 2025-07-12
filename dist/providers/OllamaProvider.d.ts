import { BaseProvider } from './BaseProvider.js';
import { ProviderType, Message, ChatOptions, ChatResponse, StreamResponse, ModelInfo, ProviderConfig } from './types.js';
export declare class OllamaProvider extends BaseProvider {
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
    pullModel(modelName: string): Promise<boolean>;
    deleteModel(modelName: string): Promise<boolean>;
    showModel(modelName: string): Promise<any>;
    private getOllamaTools;
    private supportsToolCalling;
}
//# sourceMappingURL=OllamaProvider.d.ts.map