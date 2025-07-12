import { exec } from 'child_process';
import { promisify } from 'util';
import { ToolDefinition } from '../providers/types.js';

const execAsync = promisify(exec);

export class ShellTools {
  static getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'run_command',
        description: 'Execute a shell command',
        parameters: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Shell command to execute'
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds',
              default: 60000
            },
            cwd: {
              type: 'string',
              description: 'Current working directory'
            }
          },
          required: ['command']
        }
      }
    ];
  }

  static async runCommand(command: string, cwd?: string, timeout: number = 30000): Promise<any> {
    try {
      // Add signal and safer timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: cwd || process.cwd(),
        timeout: timeout,
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
        signal: controller.signal,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      clearTimeout(timeoutId);
      
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        command: command,
        cwd: cwd || process.cwd()
      };
    } catch (error: any) {
      const isTimeout = error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM';
      return {
        success: false,
        stdout: '',
        stderr: isTimeout ? `Command timed out after ${timeout}ms` : (error.message || String(error)),
        command: command,
        cwd: cwd || process.cwd(),
        timeout: isTimeout
      };
    }
  }
}
