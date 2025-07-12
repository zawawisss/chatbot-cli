/**
 * Advanced Theme Management System
 * Inspired by gemini-cli's flexible theming approach
 */
// Pre-defined themes
export const THEMES = {
    dark: {
        name: 'Dark Pro',
        colors: {
            type: 'dark',
            background: '#1E1E2E',
            foreground: '#CDD6F4',
            accent: {
                blue: '#89B4FA',
                purple: '#CBA6F7',
                cyan: '#89DCEB',
                green: '#A6E3A1',
                yellow: '#F9E2AF',
                red: '#F38BA8',
            },
            gradients: ['#4796E4', '#847ACE', '#C3677F'],
            comment: '#6C7086',
            gray: '#6C7086',
            selection: '#313244',
        },
        codeHighlight: {
            keyword: '#CBA6F7',
            string: '#A6E3A1',
            number: '#FAB387',
            comment: '#6C7086',
            function: '#89B4FA',
            operator: '#89DCEB',
        }
    },
    light: {
        name: 'Light Pro',
        colors: {
            type: 'light',
            background: '#FAFAFA',
            foreground: '#3C3C43',
            accent: {
                blue: '#3B82F6',
                purple: '#8B5CF6',
                cyan: '#06B6D4',
                green: '#3CA84B',
                yellow: '#D5A40A',
                red: '#DD4C4C',
            },
            gradients: ['#4796E4', '#847ACE', '#C3677F'],
            comment: '#008000',
            gray: '#B7BECC',
            selection: '#E2E8F0',
        },
        codeHighlight: {
            keyword: '#8B5CF6',
            string: '#3CA84B',
            number: '#D5A40A',
            comment: '#008000',
            function: '#3B82F6',
            operator: '#06B6D4',
        }
    },
    ansi: {
        name: 'ANSI Classic',
        colors: {
            type: 'ansi',
            background: 'black',
            foreground: 'white',
            accent: {
                blue: 'blue',
                purple: 'magenta',
                cyan: 'cyan',
                green: 'green',
                yellow: 'yellow',
                red: 'red',
            },
            comment: 'gray',
            gray: 'gray',
            selection: 'blue',
        },
        codeHighlight: {
            keyword: 'magenta',
            string: 'green',
            number: 'yellow',
            comment: 'gray',
            function: 'blue',
            operator: 'cyan',
        }
    },
    cyberpunk: {
        name: 'Cyberpunk 2077',
        colors: {
            type: 'dark',
            background: '#0F0F0F',
            foreground: '#00FFFF',
            accent: {
                blue: '#00BFFF',
                purple: '#FF00FF',
                cyan: '#00FFFF',
                green: '#00FF41',
                yellow: '#FFFF00',
                red: '#FF073A',
            },
            gradients: ['#FF073A', '#FF00FF', '#00FFFF'],
            comment: '#808080',
            gray: '#404040',
            selection: '#333333',
        },
        codeHighlight: {
            keyword: '#FF00FF',
            string: '#00FF41',
            number: '#FFFF00',
            comment: '#808080',
            function: '#00BFFF',
            operator: '#00FFFF',
        }
    },
    matrix: {
        name: 'Matrix Rain',
        colors: {
            type: 'dark',
            background: '#000000',
            foreground: '#00FF00',
            accent: {
                blue: '#00CC00',
                purple: '#00FF00',
                cyan: '#00FFAA',
                green: '#00FF00',
                yellow: '#AAFF00',
                red: '#FF4400',
            },
            gradients: ['#003300', '#00FF00', '#00FFAA'],
            comment: '#004400',
            gray: '#006600',
            selection: '#003300',
        },
        codeHighlight: {
            keyword: '#00FF00',
            string: '#00FFAA',
            number: '#AAFF00',
            comment: '#004400',
            function: '#00CC00',
            operator: '#00FFAA',
        }
    },
};
export class AdvancedThemeManager {
    currentTheme = 'dark';
    customThemes = new Map();
    constructor(defaultTheme = 'dark') {
        this.currentTheme = defaultTheme;
    }
    /**
     * Get current active theme
     */
    getActiveTheme() {
        return THEMES[this.currentTheme];
    }
    /**
     * Set active theme
     */
    setTheme(themeName) {
        if (THEMES[themeName]) {
            this.currentTheme = themeName;
        }
    }
    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return Object.entries(THEMES).map(([key, theme]) => ({
            name: key,
            displayName: theme.name,
        }));
    }
    /**
     * Add custom theme
     */
    addCustomTheme(name, theme) {
        this.customThemes.set(name, theme);
    }
    /**
     * Get adaptive colors based on terminal capabilities
     */
    getAdaptiveColors() {
        const theme = this.getActiveTheme();
        // Check if terminal supports true color
        if (process.env.COLORTERM === 'truecolor' || process.env.TERM_PROGRAM === 'iTerm.app') {
            return theme.colors;
        }
        // Fallback to ANSI colors for limited terminals
        return THEMES.ansi.colors;
    }
    /**
     * Get color with gradient support
     */
    getGradientColor(text, colors) {
        const gradientColors = colors || this.getActiveTheme().colors.gradients;
        if (!gradientColors || gradientColors.length === 0) {
            return this.getActiveTheme().colors.foreground;
        }
        // Simple gradient simulation by alternating colors
        const colorIndex = text.length % gradientColors.length;
        return gradientColors[colorIndex];
    }
    /**
     * Auto-detect best theme based on terminal
     */
    autoDetectTheme() {
        // Check system preferences
        if (process.env.TERM === 'xterm-256color') {
            return 'dark';
        }
        if (process.env.TERM === 'ansi') {
            return 'ansi';
        }
        // Check time of day for automatic light/dark switching
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
            return 'light';
        }
        return 'dark';
    }
    /**
     * Apply theme-specific console styling
     */
    styleText(text, style) {
        const colors = this.getAdaptiveColors();
        let color;
        if (style === 'foreground') {
            color = colors.foreground;
        }
        else if (style === 'comment') {
            color = colors.comment;
        }
        else if (style === 'gray') {
            color = colors.gray;
        }
        else {
            color = colors.accent[style];
        }
        // Return styled text (actual implementation would use chalk or similar)
        return text; // Placeholder - actual styling would be applied here
    }
    /**
     * Get status color based on state
     */
    getStatusColor(status) {
        const colors = this.getAdaptiveColors();
        switch (status) {
            case 'success':
                return colors.accent.green;
            case 'warning':
                return colors.accent.yellow;
            case 'error':
                return colors.accent.red;
            case 'info':
                return colors.accent.blue;
            case 'progress':
                return colors.accent.cyan;
            default:
                return colors.foreground;
        }
    }
    /**
     * Generate theme preview
     */
    generatePreview(themeName) {
        const theme = THEMES[themeName];
        const colors = theme.colors;
        return `
Theme: ${theme.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 Blue: ${colors.accent.blue}    🟣 Purple: ${colors.accent.purple}
🔵 Cyan: ${colors.accent.cyan}    🟢 Green: ${colors.accent.green}
🟡 Yellow: ${colors.accent.yellow}  🔴 Red: ${colors.accent.red}

Example code:
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    }
    /**
     * Export theme configuration
     */
    exportTheme(themeName) {
        const theme = THEMES[themeName];
        return JSON.stringify(theme, null, 2);
    }
    /**
     * Import custom theme from JSON
     */
    importTheme(name, themeJson) {
        try {
            const theme = JSON.parse(themeJson);
            this.addCustomTheme(name, theme);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=AdvancedThemeManager.js.map