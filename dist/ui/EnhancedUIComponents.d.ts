/**
 * Enhanced UI Components for Superior Terminal Experience
 * Modern, interactive, and visually appealing interface elements
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    tokens?: number;
    responseTime?: number;
}
export interface SessionInfo {
    sessionId: string;
    messageCount: number;
    totalTokens: number;
    startTime: Date;
    provider: string;
    model: string;
}
export interface StatusInfo {
    provider: string;
    model: string;
    status: 'online' | 'offline' | 'error' | 'connecting' | 'streaming';
    tools?: number;
    responseTime?: number;
}
export declare class EnhancedUIComponents {
    /**
     * Beautiful gradient banner with animation
     */
    static showAnimatedBanner(): void;
    /**
     * Enhanced status bar with real-time updates
     */
    static showLiveStatusBar(info: StatusInfo): void;
    /**
     * Chat message display with enhanced formatting
     */
    static displayMessage(message: ChatMessage): void;
    /**
     * Interactive command palette
     */
    static showCommandPalette(): void;
    /**
     * Provider selection with visual cards
     */
    static showProviderCards(providers: Array<{
        name: string;
        status: string;
        description: string;
        model: string;
    }>): void;
    /**
     * Streaming response with live updates
     */
    static showStreamingResponse(initialMessage?: string): any;
    /**
     * Session overview dashboard
     */
    static showSessionDashboard(session: SessionInfo): void;
    /**
     * Enhanced error display with suggestions
     */
    static showEnhancedError(error: string, suggestions?: string[]): void;
    /**
     * Loading animation with progress
     */
    static showLoadingAnimation(message?: string): any;
    /**
     * Interactive progress bar
     */
    static showProgressBar(current: number, total: number, message?: string): void;
    /**
     * Clear screen with fade effect
     */
    static clearScreenWithFade(): void;
    /**
     * Show typing indicator
     */
    static showTypingIndicator(name?: string): any;
    /**
     * Quick stats display
     */
    static showQuickStats(stats: {
        [key: string]: any;
    }): void;
}
//# sourceMappingURL=EnhancedUIComponents.d.ts.map