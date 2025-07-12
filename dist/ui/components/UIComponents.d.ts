/**
 * Modern UI Components for Terminal Interface
 * Enhanced visual elements and user experience
 */
export interface StatusInfo {
    provider: string;
    model: string;
    mode?: string;
    tools?: number;
    status?: 'online' | 'offline' | 'error';
}
export interface ProgressInfo {
    current: number;
    total: number;
    message?: string;
}
export declare class UIComponents {
    /**
     * Display a beautiful banner/logo
     */
    static showBanner(): void;
    /**
     * Fallback simple banner
     */
    private static showSimpleBanner;
    /**
     * Enhanced status bar with provider info
     */
    static showStatusBar(info: StatusInfo): void;
    /**
     * Beautiful section header
     */
    static showSectionHeader(title: string, icon?: string): void;
    /**
     * Success message with visual emphasis
     */
    static showSuccess(message: string, details?: string): void;
    /**
     * Error message with visual emphasis
     */
    static showError(message: string, details?: string): void;
    /**
     * Warning message
     */
    static showWarning(message: string, details?: string): void;
    /**
     * Info message with icon
     */
    static showInfo(message: string, icon?: string): void;
    /**
     * Progress bar for long operations
     */
    static showProgress(info: ProgressInfo): void;
    /**
     * Display table-like data
     */
    static showTable(headers: string[], rows: string[][]): void;
    /**
     * Animated loading spinner
     */
    static createSpinner(message?: string): any;
    /**
     * Enhanced streaming response display with live visualization
     */
    static createStreamDisplay(title?: string): any;
    /**
     * Show API connection status during streaming
     */
    static showStreamingStatus(provider: string, model: string, status: 'connecting' | 'streaming' | 'complete' | 'error'): void;
    /**
     * Enhanced command help display
     */
    static showCommandHelp(commands: Array<{
        cmd: string;
        desc: string;
        example?: string;
    }>): void;
    /**
     * Interactive menu selector
     */
    static showMenu(title: string, options: Array<{
        label: string;
        value: string;
        description?: string;
    }>): void;
    /**
     * Pretty print JSON data
     */
    static showJSON(data: any, title?: string): void;
    /**
     * Clear screen and show fresh interface
     */
    static clearScreen(): void;
    /**
     * Separator line
     */
    static showSeparator(char?: string, length?: number): void;
    /**
     * Highlight code blocks
     */
    static showCode(code: string, language?: string): void;
    /**
     * Show typing effect for responses
     */
    static typeText(text: string, speed?: number): Promise<void>;
}
//# sourceMappingURL=UIComponents.d.ts.map