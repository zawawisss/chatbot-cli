export class ChatHistory {
    messages = [];
    maxMessages = 100; // Limit to prevent memory issues
    addMessage(message) {
        this.messages.push(message);
        // Keep only the last maxMessages messages
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }
    }
    getMessages() {
        return [...this.messages];
    }
    getLastMessage() {
        return this.messages[this.messages.length - 1];
    }
    getMessageCount() {
        return this.messages.length;
    }
    clear() {
        this.messages = [];
    }
    // Get messages for a specific role
    getMessagesByRole(role) {
        return this.messages.filter(msg => msg.role === role);
    }
    // Get recent messages (last n messages)
    getRecentMessages(count) {
        return this.messages.slice(-count);
    }
    // Get messages within a time range
    getMessagesByTimeRange(start, end) {
        return this.messages.filter(msg => {
            if (!msg.timestamp)
                return false;
            return msg.timestamp >= start && msg.timestamp <= end;
        });
    }
    // Get conversation statistics
    getStats() {
        const userMessages = this.getMessagesByRole('user');
        const assistantMessages = this.getMessagesByRole('assistant');
        const systemMessages = this.getMessagesByRole('system');
        const avgUserLength = userMessages.length > 0
            ? userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length
            : 0;
        const avgAssistantLength = assistantMessages.length > 0
            ? assistantMessages.reduce((sum, msg) => sum + msg.content.length, 0) / assistantMessages.length
            : 0;
        return {
            total: this.messages.length,
            userMessages: userMessages.length,
            assistantMessages: assistantMessages.length,
            systemMessages: systemMessages.length,
            averageUserMessageLength: Math.round(avgUserLength),
            averageAssistantMessageLength: Math.round(avgAssistantLength)
        };
    }
    // Export messages to JSON
    export() {
        return JSON.stringify({
            messages: this.messages,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
    // Import messages from JSON
    import(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.messages && Array.isArray(data.messages)) {
                this.messages = data.messages.map((msg) => ({
                    ...msg,
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
                }));
            }
        }
        catch (error) {
            throw new Error('Invalid JSON format for chat history');
        }
    }
    // Truncate to fit within token limits (rough estimation)
    truncateToTokenLimit(estimatedTokenLimit) {
        const averageTokensPerChar = 0.25; // Rough approximation
        const maxChars = estimatedTokenLimit / averageTokensPerChar;
        let totalChars = 0;
        let cutoffIndex = this.messages.length;
        // Count backwards from the most recent messages
        for (let i = this.messages.length - 1; i >= 0; i--) {
            totalChars += this.messages[i].content.length;
            if (totalChars > maxChars) {
                cutoffIndex = i + 1;
                break;
            }
        }
        if (cutoffIndex < this.messages.length) {
            this.messages = this.messages.slice(cutoffIndex);
        }
    }
    // Set maximum number of messages to keep
    setMaxMessages(max) {
        this.maxMessages = max;
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(-this.maxMessages);
        }
    }
    getMaxMessages() {
        return this.maxMessages;
    }
}
//# sourceMappingURL=ChatHistory.js.map