import { Provider, ProviderType, ProviderConfig } from './types.js';
export declare class ProviderFactory {
    static createProvider(type: ProviderType, config: ProviderConfig): Provider;
    static getSupportedProviders(): ProviderType[];
    static getProviderDescription(type: ProviderType): string;
    static getDefaultConfig(type: ProviderType): Partial<ProviderConfig>;
}
//# sourceMappingURL=ProviderFactory.d.ts.map