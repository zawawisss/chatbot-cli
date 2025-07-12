/**
 * Progress Bar with smooth animations for loading states
 */

import chalk from 'chalk';

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

export class ProgressBar {
  private options: Required<ProgressBarOptions>;
  private startTime: number = Date.now();
  private lastUpdateTime: number = Date.now();
  private isVisible: boolean = false;

  constructor(options: ProgressBarOptions = {}) {
    this.options = {
      title: options.title || 'Progress',
      total: options.total || 100,
      current: options.current || 0,
      width: options.width || 40,
      showPercentage: options.showPercentage !== false,
      showETA: options.showETA !== false,
      style: options.style || 'fancy',
      color: options.color || 'green'
    };
  }

  /**
   * Update progress
   */
  public update(current: number, title?: string): void {
    this.options.current = current;
    if (title) {
      this.options.title = title;
    }
    this.render();
  }

  /**
   * Increment progress
   */
  public increment(amount: number = 1): void {
    this.options.current = Math.min(this.options.current + amount, this.options.total);
    this.render();
  }

  /**
   * Set total value
   */
  public setTotal(total: number): void {
    this.options.total = total;
    this.render();
  }

  /**
   * Complete the progress bar
   */
  public complete(message?: string): void {
    this.options.current = this.options.total;
    this.render();
    if (message) {
      console.log(`\n${chalk.green('✅')} ${message}`);
    } else {
      console.log(`\n${chalk.green('✅')} Complete!`);
    }
    this.hide();
  }

  /**
   * Show error state
   */
  public error(message?: string): void {
    this.hide();
    if (message) {
      console.log(`\n${chalk.red('❌')} ${message}`);
    } else {
      console.log(`\n${chalk.red('❌')} Failed!`);
    }
  }

  /**
   * Start progress bar
   */
  public start(): void {
    this.startTime = Date.now();
    this.isVisible = true;
    this.render();
  }

  /**
   * Hide progress bar
   */
  public hide(): void {
    if (this.isVisible) {
      process.stdout.write('\r' + ' '.repeat(80) + '\r');
      this.isVisible = false;
    }
  }

  /**
   * Render progress bar
   */
  private render(): void {
    if (!this.isVisible) return;

    const percentage = Math.round((this.options.current / this.options.total) * 100);
    const filled = Math.round((this.options.current / this.options.total) * this.options.width);
    const empty = this.options.width - filled;

    let bar = '';
    const colorFn = (chalk as any)[this.options.color];

    switch (this.options.style) {
      case 'simple':
        bar = colorFn('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
        break;
      
      case 'fancy':
        const chars = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
        const fullBlocks = Math.floor(filled);
        const partialBlock = filled - fullBlocks;
        const partialChar = partialBlock > 0 ? chars[Math.floor(partialBlock * 8)] : '';
        
        bar = colorFn('█'.repeat(fullBlocks) + partialChar) + chalk.gray('░'.repeat(empty - (partialChar ? 1 : 0)));
        break;
      
      case 'minimal':
        bar = colorFn('━'.repeat(filled)) + chalk.gray('━'.repeat(empty));
        break;
    }

    let output = `${this.options.title} [${bar}]`;
    
    if (this.options.showPercentage) {
      output += ` ${percentage}%`;
    }

    if (this.options.showETA && this.options.current > 0) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const rate = this.options.current / elapsed;
      const eta = (this.options.total - this.options.current) / rate;
      
      if (eta > 0 && eta < Infinity) {
        output += ` ETA: ${this.formatTime(eta)}`;
      }
    }

    // Add spinner for active state
    if (this.options.current < this.options.total) {
      const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      const spinnerIndex = Math.floor(Date.now() / 100) % spinnerChars.length;
      output = `${chalk.cyan(spinnerChars[spinnerIndex])} ${output}`;
    }

    process.stdout.write(`\r${output}`);
    this.lastUpdateTime = Date.now();
  }

  /**
   * Format time in seconds to human readable format
   */
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    } else {
      return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
    }
  }

  /**
   * Create animated loading bar
   */
  public static createLoadingBar(message: string = 'Loading'): ProgressBar {
    const bar = new ProgressBar({
      title: message,
      total: 100,
      current: 0,
      style: 'fancy',
      color: 'cyan'
    });
    
    bar.start();
    return bar;
  }

  /**
   * Create indeterminate progress bar
   */
  public static createIndeterminateBar(message: string = 'Processing'): NodeJS.Timeout {
    const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let index = 0;
    
    const interval = setInterval(() => {
      const spinner = chalk.cyan(spinnerChars[index]);
      process.stdout.write(`\r${spinner} ${message}...`);
      index = (index + 1) % spinnerChars.length;
    }, 100);
    
    return interval;
  }

  /**
   * Stop indeterminate progress bar
   */
  public static stopIndeterminateBar(interval: NodeJS.Timeout, message?: string): void {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
    if (message) {
      console.log(`${chalk.green('✅')} ${message}`);
    }
  }
}
