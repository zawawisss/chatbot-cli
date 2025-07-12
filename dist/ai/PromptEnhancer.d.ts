import { HumanIntent, ConversationContext } from './HumanIntentAnalyzer.js';
import { Message } from '../providers/types.js';
export interface EnhancedPrompt {
    enhancedSystemPrompt: string;
    contextualInstructions: string[];
    toneAdjustments: string[];
    responseStrategy: string;
}
export declare class PromptEnhancer {
    private baseSystemPrompt;
    enhancePrompt(originalMessage: string, intent: HumanIntent, context: ConversationContext, history?: Message[]): EnhancedPrompt;
    private buildEnhancedSystemPrompt;
    private generateContextualInstructions;
    private generateToneAdjustments;
    private determineResponseStrategy;
    generateFinalSystemPrompt(enhancedPrompt: EnhancedPrompt): string;
}
//# sourceMappingURL=PromptEnhancer.d.ts.map