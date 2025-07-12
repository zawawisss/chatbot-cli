import { Message } from '../providers/types.js';
export interface HumanIntent {
    type: 'question' | 'request' | 'emotional' | 'creative' | 'problem_solving' | 'learning' | 'urgent' | 'casual';
    confidence: number;
    emotion?: 'frustrated' | 'excited' | 'confused' | 'urgent' | 'curious' | 'grateful' | 'neutral';
    complexity: 'simple' | 'medium' | 'complex';
    urgency: 'low' | 'medium' | 'high';
    context?: string;
    suggestedApproach: string[];
}
export interface ConversationContext {
    userMood: 'positive' | 'negative' | 'neutral' | 'mixed';
    conversationFlow: 'introduction' | 'deep_dive' | 'problem_solving' | 'wrap_up';
    userExpertiseLevel: 'beginner' | 'intermediate' | 'expert' | 'unknown';
    topicContinuity: boolean;
    previousSatisfaction: 'satisfied' | 'unsatisfied' | 'neutral';
}
export declare class HumanIntentAnalyzer {
    private conversationHistory;
    private currentContext;
    private emotionalPatterns;
    private complexityPatterns;
    private urgencyPatterns;
    private learningPatterns;
    private professionalPatterns;
    analyzeIntent(message: string, history?: Message[]): HumanIntent;
    private detectIntentType;
    private detectEmotion;
    private detectComplexity;
    private detectUrgency;
    private analyzeContext;
    private updateConversationContext;
    private generateApproachSuggestions;
    getConversationContext(): ConversationContext;
    updateConversationFlow(flow: ConversationContext['conversationFlow']): void;
    markSatisfaction(satisfaction: ConversationContext['previousSatisfaction']): void;
}
//# sourceMappingURL=HumanIntentAnalyzer.d.ts.map