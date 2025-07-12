/**
 * Modern UI Components for Terminal Interface
 * Enhanced visual elements and user experience
 */
import chalk from 'chalk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Try to import boxen and figlet, fallback if not available
let boxen;
let figlet;
try {
    const boxenModule = require('boxen');
    boxen = boxenModule.default || boxenModule;
}
catch (e) {
    boxen = null;
}
try {
    const figletModule = require('figlet');
    figlet = figletModule.default || figletModule;
}
catch (e) {
    figlet = null;
}
export class UIComponents {
    /**
     * Display a beautiful banner/logo
     */
    static showBanner() {
        if (figlet) {
            try {
                const banner = figlet.textSync('ChatBot CLI', {
                    font: 'ANSI Shadow',
                    horizontalLayout: 'fitted',
                    width: 80
                });
                console.log(chalk.cyan(banner));
            }
            catch (e) {
                // Fallback to simple banner
                this.showSimpleBanner();
            }
        }
        else {
            this.showSimpleBanner();
        }
    }
    /**
     * Fallback simple banner
     */
    static showSimpleBanner() {
        console.log(chalk.cyan.bold(`
    ╭─────────────────────────────────────────╮
    │                                         │
    │  🤖  Multi-Provider ChatBot CLI  🚀     │
    │                                         │
    │     Intelligent • Powerful • Simple    │
    │                                         │
    ╰─────────────────────────────────────────╯
    `));
    }
    /**
     * Enhanced status bar with provider info
     */
    static showStatusBar(info) {
        const statusColor = info.status === 'online' ? 'green' :
            info.status === 'error' ? 'red' : 'yellow';
        const statusIcon = info.status === 'online' ? '🟢' :
            info.status === 'error' ? '🔴' : '🟡';
        const statusLine = [
            chalk.bold.white('Status:'),
            `${statusIcon} ${chalk[statusColor](info.status || 'unknown')}`,
            chalk.gray('│'),
            chalk.bold.white('Provider:'),
            chalk.cyan(info.provider),
            chalk.gray('│'),
            chalk.bold.white('Model:'),
            chalk.magenta(info.model),
            ...(info.mode ? [chalk.gray('│'), chalk.bold.white('Mode:'), chalk.yellow(info.mode)] : []),
            ...(info.tools ? [chalk.gray('│'), chalk.bold.white('Tools:'), chalk.green(info.tools.toString())] : [])
        ].join(' ');
        if (boxen) {
            console.log(boxen(statusLine, {
                padding: { top: 0, bottom: 0, left: 1, right: 1 },
                margin: { top: 0, bottom: 1, left: 0, right: 0 },
                borderStyle: 'round',
                borderColor: 'cyan',
                backgroundColor: '#1a1a1a'
            }));
        }
        else {
            console.log(`╭─${chalk.cyan('─'.repeat(statusLine.length + 2))}─╮`);
            console.log(`│ ${statusLine} │`);
            console.log(`╰─${chalk.cyan('─'.repeat(statusLine.length + 2))}─╯`);
        }
    }
    /**
     * Beautiful section header
     */
    static showSectionHeader(title, icon = '🔸') {
        const header = `${icon} ${title}`;
        console.log();
        console.log(chalk.bold.cyan(header));
        console.log(chalk.cyan('─'.repeat(Math.max(header.length, 40))));
    }
    /**
     * Success message with visual emphasis
     */
    static showSuccess(message, details) {
        const successBox = [
            chalk.green.bold('✅ SUCCESS'),
            chalk.white(message),
            ...(details ? [chalk.gray(details)] : [])
        ].join('\n');
        if (boxen) {
            console.log(boxen(successBox, {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green'
            }));
        }
        else {
            console.log(chalk.green(`✅ ${message}`));
            if (details)
                console.log(chalk.gray(`   ${details}`));
        }
    }
    /**
     * Error message with visual emphasis
     */
    static showError(message, details) {
        const errorBox = [
            chalk.red.bold('❌ ERROR'),
            chalk.white(message),
            ...(details ? [chalk.gray(details)] : [])
        ].join('\n');
        if (boxen) {
            console.log(boxen(errorBox, {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'red'
            }));
        }
        else {
            console.log(chalk.red(`❌ ${message}`));
            if (details)
                console.log(chalk.gray(`   ${details}`));
        }
    }
    /**
     * Warning message
     */
    static showWarning(message, details) {
        const warningBox = [
            chalk.yellow.bold('⚠️  WARNING'),
            chalk.white(message),
            ...(details ? [chalk.gray(details)] : [])
        ].join('\n');
        if (boxen) {
            console.log(boxen(warningBox, {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'yellow'
            }));
        }
        else {
            console.log(chalk.yellow(`⚠️  ${message}`));
            if (details)
                console.log(chalk.gray(`   ${details}`));
        }
    }
    /**
     * Info message with icon
     */
    static showInfo(message, icon = 'ℹ️') {
        console.log(chalk.blue(`${icon} ${message}`));
    }
    /**
     * Progress bar for long operations
     */
    static showProgress(info) {
        const percentage = Math.round((info.current / info.total) * 100);
        const filled = Math.round((info.current / info.total) * 20);
        const empty = 20 - filled;
        const progressBar = [
            '█'.repeat(filled),
            '░'.repeat(empty)
        ].join('');
        const progressText = [
            chalk.cyan('Progress:'),
            chalk.white(`[${progressBar}]`),
            chalk.yellow(`${percentage}%`),
            chalk.gray(`(${info.current}/${info.total})`),
            ...(info.message ? [chalk.dim(info.message)] : [])
        ].join(' ');
        // Clear line and show progress
        process.stdout.write('\r' + progressText);
        if (info.current >= info.total) {
            process.stdout.write('\n');
        }
    }
    /**
     * Display table-like data
     */
    static showTable(headers, rows) {
        if (rows.length === 0) {
            console.log(chalk.gray('  No data to display'));
            return;
        }
        // Calculate column widths
        const widths = headers.map((header, i) => {
            return Math.max(header.length, ...rows.map(row => (row[i] || '').length));
        });
        // Header
        const headerRow = headers.map((header, i) => chalk.bold.cyan(header.padEnd(widths[i]))).join('  ');
        console.log(`  ${headerRow}`);
        console.log(`  ${chalk.gray('─'.repeat(widths.reduce((sum, w) => sum + w + 2, -2)))}`);
        // Rows
        rows.forEach(row => {
            const dataRow = row.map((cell, i) => chalk.white((cell || '').padEnd(widths[i]))).join('  ');
            console.log(`  ${dataRow}`);
        });
    }
    /**
     * Animated loading spinner
     */
    static createSpinner(message = 'Loading...') {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        const spinner = {
            start: () => {
                spinner.interval = setInterval(() => {
                    process.stdout.write(`\r${chalk.cyan(frames[i])} ${chalk.gray(message)}`);
                    i = (i + 1) % frames.length;
                }, 80);
            },
            stop: () => {
                if (spinner.interval) {
                    clearInterval(spinner.interval);
                    process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
                }
            },
            succeed: (successMessage) => {
                spinner.stop();
                console.log(chalk.green(`✅ ${successMessage || message}`));
            },
            fail: (errorMessage) => {
                spinner.stop();
                console.log(chalk.red(`❌ ${errorMessage || 'Failed'}`));
            },
            interval: null
        };
        return spinner;
    }
    /**
     * Enhanced streaming response display with live visualization
     */
    static createStreamDisplay(title = 'Assistant') {
        let isActive = false;
        let currentContent = '';
        let startTime = 0;
        let charCount = 0;
        let wordCount = 0;
        let lastUpdateTime = 0;
        let cursor = '▋';
        let cursorVisible = true;
        let cursorInterval = null;
        const streamDisplay = {
            start: () => {
                isActive = true;
                startTime = Date.now();
                currentContent = '';
                charCount = 0;
                wordCount = 0;
                // Show initial header
                console.log(`\n${chalk.blue.bold(title + ':')} ${chalk.cyan('🔄')} ${chalk.gray('Streaming response...')}`);
                console.log(chalk.gray('─'.repeat(60)));
                // Start blinking cursor
                cursorInterval = setInterval(() => {
                    cursorVisible = !cursorVisible;
                    if (isActive && Date.now() - lastUpdateTime > 100) {
                        streamDisplay.updateCursor();
                    }
                }, 500);
            },
            write: (chunk) => {
                if (!isActive)
                    return;
                currentContent += chunk;
                charCount += chunk.length;
                wordCount = currentContent.split(/\s+/).filter(word => word.length > 0).length;
                lastUpdateTime = Date.now();
                // Write the chunk with word wrapping
                const words = chunk.split(' ');
                for (let i = 0; i < words.length; i++) {
                    if (i > 0)
                        process.stdout.write(' ');
                    // Highlight technical terms, code blocks, etc.
                    const word = words[i];
                    if (word.match(/^`[^`]+`$/)) {
                        // Inline code
                        process.stdout.write(chalk.bgGray.white(word));
                    }
                    else if (word.match(/^\*\*[^*]+\*\*$/)) {
                        // Bold text
                        process.stdout.write(chalk.bold(word.replace(/\*\*/g, '')));
                    }
                    else if (word.match(/^\*[^*]+\*$/)) {
                        // Italic text
                        process.stdout.write(chalk.italic(word.replace(/\*/g, '')));
                    }
                    else if (word.match(/^https?:\/\//)) {
                        // URLs
                        process.stdout.write(chalk.blue.underline(word));
                    }
                    else {
                        process.stdout.write(word);
                    }
                }
            },
            updateCursor: () => {
                if (!isActive)
                    return;
                const cursorChar = cursorVisible ? cursor : ' ';
                process.stdout.write(chalk.cyan(cursorChar));
                process.stdout.write('\b');
            },
            complete: () => {
                if (!isActive)
                    return;
                isActive = false;
                if (cursorInterval) {
                    clearInterval(cursorInterval);
                    cursorInterval = null;
                }
                // Clear cursor
                process.stdout.write(' \b');
                const duration = Date.now() - startTime;
                const wpm = Math.round((wordCount / (duration / 1000)) * 60);
                const cps = Math.round(charCount / (duration / 1000));
                console.log(`\n${chalk.gray('─'.repeat(60))}`);
                console.log(`${chalk.green('✅')} Response completed ${chalk.gray(`(${duration}ms, ${charCount} chars, ${wordCount} words, ${wpm} WPM, ${cps} CPS)`)}`);
                console.log();
            },
            error: (errorMessage) => {
                if (!isActive)
                    return;
                isActive = false;
                if (cursorInterval) {
                    clearInterval(cursorInterval);
                    cursorInterval = null;
                }
                // Clear cursor
                process.stdout.write(' \b');
                console.log(`\n${chalk.red('❌')} Error: ${errorMessage}`);
                console.log();
            },
            getStats: () => ({
                duration: Date.now() - startTime,
                charCount,
                wordCount,
                wpm: Math.round((wordCount / ((Date.now() - startTime) / 1000)) * 60),
                cps: Math.round(charCount / ((Date.now() - startTime) / 1000))
            })
        };
        return streamDisplay;
    }
    /**
     * Show API connection status during streaming
     */
    static showStreamingStatus(provider, model, status) {
        const statusIcons = {
            connecting: '🔗',
            streaming: '📡',
            complete: '✅',
            error: '❌'
        };
        const statusColors = {
            connecting: chalk.yellow,
            streaming: chalk.cyan,
            complete: chalk.green,
            error: chalk.red
        };
        const statusMessages = {
            connecting: 'Connecting to API...',
            streaming: 'Receiving response...',
            complete: 'Stream completed',
            error: 'Connection error'
        };
        const icon = statusIcons[status];
        const color = statusColors[status];
        const message = statusMessages[status];
        console.log(`${icon} ${color(message)} ${chalk.gray(`[${provider}/${model}]`)}`);
    }
    /**
     * Enhanced command help display
     */
    static showCommandHelp(commands) {
        this.showSectionHeader('Available Commands', '📋');
        commands.forEach(({ cmd, desc, example }) => {
            console.log(`  ${chalk.cyan.bold(cmd.padEnd(20))} ${chalk.white(desc)}`);
            if (example) {
                console.log(`  ${' '.repeat(20)} ${chalk.gray(example)}`);
            }
        });
        console.log();
    }
    /**
     * Interactive menu selector
     */
    static showMenu(title, options) {
        this.showSectionHeader(title, '📋');
        options.forEach((option, index) => {
            const prefix = chalk.cyan(`[${index + 1}]`);
            const label = chalk.white.bold(option.label);
            const desc = option.description ? chalk.gray(` - ${option.description}`) : '';
            console.log(`  ${prefix} ${label}${desc}`);
        });
        console.log();
    }
    /**
     * Pretty print JSON data
     */
    static showJSON(data, title) {
        if (title) {
            this.showSectionHeader(title, '📄');
        }
        const jsonString = JSON.stringify(data, null, 2);
        const highlighted = jsonString
            .replace(/"([^"]+)":/g, chalk.cyan('"$1"') + ':')
            .replace(/: "([^"]+)"/g, ': ' + chalk.green('"$1"'))
            .replace(/: (\d+)/g, ': ' + chalk.yellow('$1'))
            .replace(/: (true|false)/g, ': ' + chalk.magenta('$1'))
            .replace(/: null/g, ': ' + chalk.gray('null'));
        console.log(highlighted);
    }
    /**
     * Clear screen and show fresh interface
     */
    static clearScreen() {
        console.clear();
        this.showBanner();
    }
    /**
     * Separator line
     */
    static showSeparator(char = '─', length = 60) {
        console.log(chalk.gray(char.repeat(length)));
    }
    /**
     * Highlight code blocks
     */
    static showCode(code, language) {
        const lines = code.split('\n');
        const lineNumberWidth = lines.length.toString().length;
        console.log(chalk.gray('```' + (language || '')));
        lines.forEach((line, index) => {
            const lineNumber = chalk.gray((index + 1).toString().padStart(lineNumberWidth));
            console.log(`${lineNumber} │ ${chalk.white(line)}`);
        });
        console.log(chalk.gray('```'));
    }
    /**
     * Show typing effect for responses
     */
    static async typeText(text, speed = 30) {
        for (const char of text) {
            process.stdout.write(char);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        console.log();
    }
}
//# sourceMappingURL=UIComponents.js.map