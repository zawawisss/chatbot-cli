/**
 * Enhanced UI Components for Superior Terminal Experience
 * Modern, interactive, and visually appealing interface elements
 */

import chalk from 'chalk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Enhanced imports with fallbacks
let gradientString: any;
let terminalKit: any;

try {
  const gradientModule = require('gradient-string');
  gradientString = gradientModule.default || gradientModule;
} catch (e) {
  gradientString = null;
}

try {
  const terminalKitModule = require('terminal-kit');
  terminalKit = terminalKitModule.default || terminalKitModule;
} catch (e) {
  terminalKit = null;
}

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

export class EnhancedUIComponents {
  
  /**
   * Beautiful gradient banner with animation
   */
  static showAnimatedBanner(): void {
    const bannerText = `
    ╭─────────────────────────────────────────────────────────╮
    │                                                         │
    │  🤖  Multi-Provider ChatBot CLI  ⚡                     │
    │                                                         │
    │     🚀 Intelligent • 💪 Powerful • 🎯 Simple         │
    │                                                         │
    ╰─────────────────────────────────────────────────────────╯
    `;

    if (gradientString) {
      const rainbow = gradientString('cyan', 'magenta', 'yellow', 'green');
      console.log(rainbow(bannerText));
    } else {
      console.log(chalk.cyan(bannerText));
    }
  }

  /**
   * Enhanced status bar with real-time updates
   */
  static showLiveStatusBar(info: StatusInfo): void {
    const statusIcons = {
      online: '🟢',
      offline: '🔴',
      error: '🔴',
      connecting: '🟡',
      streaming: '🔵'
    };

    const providerIcons = {
      'gemini': '🧠',
      'deepseek': '🤖',
      'ollama': '🦙',
      'openai': '🔥'
    };

    const statusLine = [
      chalk.bold.white('◉ Live Status'),
      chalk.gray('│'),
      `${statusIcons[info.status] || '⚪'} ${info.status === 'online' ? chalk.bold.green(info.status) : chalk.bold.red(info.status)}`,
      chalk.gray('│'),
      `${(providerIcons as any)[info.provider] || '🔹'} ${chalk.cyan.bold(info.provider)}`,
      chalk.gray('│'),
      `⚙️  ${chalk.magenta(info.model)}`,
      chalk.gray('│'),
      `🔧 ${chalk.yellow(info.tools || 0)} tools`,
      chalk.gray('│'),
      `⚡ ${chalk.green(info.responseTime || 0)}ms`
    ].join(' ');

    // Create animated border
    const border = '═'.repeat(80);
    console.log(chalk.cyan(`╭─${border}─╮`));
    console.log(chalk.cyan(`│ ${statusLine.padEnd(80)} │`));
    console.log(chalk.cyan(`╰─${border}─╯`));
  }

  /**
   * Chat message display with enhanced formatting
   */
  static displayMessage(message: ChatMessage): void {
    const timestamp = message.timestamp.toLocaleTimeString();
    const roleColors = {
      user: 'cyan',
      assistant: 'green',
      system: 'yellow'
    };

    const roleIcons = {
      user: '👤',
      assistant: '🤖',
      system: '⚙️'
    };

    const roleColor = roleColors[message.role] || 'white';
    const icon = roleIcons[message.role] || '💬';
    
    // Header with role and timestamp
    const header = [
      (chalk as any)[roleColor].bold(`${icon} ${message.role.toUpperCase()}`),
      chalk.gray(`[${timestamp}]`),
      ...(message.tokens ? [chalk.blue(`${message.tokens} tokens`)] : []),
      ...(message.responseTime ? [chalk.green(`${message.responseTime}ms`)] : [])
    ].join(' ');

    console.log(header);
    
    // Message content with proper formatting
    const content = message.content.split('\n').map(line => {
      if (line.trim().startsWith('```')) {
        return chalk.gray(line);
      } else if (line.trim().startsWith('# ')) {
        return chalk.bold.white(line);
      } else if (line.trim().startsWith('## ')) {
        return chalk.bold.cyan(line);
      } else if (line.trim().startsWith('- ')) {
        return chalk.yellow('• ') + chalk.white(line.slice(2));
      }
      return chalk.white(line);
    }).join('\n');

    console.log(content);
    console.log(chalk.gray('─'.repeat(60)));
  }

