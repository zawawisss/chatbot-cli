import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { ProviderFactory } from '../providers/ProviderFactory.js';
export class Config {
    config;
    configPath;
    defaultConfigPath;
    constructor(configPath) {
        this.defaultConfigPath = join(homedir(), '.chatbot-cli', 'config.json');
        this.configPath = configPath || this.defaultConfigPath;
        this.config = this.getDefaultConfig();
    }
    getDefaultConfig() {
        return {
            provider: 'gemini',
            model: undefined,
            temperature: 0.7,
            maxTokens: 4096,
            systemPrompt: 'You are a helpful AI assistant.',
            debug: false,
            providers: {
                gemini: {
                    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyBOmrrmbsgTCZRG7Q5i21MPRmnfSAQGBZQ',
                    model: 'gemini-2.5-flash',
                    temperature: 0.7,
                    maxTokens: 4096
                },
                deepseek: {
                    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-1d04ba5a6dd2403f8d17e9e6ae67ba31',
                    baseUrl: 'https://api.deepseek.com/v1',
                    model: 'deepseek-chat',
                    temperature: 0.7,
                    maxTokens: 4096
                },
                ollama: {
                    baseUrl: process.env.OLLAMA_BASE_URL || 'https://evident-ultimately-collie.ngrok-free.app',
                    model: 'llama3.2:latest',
                    temperature: 0.7,
                    maxTokens: 4096
                }
            }
        };
    }
    async load() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf8');
            const loadedConfig = JSON.parse(configData);
            // Merge with default config to ensure all required fields are present
            this.config = {
                ...this.getDefaultConfig(),
                ...loadedConfig,
                providers: {
                    ...this.getDefaultConfig().providers,
                    ...loadedConfig.providers
                }
            };
            if (this.config.debug) {
                console.log('Config loaded from:', this.configPath);
            }
        }
        catch (error) {
            if (this.config.debug) {
                console.log('Config file not found, using defaults:', this.configPath);
            }
            // Use default config and save it
            await this.save();
        }
    }
    async save() {
        try {
            // Ensure config directory exists
            const configDir = join(this.configPath, '..');
            await fs.mkdir(configDir, { recursive: true });
            await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
            if (this.config.debug) {
                console.log('Config saved to:', this.configPath);
            }
        }
        catch (error) {
            console.error('Error saving config:', error);
        }
    }
    get(key) {
        return this.config[key];
    }
    set(key, value) {
        this.config[key] = value;
    }
    getProviderConfig(provider) {
        const currentProvider = provider || this.config.provider;
        const providerConfig = this.config.providers[currentProvider];
        if (!providerConfig) {
            throw new Error(`No configuration found for provider: ${currentProvider}`);
        }
        return {
            ...providerConfig,
            model: this.config.model || providerConfig.model,
            temperature: this.config.temperature !== undefined ? this.config.temperature : providerConfig.temperature,
            maxTokens: this.config.maxTokens !== undefined ? this.config.maxTokens : providerConfig.maxTokens,
            debug: this.config.debug
        };
    }
    setProviderConfig(provider, config) {
        this.config.providers[provider] = {
            ...this.config.providers[provider],
            ...config
        };
    }
    async validateProvider(provider) {
        try {
            const providerConfig = this.getProviderConfig(provider);
            const providerInstance = ProviderFactory.createProvider(provider, providerConfig);
            return await providerInstance.validateConfig(providerConfig);
        }
        catch (error) {
            if (this.config.debug) {
                console.error(`Provider validation failed for ${provider}:`, error);
            }
            return false;
        }
    }
    async validateAllProviders() {
        const results = {};
        for (const provider of ProviderFactory.getSupportedProviders()) {
            results[provider] = await this.validateProvider(provider);
        }
        return results;
    }
    getConfigPath() {
        return this.configPath;
    }
    getFullConfig() {
        return { ...this.config };
    }
    reset() {
        this.config = this.getDefaultConfig();
    }
    // Utility methods for common operations
    getCurrentModel() {
        const providerConfig = this.getProviderConfig();
        return this.config.model || providerConfig.model || 'default';
    }
    getCurrentTemperature() {
        return this.config.temperature || 0.7;
    }
    getCurrentMaxTokens() {
        return this.config.maxTokens || 4096;
    }
    getSystemPrompt() {
        return this.config.systemPrompt || 'You are a helpful AI assistant.';
    }
    isDebugEnabled() {
        return this.config.debug || false;
    }
}
//# sourceMappingURL=Config.js.map