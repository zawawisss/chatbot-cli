import { HumanIntentAnalyzer } from '../ai/HumanIntentAnalyzer.js';
import { PromptEnhancer } from '../ai/PromptEnhancer.js';
export class BaseProvider {
    config;
    humanIntentAnalyzer;
    promptEnhancer;
    conversationHistory = [];
    constructor(config) {
        this.config = config;
        this.humanIntentAnalyzer = new HumanIntentAnalyzer();
        this.promptEnhancer = new PromptEnhancer();
    }
    formatMessages(messages, systemPrompt) {
        const formatted = [...messages];
        // Store conversation history for intent analysis
        this.conversationHistory = [...messages];
        // Add system prompt if provided and not already present
        if (systemPrompt && !formatted.some(m => m.role === 'system')) {
            formatted.unshift({
                role: 'system',
                content: systemPrompt,
                timestamp: new Date()
            });
        }
        return formatted;
    }
    handleError(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: '',
            error: errorMessage
        };
    }
    async makeRequest(url, options) {
        const timeout = this.config.timeout || 30000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        }
        catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    validateRequiredConfig(requiredFields) {
        for (const field of requiredFields) {
            if (!this.config[field]) {
                throw new Error(`Required configuration field missing: ${field}`);
            }
        }
    }
    getDefaultModel() {
        return this.config.model || this.getProviderDefaultModel();
    }
    // Human-aware intelligence methods
    analyzeHumanIntent(userMessage) {
        return this.humanIntentAnalyzer.analyzeIntent(userMessage, this.conversationHistory);
    }
    enhanceSystemPrompt(originalMessage, originalSystemPrompt) {
        const intent = this.analyzeHumanIntent(originalMessage);
        const context = this.humanIntentAnalyzer.getConversationContext();
        const enhancedPrompt = this.promptEnhancer.enhancePrompt(originalMessage, intent, context, this.conversationHistory);
        // If original system prompt exists, enhance it; otherwise create new one
        if (originalSystemPrompt) {
            return `${originalSystemPrompt}\n\n${this.promptEnhancer.generateFinalSystemPrompt(enhancedPrompt)}`;
        }
        else {
            return this.promptEnhancer.generateFinalSystemPrompt(enhancedPrompt);
        }
    }
    getHumanAwareSystemPrompt(userMessage, originalSystemPrompt) {
        if (this.config.humanAware !== false) { // Default to true unless explicitly disabled
            return this.enhanceSystemPrompt(userMessage, originalSystemPrompt);
        }
        return originalSystemPrompt || 'You are a helpful AI assistant.';
    }
    // Method to manually update conversation context
    updateConversationFlow(flow) {
        this.humanIntentAnalyzer.updateConversationFlow(flow);
    }
    // Method to mark user satisfaction for learning
    markUserSatisfaction(satisfaction) {
        this.humanIntentAnalyzer.markSatisfaction(satisfaction);
    }
    // Get current conversation insights
    getConversationInsights() {
        const lastUserMessage = this.conversationHistory
            .filter(m => m.role === 'user')
            .pop();
        const intent = lastUserMessage ? this.analyzeHumanIntent(lastUserMessage.content) : null;
        const context = this.humanIntentAnalyzer.getConversationContext();
        return { intent, context };
    }
}
//# sourceMappingURL=BaseProvider.js.map