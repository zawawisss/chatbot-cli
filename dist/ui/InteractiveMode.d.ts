import { Config } from '../config/Config.js';
export declare class InteractiveMode {
    private config;
    private chatbot;
    private isRunning;
    constructor(config: Config);
    start(): Promise<void>;
    private showWelcomeMessage;
    private getInput;
    private handleSystemCommand;
    private handleChatMessage;
    private handleStreamChat;
    private saveConversation;
    private loadConversation;
    private showProviders;
    private switchProvider;
    private showTools;
    runSetup(): Promise<void>;
    private configureProvider;
}
//# sourceMappingURL=InteractiveMode.d.ts.map