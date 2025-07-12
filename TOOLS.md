# Tools Documentation

## Overview

The Multi-Provider Chatbot CLI has been enhanced with a comprehensive set of tools to extend its functionality beyond simple text generation. These tools enable the chatbot to interact with the file system, execute shell commands, perform web searches, and handle various utility operations.

## Available Tools

### 📁 File System Tools

#### `read_file`
- **Description**: Read the contents of a file
- **Parameters**: 
  - `path` (required): Path to the file to read
- **Usage**: Perfect for reading configuration files, source code, or any text file
- **Example**: `read_file package.json`

#### `write_file`
- **Description**: Write content to a file
- **Parameters**:
  - `path` (required): Path to the file to write
  - `content` (required): Content to write to the file
  - `create_directories` (optional): Create parent directories if they don't exist (default: true)
- **Usage**: Create new files or overwrite existing ones
- **Example**: `write_file hello.txt "Hello World!"`

#### `list_files`
- **Description**: List files and directories in a path
- **Parameters**:
  - `path` (optional): Path to list files from (default: current directory)
  - `pattern` (optional): Glob pattern to filter files (default: "*")
  - `include_hidden` (optional): Include hidden files (default: false)
  - `recursive` (optional): List files recursively (default: false)
- **Usage**: Browse directory contents, find specific file types
- **Example**: `list_files . *.js true true`

#### `file_info`
- **Description**: Get information about a file or directory
- **Parameters**:
  - `path` (required): Path to the file or directory
- **Usage**: Get file size, modification date, permissions, etc.
- **Example**: `file_info package.json`

#### `create_directory`
- **Description**: Create a directory
- **Parameters**:
  - `path` (required): Path of the directory to create
  - `recursive` (optional): Create parent directories if they don't exist (default: true)
- **Usage**: Create new directories for organizing files
- **Example**: `create_directory ./new-project/src`

#### `delete_file`
- **Description**: Delete a file or directory
- **Parameters**:
  - `path` (required): Path to the file or directory to delete
  - `recursive` (optional): Delete directories recursively (default: false)
- **Usage**: Remove unwanted files or directories
- **Example**: `delete_file temp.txt`

#### `search_files`
- **Description**: Search for files containing specific text
- **Parameters**:
  - `pattern` (required): Text pattern to search for
  - `path` (optional): Path to search in (default: current directory)
  - `file_pattern` (optional): File pattern to search within (default: "*")
  - `case_sensitive` (optional): Case sensitive search (default: false)
- **Usage**: Find files containing specific code, text, or patterns
- **Example**: `search_files "import React" ./src *.tsx`

### 🖥️ Shell Tools

#### `run_command`
- **Description**: Execute a shell command
- **Parameters**:
  - `command` (required): Shell command to execute
  - `timeout` (optional): Timeout in milliseconds (default: 60000)
  - `cwd` (optional): Current working directory
- **Usage**: Run system commands, scripts, or utilities
- **Example**: `run_command "ls -la"`

### 🌐 Web Search Tools

#### `web_search`
- **Description**: Perform a web search using DuckDuckGo
- **Parameters**:
  - `query` (required): Search query
  - `no_html` (optional): Exclude HTML from results (default: true)
  - `region` (optional): Region to target the search (default: "wt-wt")
- **Usage**: Get information from the web about current topics
- **Example**: `web_search "Node.js tutorial"`

### 🔧 Utility Tools

#### `get_current_time`
- **Description**: Get the current date and time
- **Parameters**:
  - `format` (optional): Format: iso, local, or timestamp (default: "iso")
  - `timezone` (optional): Timezone (default: "local")
- **Usage**: Get current time for logging, timestamps, etc.
- **Example**: `get_current_time local`

#### `calculate`
- **Description**: Perform mathematical calculations
- **Parameters**:
  - `expression` (required): Mathematical expression to evaluate
- **Usage**: Perform math operations safely
- **Example**: `calculate "2 + 3 * 4"`

#### `generate_uuid`
- **Description**: Generate a random UUID
- **Parameters**:
  - `version` (optional): UUID version (4 supported) (default: 4)
- **Usage**: Generate unique identifiers
- **Example**: `generate_uuid`

#### `base64_encode`
- **Description**: Encode text to base64
- **Parameters**:
  - `text` (required): Text to encode
- **Usage**: Encode data for transmission or storage
- **Example**: `base64_encode "Hello World"`

#### `base64_decode`
- **Description**: Decode base64 to text
- **Parameters**:
  - `encoded` (required): Base64 encoded string
- **Usage**: Decode base64 data back to text
- **Example**: `base64_decode "SGVsbG8gV29ybGQ="`

#### `hash_text`
- **Description**: Generate hash of text
- **Parameters**:
  - `text` (required): Text to hash
  - `algorithm` (optional): Hash algorithm (md5, sha1, sha256, sha512) (default: "sha256")
- **Usage**: Create checksums or hashes for verification
- **Example**: `hash_text "password123" sha256`

#### `url_encode`
- **Description**: URL encode text
- **Parameters**:
  - `text` (required): Text to URL encode
- **Usage**: Prepare text for URL parameters
- **Example**: `url_encode "hello world"`

#### `url_decode`
- **Description**: URL decode text
- **Parameters**:
  - `encoded` (required): URL encoded string
- **Usage**: Decode URL-encoded text
- **Example**: `url_decode "hello%20world"`

#### `get_system_info`
- **Description**: Get system information
- **Parameters**: None
- **Usage**: Get information about the current system
- **Example**: `get_system_info`

## How to Use Tools

### Current Status

The tools infrastructure is implemented and can be listed using:
```bash
./launch.sh tools
# or
chatbot -q "/tools"
```

### Tool Integration with AI Providers

Currently, the tools are available as system commands but are not yet integrated with the AI providers for automatic function calling. The tools can be:

1. **Listed**: Use `/tools` command to see all available tools
2. **Called manually**: Through system commands (not yet implemented)
3. **Future enhancement**: Direct integration with AI providers for automatic tool calling

### Accessing Tools

You can access information about tools using:
```bash
# List all available tools
./launch.sh tools

# In interactive mode
chatbot
> /tools

# Get help about CLI commands
chatbot
> /help
```

### Implementation Details

- **Architecture**: Modular design with separate tool classes
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Safe execution with proper input validation
- **Performance**: Efficient implementation with proper resource management

## Future Enhancements

- **Function Calling**: Direct integration with AI providers for automatic tool execution
- **Custom Tools**: Plugin system for adding custom tools
- **Tool Chaining**: Ability to chain multiple tools together
- **Interactive Tool Use**: GUI-like interaction for complex tools
- **Tool Permissions**: Fine-grained control over tool access and execution

## Security Considerations

- File system operations are restricted to the current working directory context
- Shell commands have timeout limitations
- Input validation prevents malicious code execution
- Web search uses DuckDuckGo API (no personal data collection)

## Contributing

To add new tools:

1. Create a new tool class in `/src/tools/`
2. Implement the required interfaces
3. Add tool definitions and handlers
4. Update the ToolManager to register the new tools
5. Add documentation and examples

The tools system is designed to be extensible and secure, following the same patterns established in the gemini-cli reference implementation.
