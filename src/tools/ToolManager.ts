import { ToolDefinition, ToolCall, ToolResult } from '../providers/types.js';
import { FileSystemTools } from './FileSystemTools.js';
import { ShellTools } from './ShellTools.js';
import { WebSearchTools } from './WebSearchTools.js';
import { UtilityTools } from './UtilityTools.js';

export class ToolManager {
  private tools: Map<string, ToolDefinition> = new Map();
  private toolHandlers: Map<string, (args: any) => Promise<any>> = new Map();

  constructor() {
    this.registerAllTools();
  }

  private registerAllTools(): void {
    // Register File System Tools
    const fileSystemTools = FileSystemTools.getToolDefinitions();
    fileSystemTools.forEach(tool => {
      this.registerTool(tool, async (args) => {
        switch (tool.name) {
          case 'read_file':
            return await FileSystemTools.readFile(args.path);
          case 'write_file':
            return await FileSystemTools.writeFile(args.path, args.content, args.create_directories);
          case 'list_files':
            return await FileSystemTools.listFiles(args.path, args.pattern, args.include_hidden, args.recursive);
          case 'file_info':
            return await FileSystemTools.fileInfo(args.path);
          case 'create_directory':
            return await FileSystemTools.createDirectory(args.path, args.recursive);
          case 'delete_file':
            return await FileSystemTools.deleteFile(args.path, args.recursive);
          case 'search_files':
            return await FileSystemTools.searchFiles(args.pattern, args.path, args.file_pattern, args.case_sensitive);
          default:
            throw new Error(`Unknown file system tool: ${tool.name}`);
        }
      });
    });

    // Register Shell Tools
    const shellTools = ShellTools.getToolDefinitions();
    shellTools.forEach(tool => {
      this.registerTool(tool, async (args) => {
        switch (tool.name) {
          case 'run_command':
            return await ShellTools.runCommand(args.command, args.cwd, args.timeout);
          default:
            throw new Error(`Unknown shell tool: ${tool.name}`);
        }
      });
    });

    // Register Web Search Tools
    const webSearchTools = WebSearchTools.getToolDefinitions();
    webSearchTools.forEach(tool => {
      this.registerTool(tool, async (args) => {
        switch (tool.name) {
          case 'web_search':
            return await WebSearchTools.webSearch(args.query, args.no_html, args.region);
          default:
            throw new Error(`Unknown web search tool: ${tool.name}`);
        }
      });
    });

    // Register Utility Tools
    const utilityTools = UtilityTools.getToolDefinitions();
    utilityTools.forEach(tool => {
      this.registerTool(tool, async (args) => {
        switch (tool.name) {
          case 'get_current_time':
            return UtilityTools.getCurrentTime(args.format, args.timezone);
          case 'calculate':
            return UtilityTools.calculate(args.expression);
          case 'generate_uuid':
            return UtilityTools.generateUuid(args.version);
          case 'base64_encode':
            return UtilityTools.base64Encode(args.text);
          case 'base64_decode':
            return UtilityTools.base64Decode(args.encoded);
          case 'hash_text':
            return UtilityTools.hashText(args.text, args.algorithm);
          case 'url_encode':
            return UtilityTools.urlEncode(args.text);
          case 'url_decode':
            return UtilityTools.urlDecode(args.encoded);
          case 'get_system_info':
            return UtilityTools.getSystemInfo();
          default:
            throw new Error(`Unknown utility tool: ${tool.name}`);
        }
      });
    });
  }

  registerTool(definition: ToolDefinition, handler: (args: any) => Promise<any>): void {
    this.tools.set(definition.name, definition);
    this.toolHandlers.set(definition.name, handler);
  }

  unregisterTool(name: string): void {
    this.tools.delete(name);
    this.toolHandlers.delete(name);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  async executeTool(call: ToolCall): Promise<ToolResult> {
    const handler = this.toolHandlers.get(call.name);
    if (!handler) {
      return {
        name: call.name,
        result: null,
        error: `Tool '${call.name}' not found`
      };
    }

    try {
      const result = await handler(call.arguments);
      return {
        name: call.name,
        result
      };
    } catch (error) {
      return {
        name: call.name,
        result: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async executeTools(calls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    
    for (const call of calls) {
      const result = await this.executeTool(call);
      results.push(result);
    }
    
    return results;
  }

  validateToolCall(call: ToolCall): boolean {
    const tool = this.getTool(call.name);
    if (!tool) {
      return false;
    }

    // Basic validation - could be enhanced with proper JSON schema validation
    if (tool.parameters.required) {
      for (const required of tool.parameters.required) {
        if (!(required in call.arguments)) {
          return false;
        }
      }
    }

    return true;
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  hasTools(): boolean {
    return this.tools.size > 0;
  }

  clear(): void {
    this.tools.clear();
    this.toolHandlers.clear();
    this.registerAllTools();
  }
}
