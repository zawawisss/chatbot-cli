import { ToolDefinition, ToolCall, ToolResult } from '../providers/types.js';
export declare class ToolManager {
    private tools;
    private toolHandlers;
    constructor();
    private registerAllTools;
    registerTool(definition: ToolDefinition, handler: (args: any) => Promise<any>): void;
    unregisterTool(name: string): void;
    getTools(): ToolDefinition[];
    getTool(name: string): ToolDefinition | undefined;
    executeTool(call: ToolCall): Promise<ToolResult>;
    executeTools(calls: ToolCall[]): Promise<ToolResult[]>;
    validateToolCall(call: ToolCall): boolean;
    getToolNames(): string[];
    hasTools(): boolean;
    clear(): void;
}
//# sourceMappingURL=ToolManager.d.ts.map