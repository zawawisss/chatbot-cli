# Multi-Provider Chatbot CLI - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Development Journey](#development-journey)
3. [Current Architecture](#current-architecture)
4. [Features Implemented](#features-implemented)
5. [Current Issues & Errors](#current-issues--errors)
6. [Provider Configurations](#provider-configurations)
7. [Tool System](#tool-system)
8. [Function Calling Implementation](#function-calling-implementation)
9. [Testing Results](#testing-results)
10. [Next Steps](#next-steps)

## Project Overview

A multi-provider chatbot CLI tool that supports three AI providers (Gemini, DeepSeek API, and Ollama) with comprehensive tool integration capabilities. The project was inspired by the existing `gemini-cli` repository and designed to provide feature parity across all providers.

### Key Goals
- Support for 3 AI providers with identical features
- Comprehensive tool system for file operations, shell commands, web search, and utilities
- Function calling integration for automatic tool invocation
- Modular and extensible architecture
- Interactive and single-query modes

## Development Journey

### Phase 1: Initial Setup and Architecture (Start)
1. **Repository Analysis**: Analyzed the reference `gemini-cli` repository to understand structure and features
2. **Project Structure**: Created modular TypeScript project in `/Volumes/Data/google/chatbot-cli`
3. **Base Architecture**: Designed `BaseProvider` abstract class for consistent provider implementation
4. **Configuration System**: Implemented configuration management with API key support

### Phase 2: Provider Implementation
1. **Gemini Provider**: 
   - Implemented using Google's Generative AI SDK
   - Models: `gemini-2.5-flash`, `gemini-2.5-pro` (updated from original)
   - Function calling support integrated
   
2. **DeepSeek Provider**: 
   - Implemented using OpenAI-compatible API
   - Models: `deepseek-chat`, `deepseek-coder`
   - Function calling support added
   
3. **Ollama Provider**: 
   - Implemented for local model support
   - Models: `llama3.2`, `llama3.1`, `mistral`
   - Function calling support integrated

### Phase 3: Tool System Development
1. **Tool Manager**: Created centralized tool management system
2. **Tool Categories**: Implemented 19 tools across 4 categories:
   - File System Tools (7 tools)
   - Shell Tools (1 tool)
   - Web Search Tools (1 tool)
   - Utility Tools (10 tools)
3. **Security**: Added comprehensive security measures and error handling

### Phase 4: CLI Interface
1. **Command Interface**: Implemented comprehensive CLI with multiple options
2. **Interactive Mode**: Added interactive chat mode
3. **Launch Script**: Created convenient `launch.sh` script for easy usage
4. **Global Installation**: Made CLI globally available via npm

### Phase 5: Function Calling Integration
1. **API Integration**: Integrated function calling with all three providers
2. **Tool Execution**: Implemented automatic tool execution from AI responses
3. **Error Handling**: Added comprehensive error handling for tool operations
4. **Model Support**: Enabled function calling for specific models on each provider

## Current Architecture

```
chatbot-cli/
├── src/
│   ├── providers/
│   │   ├── BaseProvider.ts          # Abstract base class
│   │   ├── GeminiProvider.ts        # Google Gemini implementation
│   │   ├── DeepSeekProvider.ts      # DeepSeek API implementation
│   │   └── OllamaProvider.ts        # Ollama implementation
│   ├── tools/
│   │   ├── ToolManager.ts           # Tool orchestration
│   │   ├── FileSystemTools.ts       # File operations
│   │   ├── ShellTools.ts            # Shell command execution
│   │   ├── WebSearchTools.ts        # DuckDuckGo web search
│   │   └── UtilityTools.ts          # Utility functions
│   ├── config/
│   │   └── Config.ts                # Configuration management
│   ├── ui/
│   │   └── InteractiveMode.ts       # Interactive chat interface
│   └── index.ts                     # Main entry point
├── dist/                            # Compiled JavaScript
├── package.json
├── tsconfig.json
├── launch.sh                        # Convenience script
├── README.md
├── TOOLS.md                         # Tool documentation
└── SUMMARY.md                       # Project summary
```

## Features Implemented

### ✅ Working Features
1. **Multi-Provider Support**: All three providers (Gemini, DeepSeek, Ollama) are operational
2. **CLI Interface**: Comprehensive command-line interface with multiple options
3. **Single Query Mode**: `-q` flag for one-off questions
4. **Interactive Mode**: `-i` flag for continuous conversation
5. **Model Selection**: `-m` flag to specify models
6. **Temperature Control**: `-s` flag for generation temperature
7. **Configuration**: API key management and configuration files
8. **Global Installation**: Available as `chatbot` command globally
9. **Tool Registration**: All 19 tools are properly registered
10. **Manual Tool Invocation**: Tools can be invoked manually via commands

### ✅ Tools Implemented (19 Total)

#### File System Tools (7)
- `read_file`: Read file contents
- `write_file`: Write content to file
- `list_files`: List directory contents
- `file_info`: Get file/directory information
- `create_directory`: Create directories
- `delete_file`: Delete files/directories
- `search_files`: Search for text in files

#### Shell Tools (1)
- `run_command`: Execute shell commands

#### Web Search Tools (1)
- `web_search`: DuckDuckGo web search

#### Utility Tools (10)
- `get_current_time`: Get current date/time
- `calculate`: Mathematical calculations
- `generate_uuid`: Generate UUIDs
- `base64_encode`: Base64 encoding
- `base64_decode`: Base64 decoding
- `hash_text`: Text hashing
- `url_encode`: URL encoding
- `url_decode`: URL decoding
- `get_system_info`: System information

## Current Issues & Errors

### 🔴 Critical Issues

#### 1. Function Calling Not Working
- **Problem**: AI providers cannot automatically invoke tools
- **Symptoms**: 
  - Gemini responds with "I need the path to your package.json file" instead of using `read_file` tool
  - DeepSeek returns "Request failed with status code 400" 
  - Ollama function calling untested
- **Root Cause**: Function calling integration incomplete or incorrectly implemented

#### 2. DeepSeek API Authentication/Request Format Issues
- **Problem**: DeepSeek API consistently returns 400 errors
- **Potential Causes**:
  - Invalid API key format
  - Incorrect request structure for function calling
  - Missing required parameters
  - API endpoint issues

#### 3. Tool Execution Not Integrated
- **Problem**: Tools are registered but not accessible to AI providers
- **Symptoms**: 
  - `/tools` command shows available tools
  - AI cannot execute tools automatically
  - No automatic tool invocation from AI responses

### 🟡 Minor Issues

#### 1. Model Name Updates
- **Issue**: Gemini models need to be updated to `gemini-2.5-flash` and `gemini-2.5-pro`
- **Status**: Partially addressed but may need verification

#### 2. Error Handling
- **Issue**: Generic error messages don't provide specific debugging information
- **Impact**: Difficult to troubleshoot function calling issues

#### 3. Web Search Implementation
- **Issue**: DuckDuckGo API integration may need refinement
- **Status**: Basic implementation done but untested in function calling context

## Provider Configurations

### API Keys and Endpoints
```
Gemini API Key: AIzaSyBOmrrmbsgTCZRG7Q5i21MPRmnfSAQGBZQ
DeepSeek API Key: sk-1d04ba5a6dd2403f8d17e9e6ae67ba31
Ollama Base URL: https://evident-ultimately-collie.ngrok-free.app
```

### Model Support Matrix
| Provider | Models | Function Calling | Status |
|----------|---------|------------------|--------|
| Gemini | gemini-2.5-flash, gemini-2.5-pro | ✅ | Partially Working |
| DeepSeek | deepseek-chat, deepseek-coder | ✅ | Not Working |
| Ollama | llama3.2, llama3.1, mistral | ✅ | Untested |

## Tool System

### Tool Manager Implementation
```typescript
export class ToolManager {
  private tools: Map<string, Tool> = new Map();
  
  // Tool registration and execution
  registerTool(tool: Tool): void
  getTool(name: string): Tool | undefined
  getAvailableTools(): Tool[]
  async executeTool(name: string, params: any): Promise<any>
}
```

### Tool Interface
```typescript
export interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute(params: any): Promise<any>;
}
```

## Function Calling Implementation

### Current Implementation Status

#### Gemini Provider
- ✅ Function calling framework implemented
- ✅ Tool formatting for Gemini API
- ✅ Response parsing for function calls
- ❌ Not working in practice (doesn't invoke tools)

#### DeepSeek Provider
- ✅ Function calling framework implemented
- ✅ OpenAI-compatible tool formatting
- ✅ Response parsing for function calls
- ❌ API returns 400 errors

#### Ollama Provider
- ✅ Function calling framework implemented
- ✅ Tool formatting for Ollama API
- ✅ Response parsing for function calls
- ❓ Untested

### Function Call Detection Logic
```typescript
// Each provider implements:
supportsToolCalling(): boolean
private formatToolsForAPI(): any[]
private handleToolCalls(response: any): Promise<string>
```

## Testing Results

### Basic CLI Functionality
```bash
# ✅ Working
chatbot --help                    # Shows help
chatbot -q "Hello" -p gemini     # Basic query works
chatbot -q "What's 2+2?" -p deepseek  # Basic query works (when API works)

# ❌ Not Working
chatbot -q "Read package.json" -p gemini      # Should use read_file tool
chatbot -q "List current directory" -p gemini # Should use list_files tool
```

### Tool System Testing
```bash
# ✅ Working
./launch.sh ask "/tools"         # Shows available tools

# ❌ Not Working
./launch.sh ask "/list_files"    # Should execute list_files tool
./launch.sh ask "/read_file package.json"  # Should read file
```

### API Testing
```bash
# ✅ Gemini API: Working for basic queries
# ❌ DeepSeek API: 400 errors consistently
# ❓ Ollama API: Untested
```

## Next Steps

### Immediate Priorities (Critical)

1. **Fix Function Calling Integration**
   - Debug why Gemini doesn't invoke tools automatically
   - Research Gemini Function Calling API documentation
   - Verify tool schema format matches API expectations

2. **Resolve DeepSeek API Issues**
   - Verify API key validity
   - Check request format against DeepSeek API documentation
   - Debug 400 error responses

3. **Test and Fix Ollama Integration**
   - Test function calling with Ollama models
   - Verify API compatibility
   - Debug any issues found

### Secondary Priorities

4. **Improve Error Handling**
   - Add detailed error messages
   - Implement debug mode for troubleshooting
   - Add API response logging

5. **Enhance Tool System**
   - Add tool validation
   - Implement tool chaining
   - Add custom tool plugin system

6. **Testing and Validation**
   - Create automated tests for function calling
   - Test all 19 tools with each provider
   - Validate web search functionality

### Future Enhancements

7. **Advanced Features**
   - Tool result caching
   - Conversation history
   - Context-aware tool selection
   - Multi-step tool workflows

8. **UI/UX Improvements**
   - Better interactive mode
   - Progress indicators for long-running tools
   - Rich text formatting for responses

## Conclusion

The multi-provider chatbot CLI has a solid foundation with comprehensive tool support and modular architecture. The main blocker is the function calling integration, which needs debugging and potentially re-implementation based on each provider's specific API requirements.

The project demonstrates good software engineering practices with clear separation of concerns, comprehensive error handling, and extensive tool support. Once function calling is working, this will be a powerful and flexible chatbot CLI tool.

**Current Status**: 🟡 **Partially Functional** - Basic chat works, but automatic tool invocation (the key feature) is not working.

**Priority**: 🔴 **Fix function calling integration across all providers**
