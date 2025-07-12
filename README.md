# Multi-Provider Chatbot CLI

A command-line interface chatbot with **Agentic Mode** that supports multiple AI providers: **Gemini**, **DeepSeek API**, and **Ollama**. 

🚀 **NEW: Agentic Mode** - AI can now autonomously execute multiple tools in sequence to complete complex tasks, similar to Gemini CLI!

## Features

### 🤖 Agentic Mode (NEW!)
- **Autonomous Tool Execution**: AI can run multiple tools in sequence to complete complex tasks
- **Smart Task Detection**: Automatically determines when to use agentic vs normal mode
- **19 Built-in Tools**: File system, shell, web search, and utility tools
- **Real-time Progress**: Live monitoring of tool execution and task progress
- **Safety Controls**: Confirmation system for destructive operations
- **Configurable Limits**: Control max turns, tool calls, and timeouts

### 🚀 Core Features
- 🤖 **Multi-Provider Support**: Switch between Gemini, DeepSeek, and Ollama
- 💬 **Interactive Chat**: Real-time conversation with AI models
- 🔄 **Streaming Support**: Real-time streaming responses
- 📊 **Model Management**: List and switch between available models
- 💾 **Conversation History**: Save and load conversations
- ⚙️ **Configuration Management**: Easy setup and configuration

### 🛠️ Tool Integration (19 Tools)
- 📁 **File Operations**: Read, write, list, search, and manage files
- 🖥️ **Shell Commands**: Execute system commands safely
- 🌐 **Web Search**: Search the web using DuckDuckGo API
- 🔧 **Utilities**: Calculate, encode/decode, hash, UUID generation

## Installation

1. **Clone or download the project:**
   ```bash
   cd /Volumes/Data/google/chatbot-cli
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Install globally (optional):**
   ```bash
   npm install -g .
   ```

## Quick Start

### 1. Agentic Mode (Recommended)
```bash
# Start with agentic mode for autonomous tool execution
npm start -- --agentic
# or if installed globally
chatbot --agentic
```

### 2. Interactive Mode (Default)
```bash
npm start
# or if installed globally
chatbot
```

### 3. Setup Wizard
```bash
chatbot --setup
```

### 4. Agentic Single Task
```bash
# Let AI autonomously complete complex tasks
chatbot --agentic -q "Analyze my project structure and create a summary report"
chatbot --agentic -q "Create a React component with TypeScript"
chatbot --agentic -q "Find all TODO comments and create a task list"
```

### 5. Single Question (Normal Mode)
```bash
chatbot -q "What is the weather like today?"
```

### 6. Specify Provider
```bash
chatbot -p gemini -q "Write a hello world program"
chatbot -p deepseek -q "Explain quantum computing"
chatbot -p ollama -q "Tell me a joke"

# With agentic mode
chatbot --agentic -p gemini -q "Setup a Node.js project with Express"
```

## Configuration

The CLI will automatically create a configuration file at `~/.chatbot-cli/config.json` with the following structure:

```json
{
  "provider": "gemini",
  "temperature": 0.7,
  "maxTokens": 4096,
  "systemPrompt": "You are a helpful AI assistant.",
  "providers": {
    "gemini": {
      "apiKey": "your-gemini-api-key",
      "model": "gemini-1.5-flash"
    },
    "deepseek": {
      "apiKey": "your-deepseek-api-key",
      "baseUrl": "https://api.deepseek.com/v1",
      "model": "deepseek-chat"
    },
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "model": "llama3.2:latest"
    }
  }
}
```

## Environment Variables

You can also configure the CLI using environment variables:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
export DEEPSEEK_API_KEY="your-deepseek-api-key"
export OLLAMA_BASE_URL="http://localhost:11434"
```

## CLI Commands

### Basic Options
```bash
chatbot [options]

Options:
  -p, --provider <provider>     AI provider (gemini|deepseek|ollama)
  -m, --model <model>           Model to use
  -t, --temperature <temp>      Temperature (0.0-1.0)
  -s, --system <prompt>         System prompt
  -q, --question <question>     Single question
  --agentic                     Enable agentic mode (autonomous tools)
  --max-turns <number>          Maximum turns for agentic mode (default: 10)
  --max-tools <number>          Maximum tool calls (default: 50)
  --timeout <minutes>           Timeout for tasks in minutes (default: 5)
  --confirm-tools               Require confirmation for tool execution
  --no-progress                 Hide progress indicators
  --setup                       Run setup wizard
  --list-models                 List available models
  --debug                       Enable debug mode
```

### Agentic Mode Commands

When in agentic mode, you can use these special commands:

- `/agentic` - Toggle agentic mode on/off
- `/config` - Configure agentic settings (max turns, tools, timeout)
- `/stats` - Show current agentic statistics
- `/tools` - List all available tools with parameters
- `/demo [type]` - Run demonstration tasks (simple, files, analysis, task)
- `/help` - Show agentic mode help

