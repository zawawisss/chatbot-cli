import { ToolDefinition } from '../providers/types.js';
export declare class FileSystemTools {
    static getToolDefinitions(): ToolDefinition[];
    static readFile(path: string): Promise<string>;
    static writeFile(path: string, content: string, createDirectories?: boolean): Promise<string>;
    static listFiles(path?: string, pattern?: string, includeHidden?: boolean, recursive?: boolean): Promise<any>;
    static fileInfo(path: string): Promise<any>;
    static createDirectory(path: string, recursive?: boolean): Promise<string>;
    static deleteFile(path: string, recursive?: boolean): Promise<string>;
    static searchFiles(pattern: string, path?: string, filePattern?: string, caseSensitive?: boolean): Promise<any>;
    private static getFilesRecursive;
    private static matchesPattern;
}
//# sourceMappingURL=FileSystemTools.d.ts.map