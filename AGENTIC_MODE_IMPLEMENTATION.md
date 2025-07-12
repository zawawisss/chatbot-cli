# 🤖 Agentic Mode Implementation Guide

## Overview

Project **Multi-Provider Chatbot CLI** telah berhasil diupgrade dengan **Agentic Mode** yang memberikan kemampuan kepada AI untuk menjalankan tools secara autonomous untuk menyelesaikan tugas-tugas kompleks, mirip dengan Gemini CLI.

## 🚀 Fitur Utama Agentic Mode

### 1. **Autonomous Tool Execution**
- AI dapat menjalankan multiple tools secara berkesinambungan
- Sistem agentic loop yang dapat mengeksekusi hingga 10 turns dan 50 tool calls per task
- Support untuk timeout hingga 30 menit per task

### 2. **Advanced Task Analysis**
- Smart detection untuk menentukan apakah task perlu agentic mode
- Analysis berdasarkan complexity indicators dan keyword detection
- Automatic fallback ke normal mode untuk simple queries

### 3. **Tool Integration (19 Tools Available)**

#### **File System Tools**
- `read_file` - Membaca konten file
- `write_file` - Menulis konten ke file
- `list_files` - List files dalam direktori
- `file_info` - Informasi detail file
- `create_directory` - Membuat direktori
- `delete_file` - Menghapus file/direktori
- `search_files` - Pencarian dalam files

#### **Shell Tools**
- `run_command` - Eksekusi shell commands dengan safety checks

#### **Web Search Tools**
- `web_search` - Pencarian web menggunakan DuckDuckGo API

#### **Utility Tools**
- `get_current_time` - Waktu saat ini dengan format custom
- `calculate` - Kalkulator matematika
- `generate_uuid` - Generate UUID
- `base64_encode/decode` - Encoding/decoding base64
- `hash_text` - Hashing dengan algoritma custom
- `url_encode/decode` - URL encoding/decoding
- `get_system_info` - Informasi sistem

### 4. **Interactive Agentic Mode**
- Real-time progress monitoring
- Turn-by-turn execution feedback
- Tool confirmation system (opsional)
- Dynamic configuration adjustment

## 📁 Struktur Implementation

```
src/
├── chatbot/
│   ├── AgenticChatBot.ts       # Main agentic chatbot class
│   ├── ChatBot.ts              # Base chatbot class
│   └── ChatHistory.ts          # Chat history management
├── core/
│   └── AgenticTurn.ts          # Core agentic turn logic
├── tools/
│   ├── ToolManager.ts          # Tool management
│   ├── FileSystemTools.ts     # File operations
│   ├── ShellTools.ts           # Shell commands
│   ├── WebSearchTools.ts      # Web search
│   └── UtilityTools.ts        # Utility functions
├── ui/
│   ├── AgenticInteractiveMode.ts # Agentic UI
│   └── InteractiveMode.ts      # Standard UI
└── index.ts                    # Main entry point
```

## 🛠️ Configuration Options

### Agentic Configuration
```typescript
interface AgenticChatOptions {
  useAgenticLoop?: boolean;        // Enable/disable agentic mode
  maxTurns?: number;              // Maximum turns per task (default: 10)
  maxToolCalls?: number;          // Maximum tool calls (default: 50)
  timeout?: number;               // Timeout in milliseconds (default: 300000)
  requireConfirmation?: boolean;   // Require user confirmation for tools
  showProgress?: boolean;         // Show real-time progress
  debug?: boolean;                // Enable debug mode
}
```

## 🚀 Usage Examples

### 1. **Command Line Usage**

#### Agentic Mode untuk Single Task
```bash
# Enable agentic mode dengan single question
npm start -- --agentic -q "Analyze my project structure and create a summary report"

# Custom configuration
npm start -- --agentic --max-turns 15 --max-tools 75 --timeout 10 \
  -q "Create a React component with TypeScript and tests"
```

#### Interactive Agentic Mode
```bash
# Start dalam agentic interactive mode
npm start -- --agentic

# Atau menggunakan binary
chatbot --agentic
```

### 2. **Interactive Commands**

```bash
# Toggle agentic mode on/off
/agentic

# Configure agentic settings
/config

# Show current statistics
/stats

# List all available tools
/tools

# Run demonstration tasks
/demo simple      # Simple calculation and time demo
/demo files       # File operations demo
/demo analysis    # Project analysis demo
/demo task        # System check and report demo

# Show help
/help
```

### 3. **Example Complex Tasks**

#### **Development Tasks**
```
"Create a new Node.js project with Express and TypeScript"
"Analyze all JavaScript files and fix syntax errors"
"Setup a React project and create a basic component"
"Debug the failing tests and fix the issues"
```

#### **File Management**
```
"Find all TODO comments and create a task list"
"Organize files by type and create a directory structure"
"Search for security vulnerabilities in configuration files"
```

