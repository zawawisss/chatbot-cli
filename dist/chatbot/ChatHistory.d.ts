import { Message } from '../providers/types.js';
export declare class ChatHistory {
    private messages;
    private maxMessages;
    addMessage(message: Message): void;
    getMessages(): Message[];
    getLastMessage(): Message | undefined;
    getMessageCount(): number;
    clear(): void;
    getMessagesByRole(role: Message['role']): Message[];
    getRecentMessages(count: number): Message[];
    getMessagesByTimeRange(start: Date, end: Date): Message[];
    getStats(): {
        total: number;
        userMessages: number;
        assistantMessages: number;
        systemMessages: number;
        averageUserMessageLength: number;
        averageAssistantMessageLength: number;
    };
    export(): string;
    import(jsonData: string): void;
    truncateToTokenLimit(estimatedTokenLimit: number): void;
    setMaxMessages(max: number): void;
    getMaxMessages(): number;
}
//# sourceMappingURL=ChatHistory.d.ts.map