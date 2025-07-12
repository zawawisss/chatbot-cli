/**
 * Auto-completion handler for enhanced user experience
 */

import { createInterface } from 'readline';

export class AutoCompleteHandler {
  private commands: string[] = [
    '/help', '/setup', '/switch', '/stream', '/save', '/load', 
    '/providers', '/tools', '/clear', '/exit', '/dashboard', '/stats',
    '/config', '/history', '/export', '/import', '/theme', '/debug'
  ];

  private providers: string[] = [
    'gemini', 'deepseek', 'ollama', 'openai'
  ];

  private tools: string[] = [
    'read_file', 'write_file', 'list_files', 'file_info', 'create_directory',
    'delete_file', 'search_files', 'run_command', 'web_search', 'get_current_time',
    'calculate', 'generate_uuid', 'base64_encode', 'base64_decode', 'hash_text',
    'url_encode', 'url_decode', 'get_system_info'
  ];

  /**
   * Auto-complete function for readline
   */
  public autoComplete = (line: string): [string[], string] => {
    const trimmed = line.trim();
    
    // Command completion
    if (trimmed.startsWith('/')) {
      const hits = this.commands.filter(cmd => cmd.startsWith(trimmed));
      return [hits.length ? hits : this.commands, trimmed];
    }
    
    // Provider completion for /switch command
    if (trimmed.startsWith('/switch ')) {
      const providerPart = trimmed.substring(8);
      const hits = this.providers.filter(p => p.startsWith(providerPart));
      return [hits.map(p => `/switch ${p}`), trimmed];
    }
    
    // Tool completion for tool-related commands
    if (trimmed.includes('tool:')) {
      const toolPart = trimmed.split('tool:')[1];
      const hits = this.tools.filter(t => t.startsWith(toolPart));
      return [hits.map(t => trimmed.replace(toolPart, t)), trimmed];
    }
    
    // Default: show all commands
    return [this.commands, trimmed];
  };

  /**
   * Setup readline with auto-completion
   */
  public setupReadline(input: NodeJS.ReadableStream, output: NodeJS.WritableStream) {
    return createInterface({
      input,
      output,
      completer: this.autoComplete,
      history: [],
      removeHistoryDuplicates: true
    });
  }

  /**
   * Add custom command to auto-completion
   */
  public addCommand(command: string): void {
    if (!this.commands.includes(command)) {
      this.commands.push(command);
    }
  }

  /**
   * Remove command from auto-completion
   */
  public removeCommand(command: string): void {
    this.commands = this.commands.filter(cmd => cmd !== command);
  }

  /**
   * Get all available commands
   */
  public getCommands(): string[] {
    return [...this.commands];
  }
}
