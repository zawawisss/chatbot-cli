#!/usr/bin/env node
import { program } from 'commander';
import { ChatBot } from './chatbot/ChatBot.js';
import { Config } from './config/Config.js';
import { EnhancedInteractiveMode } from './ui/EnhancedInteractiveMode.js';
import { ConversationManager } from './utils/ConversationManager.js';
import { EnhancedErrorHandler } from './utils/ErrorHandler.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');
import chalk from 'chalk';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
program
    .name('chatbot')
    .description('Multi-provider agentic chatbot CLI with autonomous tool execution')
    .version(packageJson.version);
program
    .option('-p, --provider <provider>', 'AI provider to use (gemini, deepseek, ollama)', 'gemini')
    .option('-m, --model <model>', 'Model to use')
    .option('-t, --temperature <temperature>', 'Temperature for generation (0.0-1.0)', '0.7')
    .option('-s, --system <system>', 'System prompt')
    .option('-c, --config <config>', 'Path to config file')
    .option('-i, --interactive', 'Start in interactive mode', false)
    .option('-q, --question <question>', 'Single question to ask')
    .option('--max-turns <number>', 'Maximum turns for agentic mode', '10')
    .option('--max-tools <number>', 'Maximum tool calls for agentic mode', '50')
    .option('--timeout <minutes>', 'Timeout for agentic tasks in minutes', '5')
    .option('--confirm-tools', 'Require confirmation for tool execution', false)
    .option('--no-progress', 'Hide progress indicators')
    .option('--setup', 'Run setup wizard')
    .option('--list-models', 'List available models for the provider')
    .option('--debug', 'Enable debug mode')
    .action(async (options) => {
    try {
        const config = new Config(options.config);
        await config.load();
        // Override config with CLI options
        if (options.provider)
            config.set('provider', options.provider);
        if (options.model)
            config.set('model', options.model);
        if (options.temperature)
            config.set('temperature', parseFloat(options.temperature));
        if (options.system)
            config.set('systemPrompt', options.system);
        if (options.debug)
            config.set('debug', true);
        // Setup wizard
        if (options.setup) {
            const interactive = new EnhancedInteractiveMode(config);
            // Note: EnhancedInteractiveMode handles setup differently, using built-in runSetup method
            // For now, we'll use a simple approach for setup command
            await interactive.runSetup();
            return;
        }
        // List models
        if (options.listModels) {
            const chatbot = new ChatBot(config);
            const models = await chatbot.listModels();
            console.log(chalk.green('Available models:'));
            models.forEach(model => console.log(`  - ${model}`));
            return;
        }
        // Single question mode with automatic agent detection
        if (options.question) {
            // Create agentic chatbot with automatic mode detection
            const agenticConfig = {
                useAgenticLoop: true, // Always enable agentic loop
                maxTurns: parseInt(options.maxTurns),
                maxToolCalls: parseInt(options.maxTools),
                timeout: parseInt(options.timeout) * 60 * 1000, // Convert to milliseconds
                requireConfirmation: options.confirmTools,
                showProgress: !options.noProgress,
                debug: options.debug || false
            };
            const chatbot = new ChatBot(config, agenticConfig);
            console.log(chalk.blue('🤖 Analyzing task and determining optimal approach...'));
            const result = await chatbot.executeAgenticTask(options.question);
            console.log(chalk.green('\n✅ Task completed!'));
            console.log(chalk.cyan('Final result:'));
            console.log(result.finalResponse);
            if (result.toolsUsed.length > 0) {
                console.log(chalk.yellow(`\n🔧 Tools used: ${result.toolsUsed.join(', ')}`));
            }
            console.log(chalk.gray(`Turns: ${result.totalTurns}, Time: ${Math.round(result.totalTime / 1000)}s`));
            return;
        }
        // Interactive mode (default) - Always use enhanced mode with automatic agent detection
        const agenticConfig = {
            useAgenticLoop: true, // Always enable agentic loop with smart detection
            maxTurns: parseInt(options.maxTurns),
            maxToolCalls: parseInt(options.maxTools),
            timeout: parseInt(options.timeout) * 60 * 1000,
            requireConfirmation: options.confirmTools,
            showProgress: !options.noProgress,
            debug: options.debug || false
        };
        const chatbot = new ChatBot(config, agenticConfig);
        console.log(chalk.blue('🤖 Starting intelligent chatbot with automatic task detection...'));
        const interactive = new EnhancedInteractiveMode(config);
        await interactive.start();
    }
    catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
// Conversation management commands
program
    .command('sessions')
    .description('Manage conversation sessions')
    .action(async () => {
    try {
        const conversationManager = new ConversationManager();
        const sessions = await conversationManager.listSessions();
        if (sessions.length === 0) {
            console.log(chalk.yellow('No conversation sessions found.'));
            return;
        }
        console.log(chalk.green('📚 Conversation Sessions:'));
        console.log('');
        sessions.forEach((session, index) => {
            const isRecent = (Date.now() - session.updatedAt.getTime()) < (24 * 60 * 60 * 1000);
            const timeAgo = Math.round((Date.now() - session.updatedAt.getTime()) / (1000 * 60));
            const timeStr = timeAgo < 60 ? `${timeAgo}m ago` :
                timeAgo < 1440 ? `${Math.round(timeAgo / 60)}h ago` :
                    `${Math.round(timeAgo / 1440)}d ago`;
            console.log(`${index + 1}. ${chalk.blue(session.name)}`);
            console.log(`   ID: ${session.id}`);
            console.log(`   Provider: ${session.provider} (${session.model})`);
            console.log(`   Messages: ${session.messages.length}`);
            console.log(`   Updated: ${timeStr} ${isRecent ? '🟢' : ''}`);
            console.log('');
        });
    }
    catch (error) {
        EnhancedErrorHandler.logError(error, 'List Sessions');
    }
});
program
    .command('session')
    .description('Session operations')
    .argument('[action]', 'Action: load, delete, export, summary')
    .argument('[sessionId]', 'Session ID')
    .option('-f, --format <format>', 'Export format (json, txt, markdown)', 'json')
    .action(async (action, sessionId, options) => {
    try {
        const conversationManager = new ConversationManager();
        switch (action) {
            case 'load':
                if (!sessionId) {
                    console.log(chalk.red('Session ID required for load operation'));
                    return;
                }
                await conversationManager.loadSession(sessionId);
                break;
            case 'delete':
                if (!sessionId) {
                    console.log(chalk.red('Session ID required for delete operation'));
                    return;
                }
                await conversationManager.deleteSession(sessionId);
                break;
            case 'export':
                if (!sessionId) {
                    console.log(chalk.red('Session ID required for export operation'));
                    return;
                }
                const exportPath = await conversationManager.exportSession(sessionId, options.format);
                console.log(chalk.green(`Exported to: ${exportPath}`));
                break;
            case 'summary':
                const summary = await conversationManager.getSessionSummary();
                console.log(summary);
                break;
            default:
                console.log(chalk.yellow('Available actions: load, delete, export, summary'));
        }
    }
    catch (error) {
        EnhancedErrorHandler.logError(error, 'Session Operation');
    }
});
// Tools management commands
program
    .command('tools')
    .description('List available tools')
    .option('--category <category>', 'Filter by category (filesystem, shell, web, utility)')
    .action(async (options) => {
    try {
        const config = new Config();
        await config.load();
        const chatbot = new ChatBot(config);
        const tools = await chatbot.getAvailableTools();
        console.log(chalk.green('🔧 Available Tools:'));
        console.log('');
        const categories = {
            filesystem: [],
            shell: [],
            web: [],
            utility: []
        };
        tools.forEach((tool) => {
            if (tool.name.includes('file') || tool.name.includes('directory')) {
                categories.filesystem.push(tool);
            }
            else if (tool.name.includes('command')) {
                categories.shell.push(tool);
            }
            else if (tool.name.includes('search') || tool.name.includes('web')) {
                categories.web.push(tool);
            }
            else {
                categories.utility.push(tool);
            }
        });
        Object.entries(categories).forEach(([category, categoryTools]) => {
            if (options.category && category !== options.category)
                return;
            if (categoryTools.length === 0)
                return;
            console.log(chalk.blue(`📁 ${category.toUpperCase()} TOOLS:`));
            categoryTools.forEach(tool => {
                console.log(`  • ${chalk.green(tool.name)} - ${tool.description}`);
            });
            console.log('');
        });
    }
    catch (error) {
        EnhancedErrorHandler.logError(error, 'List Tools');
    }
});
// Health check command
program
    .command('health')
    .description('Check health of all providers')
    .action(async () => {
    try {
        console.log(chalk.blue('🏥 Health Check - Multi-Provider Chatbot CLI'));
        console.log('');
        const providers = ['gemini', 'deepseek', 'ollama'];
        for (const provider of providers) {
            console.log(chalk.yellow(`Checking ${provider}...`));
            try {
                const config = new Config();
                await config.load();
                config.set('provider', provider);
                const chatbot = new ChatBot(config);
                const response = await chatbot.ask('Hello, this is a health check.');
                console.log(chalk.green(`✅ ${provider.toUpperCase()}: Healthy`));
            }
            catch (error) {
                console.log(chalk.red(`❌ ${provider.toUpperCase()}: ${EnhancedErrorHandler.formatErrorForUser(error)}`));
            }
            console.log('');
        }
    }
    catch (error) {
        EnhancedErrorHandler.logError(error, 'Health Check');
    }
});
program.parse();
//# sourceMappingURL=index.js.map