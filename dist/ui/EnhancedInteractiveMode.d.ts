import { Config } from '../config/Config.js';
export declare class EnhancedInteractiveMode {
    private config;
    private chatbot;
    private isRunning;
    private sessionInfo;
    private messageHistory;
    private rl;
    constructor(config: Config);
    start(): Promise<void>;
    private initializeUI;
    runSetup(): Promise<void>;
    private configureProvider;
    private showEnhancedWelcome;
    private startInteractiveLoop;
    private autoComplete;
    private handleEnhancedCommand;
    private handleEnhancedChat;
    private handleStreamingChat;
    private handleNonStreamingChat;
    private showSessionStats;
    private clearSession;
    private showProviderSwitcher;
    private switchProvider;
    private showEnhancedProviders;
}
//# sourceMappingURL=EnhancedInteractiveMode.d.ts.map