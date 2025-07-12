export interface RetryConfig {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
    maxDelayMs: number;
}
export interface ErrorContext {
    provider: string;
    operation: string;
    attempt: number;
    timestamp: Date;
}
export declare class EnhancedErrorHandler {
    private static defaultRetryConfig;
    static withRetry<T>(operation: () => Promise<T>, context: ErrorContext, config?: Partial<RetryConfig>): Promise<T>;
    private static isRetryableError;
    private static enhanceError;
    private static getErrorSuggestions;
    private static sleep;
    static formatErrorForUser(error: any): string;
    static logError(error: any, context: string): void;
}
//# sourceMappingURL=ErrorHandler.d.ts.map