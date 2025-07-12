import { ToolDefinition } from '../providers/types.js';
export declare class ShellTools {
    static getToolDefinitions(): ToolDefinition[];
    static runCommand(command: string, cwd?: string, timeout?: number): Promise<any>;
}
//# sourceMappingURL=ShellTools.d.ts.map