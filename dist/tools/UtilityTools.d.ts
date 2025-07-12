import { ToolDefinition } from '../providers/types.js';
export declare class UtilityTools {
    static getToolDefinitions(): ToolDefinition[];
    static getCurrentTime(format?: string, timezone?: string): string;
    static calculate(expression: string): number;
    static generateUuid(version?: number): string;
    static base64Encode(text: string): string;
    static base64Decode(encoded: string): string;
    static hashText(text: string, algorithm?: string): any;
    static urlEncode(text: string): string;
    static urlDecode(encoded: string): string;
    static getSystemInfo(): any;
}
//# sourceMappingURL=UtilityTools.d.ts.map