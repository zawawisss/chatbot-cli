/**
 * Agentic Interactive Mode
 * Enhanced interactive mode with agentic loop capabilities
 */
import { AgenticChatBot, AgenticChatOptions } from '../chatbot/AgenticChatBot.js';
import { Config } from '../config/Config.js';
import { InteractiveMode } from './InteractiveMode.js';
export declare class AgenticInteractiveMode extends InteractiveMode {
    private agenticBot;
    private agenticOptions;
    constructor(agenticBot: AgenticChatBot, config: Config, options?: AgenticChatOptions);
    start(): Promise<void>;
    private showAgenticWelcome;
    private getPromptMessage;
    private handleAgenticCommands;
    private processInput;
    private toggleAgenticMode;
    private configureAgenticMode;
    private showStats;
    private showAgenticTools;
    private showHelp;
    private runDemo;
}
//# sourceMappingURL=AgenticInteractiveMode.d.ts.map