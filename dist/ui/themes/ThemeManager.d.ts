/**
 * Theme Manager for customizable UI colors and styles
 */
export interface Theme {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        user: string;
        assistant: string;
        system: string;
        border: string;
        background: string;
        text: string;
        dim: string;
    };
    icons: {
        user: string;
        assistant: string;
        system: string;
        success: string;
        error: string;
        warning: string;
        info: string;
        loading: string;
        tool: string;
    };
}
export declare class ThemeManager {
    private currentTheme;
    private themes;
    constructor();
    private registerDefaultThemes;
    /**
     * Set current theme
     */
    setTheme(themeName: string): boolean;
    /**
     * Get current theme
     */
    getCurrentTheme(): Theme;
    /**
     * Get available themes
     */
    getAvailableThemes(): string[];
    /**
     * Get themed chalk function
     */
    getColor(colorName: keyof Theme['colors']): any;
    /**
     * Get themed icon
     */
    getIcon(iconName: keyof Theme['icons']): string;
    /**
     * Apply theme to text
     */
    applyTheme(text: string, style: keyof Theme['colors']): string;
    /**
     * Create themed border
     */
    createBorder(length?: number, char?: string): string;
    /**
     * Create themed box
     */
    createBox(content: string, title?: string): string;
    /**
     * Register custom theme
     */
    registerTheme(name: string, theme: Theme): void;
    /**
     * Show theme preview
     */
    showThemePreview(themeName: string): void;
}
//# sourceMappingURL=ThemeManager.d.ts.map