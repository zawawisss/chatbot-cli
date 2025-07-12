import { GeminiProvider } from './GeminiProvider.js';
import { DeepSeekProvider } from './DeepSeekProvider.js';
import { OllamaProvider } from './OllamaProvider.js';
export class ProviderFactory {
    static createProvider(type, config) {
        switch (type) {
            case 'gemini':
                return new GeminiProvider(config);
            case 'deepseek':
                return new DeepSeekProvider(config);
            case 'ollama':
                return new OllamaProvider(config);
            default:
                throw new Error(`Unsupported provider type: ${type}`);
        }
    }
    static getSupportedProviders() {
        return ['gemini', 'deepseek', 'ollama'];
    }
    static getProviderDescription(type) {
        switch (type) {
            case 'gemini':
                return 'Google Gemini - Advanced AI model with multimodal capabilities';
            case 'deepseek':
                return 'DeepSeek - High-performance AI model for coding and reasoning';
            case 'ollama':
                return 'Ollama - Local AI models running on your machine';
            default:
                return 'Unknown provider';
        }
    }
    static getDefaultConfig(type) {
        switch (type) {
            case 'gemini':
                return {
                    apiKey: process.env.GEMINI_API_KEY || '',
                    model: 'gemini-2.5-flash',
                    temperature: 0.7,
                    maxTokens: 4096
                };
            case 'deepseek':
                return {
                    apiKey: process.env.DEEPSEEK_API_KEY || '',
                    baseUrl: 'https://api.deepseek.com/v1',
                    model: 'deepseek-chat',
                    temperature: 0.7,
                    maxTokens: 4096
                };
            case 'ollama':
                return {
                    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
                    model: 'llama3.2:latest',
                    temperature: 0.7,
                    maxTokens: 4096
                };
            default:
                return {};
        }
    }
}
//# sourceMappingURL=ProviderFactory.js.map