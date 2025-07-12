import { ToolManager } from './ToolManager.js';
import { ToolCall, ToolResult } from '../providers/types.js';
import chalk from 'chalk';

export class ToolExecutionService {
  private toolManager: ToolManager;

  constructor() {
    this.toolManager = new ToolManager();
  }

  async executeToolFromText(input: string): Promise<string> {
    // Parse tool calls from natural language
    const toolCalls = this.parseToolCalls(input);
    
    if (toolCalls.length === 0) {
      return 'No valid tool calls found. Available tools: ' + this.toolManager.getToolNames().join(', ');
    }

    const results: string[] = [];
    for (const toolCall of toolCalls) {
      const result = await this.toolManager.executeTool(toolCall);
      
      if (result.error) {
        results.push(chalk.red(`❌ ${result.name}: ${result.error}`));
      } else {
        results.push(chalk.green(`✅ ${result.name}: ${JSON.stringify(result.result, null, 2)}`));
      }
    }

    return results.join('\n');
  }

  private parseToolCalls(input: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    
    // Simple pattern matching for tool calls
    // Format: toolname(arg1="value1", arg2="value2")
    const toolPattern = /(\w+)\s*\((.*?)\)/g;
    let match;
    
    while ((match = toolPattern.exec(input)) !== null) {
      const toolName = match[1];
      const argsString = match[2];
      
      // Check if tool exists
      if (this.toolManager.getTool(toolName)) {
        const args = this.parseArguments(argsString);
        toolCalls.push({
          name: toolName,
          arguments: args
        });
      }
    }

    // Also try to parse simple tool calls without parentheses
    const tools = this.toolManager.getTools();
    for (const tool of tools) {
      if (input.toLowerCase().includes(tool.name.toLowerCase())) {
        // Simple heuristic for common tools
        if (tool.name === 'get_current_time' && input.toLowerCase().includes('time')) {
          toolCalls.push({
            name: tool.name,
            arguments: {}
          });
        } else if (tool.name === 'get_system_info' && input.toLowerCase().includes('system')) {
          toolCalls.push({
            name: tool.name,
            arguments: {}
          });
        } else if (tool.name === 'calculate' && input.toLowerCase().includes('calculate')) {
          const mathMatch = input.match(/calculate\s+(.+)/i);
          if (mathMatch) {
            toolCalls.push({
              name: tool.name,
              arguments: { expression: mathMatch[1].trim() }
            });
          }
        } else if (tool.name === 'read_file' && input.toLowerCase().includes('read')) {
          const fileMatch = input.match(/read\s+(.+\.[\w]+)/i);
          if (fileMatch) {
            toolCalls.push({
              name: tool.name,
              arguments: { path: fileMatch[1].trim() }
            });
          }
        } else if (tool.name === 'list_files' && input.toLowerCase().includes('list')) {
          toolCalls.push({
            name: tool.name,
            arguments: { path: '.', recursive: true }
          });
        }
      }
    }

    return toolCalls;
  }

  private parseArguments(argsString: string): Record<string, any> {
    const args: Record<string, any> = {};
    
    // Simple argument parsing: key="value" or key=value
    const argPattern = /(\w+)\s*=\s*(?:"([^"]*)"|([^,\s]+))/g;
    let match;
    
    while ((match = argPattern.exec(argsString)) !== null) {
      const key = match[1];
      const value = match[2] || match[3];
      
      // Try to parse as number or boolean
      if (value === 'true') {
        args[key] = true;
      } else if (value === 'false') {
        args[key] = false;
      } else if (/^\d+$/.test(value)) {
        args[key] = parseInt(value);
      } else if (/^\d+\.\d+$/.test(value)) {
        args[key] = parseFloat(value);
      } else {
        args[key] = value;
      }
    }

    return args;
  }

  getAvailableTools(): string[] {
    return this.toolManager.getToolNames();
  }

  getToolDescription(toolName: string): string {
    const tool = this.toolManager.getTool(toolName);
    if (!tool) {
      return 'Tool not found';
    }
    
    let description = `${tool.name}: ${tool.description}\n`;
    
    if (tool.parameters.properties) {
      description += 'Parameters:\n';
      for (const [key, value] of Object.entries(tool.parameters.properties)) {
        const param = value as any;
        const required = tool.parameters.required?.includes(key) ? ' (required)' : '';
        description += `  - ${key}: ${param.description}${required}\n`;
      }
    }
    
    return description;
  }

  async executeManualTool(toolName: string, args: Record<string, any>): Promise<ToolResult> {
    const toolCall: ToolCall = {
      name: toolName,
      arguments: args
    };
    
    return await this.toolManager.executeTool(toolCall);
  }
}