**Example Demo Tasks:**
```bash
/demo simple    # Calculate 25 * 48 + 17 and show current time
/demo files     # List files and read package.json
/demo analysis  # Analyze project structure
/demo task      # System check and create report
```

### Interactive Mode Commands

Standard interactive commands:

- `/help` - Show available commands
- `/clear` - Clear conversation history
- `/history` - Show conversation history
- `/config` - Show current configuration
- `/models` - List available models
- `/tools` - List available tools (19 tools available)
- `/provider [name]` - Switch provider or show current
- `/model [name]` - Switch model or show current
- `/temperature [value]` - Set temperature
- `/stream <message>` - Send message with streaming response
- `/save` - Save conversation to file
- `/load` - Load conversation from file
- `/providers` - Show all providers with status
- `/switch <provider>` - Switch to a provider
- `/setup` - Run setup wizard
- `/quit` or `/exit` - Exit the CLI

## Provider Setup

### Gemini (Google AI)
1. Get API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set environment variable: `GEMINI_API_KEY=your-api-key`
3. Or use setup wizard: `chatbot --setup`

### DeepSeek API
1. Get API key from [DeepSeek Console](https://platform.deepseek.com/)
2. Set environment variable: `DEEPSEEK_API_KEY=your-api-key`
3. Or use setup wizard: `chatbot --setup`

### Ollama (Local)
1. Install [Ollama](https://ollama.ai/) locally
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama service: `ollama serve`
4. Set base URL (default: http://localhost:11434)

## Examples

### Agentic Mode Examples
```bash
# Complex multi-step tasks
chatbot --agentic -q "Create a new Node.js project with Express and TypeScript"
chatbot --agentic -q "Analyze all JavaScript files and fix syntax errors"
chatbot --agentic -q "Find all TODO comments and create a task list"

# With custom limits
chatbot --agentic --max-turns 15 --max-tools 75 --timeout 10 \
  -q "Setup a React project and create a basic component"

# Interactive agentic mode
chatbot --agentic
> Create a status report of my system
> /demo analysis
> /stats
```

### Basic Usage
```bash
# Start interactive mode
chatbot

# Ask a single question
chatbot -q "Explain machine learning"

# Use specific provider
chatbot -p deepseek -q "Write a Python function"

# Use streaming
chatbot -p ollama
> /stream Tell me a long story
```

### Advanced Usage
```bash
# Custom temperature and model
chatbot -p gemini -m gemini-1.5-pro -t 0.9 -q "Be creative"

# Debug mode
chatbot --debug -p ollama -q "What models do you have?"

# List available models
chatbot --list-models -p gemini
```

### Configuration Management
```bash
# Run setup wizard
chatbot --setup

# Show current config
chatbot
> /config

# Switch providers in interactive mode
chatbot
> /providers
> /switch deepseek
```

## Development

### Project Structure
```
src/
├── index.ts              # Main entry point
├── chatbot/
│   ├── ChatBot.ts        # Main chatbot class
│   └── ChatHistory.ts    # Chat history management
├── config/
│   └── Config.ts         # Configuration management
├── providers/
│   ├── types.ts          # Provider interfaces
│   ├── BaseProvider.ts   # Base provider class
│   ├── GeminiProvider.ts # Gemini implementation
│   ├── DeepSeekProvider.ts # DeepSeek implementation
│   ├── OllamaProvider.ts # Ollama implementation
│   └── ProviderFactory.ts # Provider factory
├── tools/
│   └── ToolManager.ts    # Tool management
└── ui/
    └── InteractiveMode.ts # Interactive UI
```

### Building
```bash
npm run build    # Build TypeScript
npm run dev      # Build and watch
npm run lint     # Run linting
npm run format   # Format code
```

### Testing
```bash
npm test         # Run tests
```

## Troubleshooting

### Common Issues

1. **API Key not working**
   - Verify API key is correct
   - Check if API key has proper permissions
   - Run `chatbot --setup` to reconfigure

2. **Ollama connection failed**
   - Ensure Ollama is running: `ollama serve`
   - Check if models are available: `ollama list`
   - Verify base URL is correct

3. **Model not found**
   - List available models: `chatbot --list-models`
   - Pull model for Ollama: `ollama pull model-name`

4. **Configuration issues**
   - Delete config file and run setup: `rm ~/.chatbot-cli/config.json && chatbot --setup`
   - Check environment variables

### Debug Mode
Enable debug mode to see detailed logging:
```bash
chatbot --debug
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

- [x] **Agentic Mode**: Autonomous tool execution (COMPLETED ✅)
- [x] **19 Built-in Tools**: File system, shell, web, utilities (COMPLETED ✅)
- [ ] Add more AI providers (OpenAI, Anthropic, etc.)
- [ ] Plugin system for custom tools
- [ ] Add conversation templates
- [ ] Web interface for agentic mode
- [ ] Learning system for task patterns
- [ ] Multi-language tool support
- [ ] Integration APIs for external services
# chatbot-cli
