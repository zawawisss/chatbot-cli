/**
 * Advanced Theme Management System
 * Inspired by gemini-cli's flexible theming approach
 */
export type ThemeType = 'dark' | 'light' | 'ansi' | 'cyberpunk' | 'matrix';
export interface ThemeColors {
    type: ThemeType;
    background: string;
    foreground: string;
    accent: {
        blue: string;
        purple: string;
        cyan: string;
        green: string;
        yellow: string;
        red: string;
    };
    gradients?: string[];
    comment: string;
    gray: string;
    selection: string;
}
export interface Theme {
    name: string;
    colors: ThemeColors;
    codeHighlight: Record<string, string>;
}
export declare const THEMES: Record<ThemeType, Theme>;
export declare class AdvancedThemeManager {
    private currentTheme;
    private customThemes;
    constructor(defaultTheme?: ThemeType);
    /**
     * Get current active theme
     */
    getActiveTheme(): Theme;
    /**
     * Set active theme
     */
    setTheme(themeName: ThemeType): void;
    /**
     * Get all available themes
     */
    getAvailableThemes(): Array<{
        name: ThemeType;
        displayName: string;
    }>;
    /**
     * Add custom theme
     */
    addCustomTheme(name: string, theme: Theme): void;
    /**
     * Get adaptive colors based on terminal capabilities
     */
    getAdaptiveColors(): ThemeColors;
    /**
     * Get color with gradient support
     */
    getGradientColor(text: string, colors?: string[]): string;
    /**
     * Auto-detect best theme based on terminal
     */
    autoDetectTheme(): ThemeType;
    /**
     * Apply theme-specific console styling
     */
    styleText(text: string, style: keyof ThemeColors['accent'] | 'foreground' | 'comment' | 'gray'): string;
    /**
     * Get status color based on state
     */
    getStatusColor(status: 'success' | 'warning' | 'error' | 'info' | 'progress'): string;
    /**
     * Generate theme preview
     */
    generatePreview(themeName: ThemeType): string;
    /**
     * Export theme configuration
     */
    exportTheme(themeName: ThemeType): string;
    /**
     * Import custom theme from JSON
     */
    importTheme(name: string, themeJson: string): boolean;
}
//# sourceMappingURL=AdvancedThemeManager.d.ts.map