  /**
   * Interactive command palette
   */
  static showCommandPalette(): void {
    const commands = [
      { cmd: '/help', desc: 'Show all available commands', icon: '❓' },
      { cmd: '/setup', desc: 'Configure providers and settings', icon: '⚙️' },
      { cmd: '/switch <provider>', desc: 'Switch to different provider', icon: '🔄' },
      { cmd: '/stream <message>', desc: 'Get streaming response', icon: '⚡' },
      { cmd: '/save', desc: 'Save current conversation', icon: '💾' },
      { cmd: '/load', desc: 'Load previous conversation', icon: '📁' },
      { cmd: '/providers', desc: 'Show available providers', icon: '🏢' },
      { cmd: '/tools', desc: 'Show available tools', icon: '🔧' },
      { cmd: '/clear', desc: 'Clear conversation history', icon: '🧹' },
      { cmd: '/exit', desc: 'Exit the application', icon: '👋' }
    ];

    console.log(chalk.bold.cyan('\n📋 Command Palette'));
    console.log(chalk.cyan('─'.repeat(50)));
    
    commands.forEach(({ cmd, desc, icon }) => {
      console.log(`  ${icon} ${chalk.cyan.bold(cmd.padEnd(20))} ${chalk.white(desc)}`);
    });
    
    console.log(chalk.cyan('─'.repeat(50)));
    console.log(chalk.gray('💡 Tip: Type any command followed by Enter to execute'));
  }

  /**
   * Provider selection with visual cards
   */
  static showProviderCards(providers: Array<{name: string, status: string, description: string, model: string}>): void {
    console.log(chalk.bold.cyan('\n🏢 Available Providers'));
    console.log(chalk.cyan('─'.repeat(60)));
    
    providers.forEach(provider => {
      const statusIcon = provider.status === 'online' ? '🟢' : '🔴';
      const card = [
        chalk.bold.white(`${statusIcon} ${provider.name.toUpperCase()}`),
        chalk.gray(`Model: ${provider.model}`),
        chalk.white(provider.description)
      ].join('\n');
      
      console.log(`╭─${'─'.repeat(25)}─╮`);
      console.log(`│ ${card.split('\n').map(line => line.padEnd(25)).join(' │\n│ ')} │`);
      console.log(`╰─${'─'.repeat(25)}─╯`);
    });
  }

  /**
   * Streaming response with live updates
   */
  static showStreamingResponse(initialMessage: string = 'AI is thinking...'): any {
    let currentText = '';
    let dots = 0;
    
    const spinner = {
      interval: null as any,
      
      start: () => {
        console.log(chalk.blue(`🤖 Assistant: ${chalk.gray('(streaming...)')}`));
        process.stdout.write(chalk.green('► '));
      },
      
      addText: (text: string) => {
        currentText += text;
        process.stdout.write(chalk.white(text));
      },
      
      complete: (stats?: {responseTime: number, tokens: number}) => {
        console.log(); // New line
        if (stats) {
          console.log(chalk.gray(`   ⚡ ${stats.responseTime}ms • 📊 ${stats.tokens} tokens`));
        }
        console.log(chalk.gray('─'.repeat(60)));
      },
      
      error: (errorMessage: string) => {
        console.log(chalk.red(`\n❌ Error: ${errorMessage}`));
        console.log(chalk.gray('─'.repeat(60)));
      }
    };
    
    return spinner;
  }

