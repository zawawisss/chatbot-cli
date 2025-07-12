/**
 * Progress Bar with smooth animations for loading states
 */
export interface ProgressBarOptions {
    title?: string;
    total?: number;
    current?: number;
    width?: number;
    showPercentage?: boolean;
    showETA?: boolean;
    style?: 'simple' | 'fancy' | 'minimal';
    color?: 'green' | 'blue' | 'cyan' | 'yellow' | 'magenta';
}
export declare class ProgressBar {
    private options;
    private startTime;
    private lastUpdateTime;
    private isVisible;
    constructor(options?: ProgressBarOptions);
    /**
     * Update progress
     */
    update(current: number, title?: string): void;
    /**
     * Increment progress
     */
    increment(amount?: number): void;
    /**
     * Set total value
     */
    setTotal(total: number): void;
    /**
     * Complete the progress bar
     */
    complete(message?: string): void;
    /**
     * Show error state
     */
    error(message?: string): void;
    /**
     * Start progress bar
     */
    start(): void;
    /**
     * Hide progress bar
     */
    hide(): void;
    /**
     * Render progress bar
     */
    private render;
    /**
     * Format time in seconds to human readable format
     */
    private formatTime;
    /**
     * Create animated loading bar
     */
    static createLoadingBar(message?: string): ProgressBar;
    /**
     * Create indeterminate progress bar
     */
    static createIndeterminateBar(message?: string): NodeJS.Timeout;
    /**
     * Stop indeterminate progress bar
     */
    static stopIndeterminateBar(interval: NodeJS.Timeout, message?: string): void;
}
//# sourceMappingURL=ProgressBar.d.ts.map