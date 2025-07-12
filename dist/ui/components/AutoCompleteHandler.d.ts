/**
 * Auto-completion handler for enhanced user experience
 */
export declare class AutoCompleteHandler {
    private commands;
    private providers;
    private tools;
    /**
     * Auto-complete function for readline
     */
    autoComplete: (line: string) => [string[], string];
    /**
     * Setup readline with auto-completion
     */
    setupReadline(input: NodeJS.ReadableStream, output: NodeJS.WritableStream): import("readline").Interface;
    /**
     * Add custom command to auto-completion
     */
    addCommand(command: string): void;
    /**
     * Remove command from auto-completion
     */
    removeCommand(command: string): void;
    /**
     * Get all available commands
     */
    getCommands(): string[];
}
//# sourceMappingURL=AutoCompleteHandler.d.ts.map