/**
 * Theme Manager for customizable UI colors and styles
 */

import chalk from 'chalk';

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

export class ThemeManager {
  private currentTheme: Theme;
  private themes: Map<string, Theme> = new Map();

  constructor() {
    this.registerDefaultThemes();
    this.currentTheme = this.themes.get('default')!;
  }

  private registerDefaultThemes(): void {
    // Default Theme
    this.themes.set('default', {
      name: 'Default',
      colors: {
        primary: 'cyan',
        secondary: 'blue',
        success: 'green',
        warning: 'yellow',
        error: 'red',
        info: 'blue',
        user: 'cyan',
        assistant: 'green',
        system: 'yellow',
        border: 'gray',
        background: 'black',
        text: 'white',
        dim: 'gray'
      },
      icons: {
        user: '👤',
        assistant: '🤖',
        system: '⚙️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        tool: '🔧'
      }
    });

    // Dark Theme
    this.themes.set('dark', {
      name: 'Dark',
      colors: {
        primary: 'magenta',
        secondary: 'cyan',
        success: 'green',
        warning: 'yellow',
        error: 'red',
        info: 'cyan',
        user: 'magenta',
        assistant: 'cyan',
        system: 'yellow',
        border: 'white',
        background: 'black',
        text: 'white',
        dim: 'gray'
      },
      icons: {
        user: '🧑',
        assistant: '🤖',
        system: '⚙️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        tool: '🔧'
      }
    });

    // Light Theme
    this.themes.set('light', {
      name: 'Light',
      colors: {
        primary: 'blue',
        secondary: 'cyan',
        success: 'green',
        warning: 'yellow',
        error: 'red',
        info: 'blue',
        user: 'blue',
        assistant: 'green',
        system: 'yellow',
        border: 'black',
        background: 'white',
        text: 'black',
        dim: 'gray'
      },
      icons: {
        user: '👨‍💻',
        assistant: '🤖',
        system: '⚙️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        tool: '🔧'
      }
    });

    // Neon Theme
    this.themes.set('neon', {
      name: 'Neon',
      colors: {
        primary: 'magenta',
        secondary: 'cyan',
        success: 'green',
        warning: 'yellow',
        error: 'red',
        info: 'cyan',
        user: 'magenta',
        assistant: 'cyan',
        system: 'yellow',
        border: 'magenta',
        background: 'black',
        text: 'white',
        dim: 'gray'
      },
      icons: {
        user: '🔥',
        assistant: '💎',
        system: '⚡',
        success: '✨',
        error: '💥',
        warning: '⚠️',
        info: '💫',
        loading: '🌟',
        tool: '🔧'
      }
    });
  }

  /**
   * Set current theme
   */
  public setTheme(themeName: string): boolean {
    const theme = this.themes.get(themeName);
    if (theme) {
      this.currentTheme = theme;
      return true;
    }
    return false;
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Get available themes
   */
  public getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Get themed chalk function
   */
  public getColor(colorName: keyof Theme['colors']): any {
    const colorKey = this.currentTheme.colors[colorName];
    return (chalk as any)[colorKey] || chalk.white;
  }

  /**
   * Get themed icon
   */
  public getIcon(iconName: keyof Theme['icons']): string {
    return this.currentTheme.icons[iconName];
  }

  /**
   * Apply theme to text
   */
  public applyTheme(text: string, style: keyof Theme['colors']): string {
    const colorFn = this.getColor(style);
    return colorFn(text);
  }

  /**
   * Create themed border
   */
  public createBorder(length: number = 60, char: string = '─'): string {
    return this.applyTheme(char.repeat(length), 'border');
  }

  /**
   * Create themed box
   */
  public createBox(content: string, title?: string): string {
    const lines = content.split('\n');
    const maxLength = Math.max(...lines.map(line => line.length));
    const borderChar = '─';
    const sideChar = '│';
    
    const topBorder = `╭${borderChar.repeat(maxLength + 2)}╮`;
    const bottomBorder = `╰${borderChar.repeat(maxLength + 2)}╯`;
    
    let result = this.applyTheme(topBorder, 'border') + '\n';
    
    if (title) {
      const titleLine = `${sideChar} ${title.padEnd(maxLength)} ${sideChar}`;
      result += this.applyTheme(titleLine, 'primary') + '\n';
      result += this.applyTheme(`${sideChar}${borderChar.repeat(maxLength + 2)}${sideChar}`, 'border') + '\n';
    }
    
    lines.forEach(line => {
      const contentLine = `${sideChar} ${line.padEnd(maxLength)} ${sideChar}`;
      result += this.applyTheme(contentLine, 'text') + '\n';
    });
    
    result += this.applyTheme(bottomBorder, 'border');
    
    return result;
  }

  /**
   * Register custom theme
   */
  public registerTheme(name: string, theme: Theme): void {
    this.themes.set(name, theme);
  }

  /**
   * Show theme preview
   */
  public showThemePreview(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (!theme) {
      console.log(chalk.red(`Theme "${themeName}" not found`));
      return;
    }

    const originalTheme = this.currentTheme;
    this.currentTheme = theme;

    console.log(this.createBox(
      `Theme: ${theme.name}\n` +
      `${this.getIcon('user')} User message example\n` +
      `${this.getIcon('assistant')} Assistant response example\n` +
      `${this.getIcon('system')} System message example\n` +
      `${this.getIcon('success')} Success message\n` +
      `${this.getIcon('error')} Error message\n` +
      `${this.getIcon('warning')} Warning message`,
      `${theme.name} Theme Preview`
    ));

    this.currentTheme = originalTheme;
  }
}
