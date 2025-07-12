import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { ToolDefinition } from '../providers/types.js';

export class FileSystemTools {
  static getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'read_file',
        description: 'Read the contents of a file',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to read'
            }
          },
          required: ['path']
        }
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to write'
            },
            content: {
              type: 'string',
              description: 'Content to write to the file'
            },
            create_directories: {
              type: 'boolean',
              description: 'Create parent directories if they don\'t exist',
              default: true
            }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'list_files',
        description: 'List files and directories in a path',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to list files from',
              default: '.'
            },
            pattern: {
              type: 'string',
              description: 'Glob pattern to filter files (e.g., "*.js", "**/*.ts")',
              default: '*'
            },
            include_hidden: {
              type: 'boolean',
              description: 'Include hidden files and directories',
              default: false
            },
            recursive: {
              type: 'boolean',
              description: 'List files recursively',
              default: false
            }
          }
        }
      },
      {
        name: 'file_info',
        description: 'Get information about a file or directory',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file or directory'
            }
          },
          required: ['path']
        }
      },
      {
        name: 'create_directory',
        description: 'Create a directory',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the directory to create'
            },
            recursive: {
              type: 'boolean',
              description: 'Create parent directories if they don\'t exist',
              default: true
            }
          },
          required: ['path']
        }
      },
      {
        name: 'delete_file',
        description: 'Delete a file or directory',
        parameters: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file or directory to delete'
            },
            recursive: {
              type: 'boolean',
              description: 'Delete directories recursively',
              default: false
            }
          },
          required: ['path']
        }
      },
      {
        name: 'search_files',
        description: 'Search for files containing specific text',
        parameters: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Text pattern to search for'
            },
            path: {
              type: 'string',
              description: 'Path to search in',
              default: '.'
            },
            file_pattern: {
              type: 'string',
              description: 'File pattern to search within (e.g., "*.js")',
              default: '*'
            },
            case_sensitive: {
              type: 'boolean',
              description: 'Case sensitive search',
              default: false
            }
          },
          required: ['pattern']
        }
      }
    ];
  }

  static async readFile(path: string): Promise<string> {
    try {
      const content = await fs.readFile(path, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async writeFile(path: string, content: string, createDirectories: boolean = true): Promise<string> {
    try {
      if (createDirectories) {
        const dir = dirname(path);
        await fs.mkdir(dir, { recursive: true });
      }
      
      await fs.writeFile(path, content, 'utf-8');
      return `File written successfully to ${path}`;
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async listFiles(path: string = '.', pattern: string = '*', includeHidden: boolean = false, recursive: boolean = false): Promise<any> {
    try {
      const files = await this.getFilesRecursive(path, pattern, includeHidden, recursive);
      
      const result = await Promise.all(files.map(async (file: string) => {
        try {
          const stats = await fs.stat(file);
          return {
            path: file,
            name: basename(file),
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime.toISOString(),
            extension: extname(file)
          };
        } catch (error) {
          return {
            path: file,
            name: basename(file),
            type: 'unknown',
            error: 'Could not read file stats'
          };
        }
      }));
      
      return {
        path: path,
        pattern: pattern,
        total: result.length,
        files: result
      };
    } catch (error) {
      throw new Error(`Failed to list files in ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async fileInfo(path: string): Promise<any> {
    try {
      const stats = await fs.stat(path);
      const result = {
        path: path,
        name: basename(path),
        type: stats.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        accessed: stats.atime.toISOString(),
        permissions: stats.mode.toString(8),
        extension: extname(path)
      };
      
      if (stats.isFile()) {
        // Add file-specific info
        result.extension = extname(path);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get file info for ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async createDirectory(path: string, recursive: boolean = true): Promise<string> {
    try {
      await fs.mkdir(path, { recursive });
      return `Directory created successfully: ${path}`;
    } catch (error) {
      throw new Error(`Failed to create directory ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async deleteFile(path: string, recursive: boolean = false): Promise<string> {
    try {
      const stats = await fs.stat(path);
      
      if (stats.isDirectory()) {
        if (recursive) {
          await fs.rm(path, { recursive: true, force: true });
        } else {
          await fs.rmdir(path);
        }
      } else {
        await fs.unlink(path);
      }
      
      return `Successfully deleted: ${path}`;
    } catch (error) {
      throw new Error(`Failed to delete ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async searchFiles(pattern: string, path: string = '.', filePattern: string = '*', caseSensitive: boolean = false): Promise<any> {
    try {
      const files = await this.getFilesRecursive(path, filePattern, false, true);
      
      const searchResults = [];
      const searchRegex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
      
      for (const file of files) {
        try {
          const stats = await fs.stat(file);
          if (stats.isFile()) {
            const content = await fs.readFile(file, 'utf-8');
            const lines = content.split('\n');
            const matches: any[] = [];
            
            lines.forEach((line, index) => {
              if (searchRegex.test(line)) {
                matches.push({
                  line: index + 1,
                  content: line.trim(),
                  match: line.match(searchRegex)
                });
              }
            });
            
            if (matches.length > 0) {
              searchResults.push({
                file: file,
                matches: matches,
                totalMatches: matches.length
              });
            }
          }
        } catch (error) {
          // Skip files that can't be read (binary files, permissions, etc.)
          continue;
        }
      }
      
      return {
        pattern: pattern,
        searchPath: path,
        filePattern: filePattern,
        totalFiles: searchResults.length,
        results: searchResults
      };
    } catch (error) {
      throw new Error(`Failed to search files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private static async getFilesRecursive(path: string, pattern: string, includeHidden: boolean, recursive: boolean): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(path, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(path, entry.name);
        
        // Skip hidden files if not included
        if (!includeHidden && entry.name.startsWith('.')) {
          continue;
        }
        
        if (entry.isDirectory()) {
          if (recursive) {
            const subFiles = await this.getFilesRecursive(fullPath, pattern, includeHidden, recursive);
            files.push(...subFiles);
          }
          if (this.matchesPattern(entry.name, pattern)) {
            files.push(fullPath);
          }
        } else {
          if (this.matchesPattern(entry.name, pattern)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // If we can't read the directory, just return empty array
      return [];
    }
    
    return files;
  }
  
  private static matchesPattern(filename: string, pattern: string): boolean {
    if (pattern === '*') {
      return true;
    }
    
    // Simple pattern matching - convert * to regex
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(filename);
  }
}
