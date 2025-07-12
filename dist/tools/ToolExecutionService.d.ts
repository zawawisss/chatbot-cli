import { ToolResult } from '../providers/types.js';
export declare class ToolExecutionService {
    private toolManager;
    constructor();
    executeToolFromText(input: string): Promise<string>;
    private parseToolCalls;
    private parseArguments;
    getAvailableTools(): string[];
    getToolDescription(toolName: string): string;
    executeManualTool(toolName: string, args: Record<string, any>): Promise<ToolResult>;
}
//# sourceMappingURL=ToolExecutionService.d.ts.map