  /**
   * Session overview dashboard
   */
  static showSessionDashboard(session: SessionInfo): void {
    const duration = new Date().getTime() - session.startTime.getTime();
    const durationStr = `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
    
    console.log(chalk.bold.cyan('\n📊 Session Dashboard'));
    console.log(chalk.cyan('═'.repeat(50)));
    
    const stats = [
      ['🆔 Session ID', session.sessionId],
      ['⏱️  Duration', durationStr],
      ['💬 Messages', session.messageCount.toString()],
      ['🔤 Total Tokens', session.totalTokens.toString()],
      ['🤖 Provider', session.provider],
      ['⚙️  Model', session.model]
    ];
    
    stats.forEach(([label, value]) => {
      console.log(`  ${chalk.white(label.padEnd(15))} ${chalk.cyan(value)}`);
    });
    
    console.log(chalk.cyan('═'.repeat(50)));
  }

  /**
   * Enhanced error display with suggestions
   */
  static showEnhancedError(error: string, suggestions: string[] = []): void {
    console.log(chalk.red.bold('\n❌ Error Occurred'));
    console.log(chalk.red('─'.repeat(40)));
    console.log(chalk.white(`  ${error}`));
    
    if (suggestions.length > 0) {
      console.log(chalk.yellow('\n💡 Suggestions:'));
      suggestions.forEach(suggestion => {
        console.log(chalk.gray(`  • ${suggestion}`));
      });
    }
    
    console.log(chalk.red('─'.repeat(40)));
  }

  /**
   * Loading animation with progress
   */
  static showLoadingAnimation(message: string = 'Processing...'): any {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const colors = ['cyan', 'blue', 'magenta', 'green', 'yellow', 'red'];
    let frameIndex = 0;
    let colorIndex = 0;
    
    const loader = {
      interval: null as any,
      
      start: () => {
        loader.interval = setInterval(() => {
          const frame = frames[frameIndex];
          const color = colors[colorIndex];
          process.stdout.write(`\r${(chalk as any)[color](frame)} ${chalk.gray(message)}`);
          
          frameIndex = (frameIndex + 1) % frames.length;
          if (frameIndex === 0) {
            colorIndex = (colorIndex + 1) % colors.length;
          }
        }, 100);
      },
      
      stop: () => {
        if (loader.interval) {
          clearInterval(loader.interval);
          process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
        }
      },
      
      succeed: (successMessage: string) => {
        loader.stop();
        console.log(chalk.green(`✅ ${successMessage}`));
      },
      
      fail: (errorMessage: string) => {
        loader.stop();
        console.log(chalk.red(`❌ ${errorMessage}`));
      }
    };
    
    return loader;
  }

  /**
   * Interactive progress bar
   */
  static showProgressBar(current: number, total: number, message: string = ''): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * 30);
    const empty = 30 - filled;
    
    const progressBar = [
      chalk.green('█'.repeat(filled)),
      chalk.gray('░'.repeat(empty))
    ].join('');
    
    const progressText = [
      chalk.cyan('Progress:'),
      `[${progressBar}]`,
      chalk.yellow(`${percentage}%`),
      chalk.gray(`(${current}/${total})`),
      ...(message ? [chalk.dim(message)] : [])
    ].join(' ');
    
    process.stdout.write('\r' + progressText);
    
    if (current >= total) {
      process.stdout.write('\n');
      console.log(chalk.green('✅ Complete!'));
    }
  }

  /**
   * Clear screen with fade effect
   */
  static clearScreenWithFade(): void {
    // Simple clear for now - can be enhanced with terminal-kit
    console.clear();
    this.showAnimatedBanner();
  }

  /**
   * Show typing indicator
   */
  static showTypingIndicator(name: string = 'Assistant'): any {
    const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let index = 0;
    
    const indicator = {
      interval: null as any,
      
      start: () => {
        indicator.interval = setInterval(() => {
          process.stdout.write(`\r${chalk.gray(dots[index])} ${chalk.blue(name)} is typing...`);
          index = (index + 1) % dots.length;
        }, 100);
      },
      
      stop: () => {
        if (indicator.interval) {
          clearInterval(indicator.interval);
          process.stdout.write('\r' + ' '.repeat(30) + '\r');
        }
      }
    };
    
    return indicator;
  }

  /**
   * Quick stats display
   */
  static showQuickStats(stats: {[key: string]: any}): void {
    console.log(chalk.bold.cyan('\n📈 Quick Stats'));
    console.log(chalk.cyan('─'.repeat(30)));
    
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  ${chalk.white(key.padEnd(15))} ${chalk.cyan(value)}`);
    });
    
    console.log(chalk.cyan('─'.repeat(30)));
  }
}
