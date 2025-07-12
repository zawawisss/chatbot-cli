import { ProviderType, ProviderConfig } from '../providers/types.js';
export interface AppConfig {
    provider: ProviderType;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    debug?: boolean;
    providers: {
        [K in ProviderType]?: ProviderConfig;
    };
}
export declare class Config {
    private config;
    private configPath;
    private defaultConfigPath;
    constructor(configPath?: string);
    private getDefaultConfig;
    load(): Promise<void>;
    save(): Promise<void>;
    get<K extends keyof AppConfig>(key: K): AppConfig[K];
    set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void;
    getProviderConfig(provider?: ProviderType): ProviderConfig;
    setProviderConfig(provider: ProviderType, config: Partial<ProviderConfig>): void;
    validateProvider(provider: ProviderType): Promise<boolean>;
    validateAllProviders(): Promise<{
        [K in ProviderType]: boolean;
    }>;
    getConfigPath(): string;
    getFullConfig(): AppConfig;
    reset(): void;
    getCurrentModel(): string;
    getCurrentTemperature(): number;
    getCurrentMaxTokens(): number;
    getSystemPrompt(): string;
    isDebugEnabled(): boolean;
}
//# sourceMappingURL=Config.d.ts.map