#### **System Analysis**
```
"Check system health and create a status report"
"Analyze disk usage and recommend cleanup actions"
"Monitor recent log files for errors"
```

## 🔧 Advanced Features

### 1. **Smart Task Detection**
Sistem automatically detects jika task memerlukan agentic mode berdasarkan:
- **Complexity indicators**: create, build, develop, implement, setup, configure, analyze, etc.
- **Multi-step indicators**: multiple sentences, conjunction words
- **Tool mentions**: referensi ke available tools
- **File operations**: mentions of files, directories, projects

### 2. **Safety & Confirmation**
```typescript
// Safe tools (auto-confirmed)
const safeTools = [
  'read_file', 'list_files', 'file_info', 'get_current_time',
  'calculate', 'get_system_info', 'web_search'
];

// Destructive tools (require confirmation in production)
const destructiveTools = [
  'write_file', 'delete_file', 'run_command'
];
```

### 3. **Event-Driven Architecture**
```typescript
enum TurnEventType {
  TurnStart = 'turn_start',
  ToolCallRequest = 'tool_call_request', 
  ToolCallResponse = 'tool_call_response',
  AIResponse = 'ai_response',
  TurnComplete = 'turn_complete',
  Error = 'error'
}
```

### 4. **Progress Monitoring**
Real-time feedback meliputi:
- Turn counter dan progress
- Tool execution status
- Success/error indicators
- Execution time tracking
- Statistics summary

## 📊 Performance & Limits

### Default Limits
- **Max Turns**: 10 per task
- **Max Tool Calls**: 50 per task  
- **Timeout**: 5 minutes per task
- **Turn Analysis**: Smart continuation detection

### Customizable via CLI
```bash
--max-turns 20        # Increase turn limit
--max-tools 100       # Increase tool call limit
--timeout 15          # 15 minute timeout
--confirm-tools       # Require confirmation
--no-progress         # Hide progress indicators
```

## 🎮 Demo Tasks

The system includes built-in demo tasks accessible via `/demo` command:

1. **Simple Demo**: `Calculate 25 * 48 + 17 and tell me the current time`
2. **Files Demo**: `List all files in the current directory and read package.json`
3. **Analysis Demo**: `Analyze the project structure and create a summary report`
4. **Task Demo**: `Check system info and create a status report file`

## 🔄 Tool Call Flow

1. **User Input** → Smart task analysis
2. **Complexity Detection** → Decide agentic vs normal mode
3. **Agentic Loop Execution**:
   - AI generates response with tool calls
   - Tools executed with safety checks
   - Results fed back to AI
   - Continue until task completion
4. **Final Response** → Comprehensive result delivery

## 🛡️ Error Handling

- **Tool Execution Errors**: Automatic retry dengan alternative approaches
- **Timeout Handling**: Graceful termination dengan partial results
- **API Errors**: Fallback ke normal mode
- **Validation**: Input validation untuk semua tool parameters

## 🔮 Future Enhancements

- [ ] **Plugin System**: Support untuk custom tools
- [ ] **Multi-language Support**: Tools dalam berbagai bahasa
- [ ] **Web Interface**: GUI untuk agentic mode
- [ ] **Conversation Templates**: Pre-defined complex task templates
- [ ] **Learning System**: AI learns dari successful task patterns
- [ ] **Integration APIs**: Connect dengan external services

## 📝 Migration Notes

### From Previous Version
1. **Backwards Compatibility**: Normal mode tetap berfungsi seperti sebelumnya
2. **New Dependencies**: No additional dependencies required
3. **Configuration**: Existing config files tetap kompatibel
4. **Commands**: All existing commands masih berfungsi

### Testing Migration
```bash
# Test normal mode (should work as before)
npm start

# Test agentic mode
npm start -- --agentic

# Test specific providers
npm start -- --agentic -p gemini -q "List files and show current time"
```

## 🎯 Best Practices

### 1. **Task Design**
- Be specific about desired outcomes
- Mention files/directories yang relevant
- Include context dan constraints

### 2. **Safety**
- Review destructive operations
- Use confirmation mode untuk production
- Monitor tool execution logs

### 3. **Performance**
- Adjust limits berdasarkan task complexity
- Use timeout yang reasonable
- Monitor resource usage

## 🏁 Conclusion

Implementation agentic mode ini memberikan capabilities yang powerful untuk:
- **Autonomous task execution**
- **Multi-step workflows** 
- **Tool integration**
- **Interactive monitoring**
- **Safety & control**

Project sekarang ready untuk production use dengan kemampuan agentic yang robust dan extensible.

---

## 📚 Additional Resources

- [Tool Development Guide](./docs/TOOL_DEVELOPMENT.md)
- [API Documentation](./docs/API.md)
- [Configuration Guide](./docs/CONFIGURATION.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
