import { Provider, ProviderType, Message, ChatOptions, ChatResponse, StreamResponse, ModelInfo, ProviderConfig } from './types.js';
import { HumanIntentAnalyzer, HumanIntent, ConversationContext } from '../ai/HumanIntentAnalyzer.js';
import { PromptEnhancer, EnhancedPrompt } from '../ai/PromptEnhancer.js';

export abstract class BaseProvider implements Provider {
  abstract name: ProviderType;
  protected config: ProviderConfig;
  protected humanIntentAnalyzer: HumanIntentAnalyzer;
  protected promptEnhancer: PromptEnhancer;
  protected conversationHistory: Message[] = [];

  constructor(config: ProviderConfig) {
    this.config = config;
    this.humanIntentAnalyzer = new HumanIntentAnalyzer();
    this.promptEnhancer = new PromptEnhancer();
  }

  abstract chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  abstract streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamResponse>;
  abstract listModels(): Promise<ModelInfo[]>;
  abstract validateConfig(config: ProviderConfig): Promise<boolean>;

  protected formatMessages(messages: Message[], systemPrompt?: string): Message[] {
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

  protected handleError(error: any): ChatResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: '',
      error: errorMessage
    };
  }

  protected async makeRequest(url: string, options: RequestInit): Promise<Response> {
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
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected validateRequiredConfig(requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!this.config[field as keyof ProviderConfig]) {
        throw new Error(`Required configuration field missing: ${field}`);
      }
    }
  }

  protected getDefaultModel(): string {
    return this.config.model || this.getProviderDefaultModel();
  }

  protected abstract getProviderDefaultModel(): string;

  // Human-aware intelligence methods
  protected analyzeHumanIntent(userMessage: string): HumanIntent {
    return this.humanIntentAnalyzer.analyzeIntent(userMessage, this.conversationHistory);
  }

  protected enhanceSystemPrompt(originalMessage: string, originalSystemPrompt?: string): string {
    const intent = this.analyzeHumanIntent(originalMessage);
    const context = this.humanIntentAnalyzer.getConversationContext();
    
    const enhancedPrompt = this.promptEnhancer.enhancePrompt(
      originalMessage,
      intent,
      context,
      this.conversationHistory
    );
    
    // If original system prompt exists, enhance it; otherwise create new one
    if (originalSystemPrompt) {
      return `${originalSystemPrompt}\n\n${this.promptEnhancer.generateFinalSystemPrompt(enhancedPrompt)}`;
    } else {
      return this.promptEnhancer.generateFinalSystemPrompt(enhancedPrompt);
    }
  }

  protected getHumanAwareSystemPrompt(userMessage: string, originalSystemPrompt?: string): string {
    if (this.config.humanAware !== false) { // Default to true unless explicitly disabled
      return this.enhanceSystemPrompt(userMessage, originalSystemPrompt);
    }
    return originalSystemPrompt || 'You are a helpful AI assistant.';
  }

  // Method to manually update conversation context
  updateConversationFlow(flow: ConversationContext['conversationFlow']): void {
    this.humanIntentAnalyzer.updateConversationFlow(flow);
  }

  // Method to mark user satisfaction for learning
  markUserSatisfaction(satisfaction: ConversationContext['previousSatisfaction']): void {
    this.humanIntentAnalyzer.markSatisfaction(satisfaction);
  }

  // Get current conversation insights
  getConversationInsights(): { intent: HumanIntent | null, context: ConversationContext } {
    const lastUserMessage = this.conversationHistory
      .filter(m => m.role === 'user')
      .pop();
    
    const intent = lastUserMessage ? this.analyzeHumanIntent(lastUserMessage.content) : null;
    const context = this.humanIntentAnalyzer.getConversationContext();
    
    return { intent, context };
  }
}
