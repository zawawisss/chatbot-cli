export interface ConversationMessage {
    id: string;
    timestamp: Date;
    role: 'user' | 'assistant' | 'system';
    content: string;
    provider: string;
    model: string;
    toolCalls?: any[];
    metadata?: Record<string, any>;
}
export interface ConversationSession {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    provider: string;
    model: string;
    messages: ConversationMessage[];
    settings: {
        temperature: number;
        maxTokens?: number;
        systemPrompt?: string;
    };
}
export declare class ConversationManager {
    private conversationsDir;
    private currentSession;
    constructor();
    private ensureConversationsDir;
    createSession(provider: string, model: string, name?: string): Promise<ConversationSession>;
    loadSession(sessionId: string): Promise<ConversationSession | null>;
    saveSession(session?: ConversationSession): Promise<void>;
    addMessage(role: 'user' | 'assistant' | 'system', content: string, toolCalls?: any[], metadata?: Record<string, any>): Promise<ConversationMessage>;
    getConversationHistory(limit?: number): ConversationMessage[];
    listSessions(): Promise<ConversationSession[]>;
    deleteSession(sessionId: string): Promise<boolean>;
    exportSession(sessionId: string, format?: 'json' | 'txt' | 'markdown'): Promise<string>;
    private formatSessionAsText;
    private formatSessionAsMarkdown;
    getCurrentSession(): ConversationSession | null;
    clearCurrentSession(): void;
    private generateSessionId;
    private generateMessageId;
    getSessionSummary(): Promise<string>;
}
//# sourceMappingURL=ConversationManager.d.ts.map