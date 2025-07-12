# Multi-Provider Chatbot CLI - Installation & Usage Guide

## ✅ Successfully Created!

Your multi-provider chatbot CLI has been successfully created and is ready to use! It supports:

- **🤖 Gemini** (Google AI)
- **🧠 DeepSeek API** 
- **🏠 Ollama** (Local AI models)

## 🚀 Quick Start

### 1. Current Status
The CLI is already built and ready to use. You can run it in several ways:

```bash
# Using the global command (already installed)
chatbot --help

# Using Node.js directly
node dist/index.js --help

# Using the convenient launch script
./launch.sh help
```

### 2. Test the Installation

```bash
# Test with Gemini
chatbot -q "Hello, how are you?" -p gemini

# Test with DeepSeek
chatbot -q "What's 2+2?" -p deepseek

# Test with Ollama (if running locally)
chatbot -q "Tell me a joke" -p ollama
```

### 3. Interactive Mode

```bash
# Start interactive mode
chatbot

# Or using the launcher
./launch.sh
```

## 🔧 Configuration

The CLI automatically uses the API keys provided:

- **Gemini API Key**: `AIzaSyBOmrrmbsgTCZRG7Q5i21MPRmnfSAQGBZQ`
- **DeepSeek API Key**: `sk-1d04ba5a6dd2403f8d17e9e6ae67ba31`
- **Ollama Base URL**: `https://evident-ultimately-collie.ngrok-free.app`

Configuration is stored in `~/.chatbot-cli/config.json` and is created automatically on first run.

## 💡 Usage Examples

### Single Questions
```bash
# Ask Gemini
chatbot -p gemini -q "Explain quantum computing"

# Ask DeepSeek
chatbot -p deepseek -q "Write a Python function"

# Ask Ollama
chatbot -p ollama -q "What is machine learning?"
```

### Using the Launch Script
```bash
# Easy commands
./launch.sh gemini "Write a hello world program"
./launch.sh deepseek "Explain AI"
./launch.sh models  # List all available models
./launch.sh config  # Show configuration
```

### Interactive Mode Commands
Once in interactive mode, you can use:
- `/help` - Show commands
- `/switch gemini` - Switch to Gemini
- `/switch deepseek` - Switch to DeepSeek  
- `/switch ollama` - Switch to Ollama
- `/models` - List available models
- `/config` - Show configuration
- `/clear` - Clear conversation history
- `/save` - Save conversation
- `/load` - Load conversation
- `/quit` - Exit

## 🎛️ Advanced Features

### Custom Configuration
```bash
# Custom temperature and model
chatbot -p gemini -m gemini-1.5-pro -t 0.9 -q "Be creative"

# Custom system prompt
chatbot -s "You are a helpful coding assistant" -q "Help me debug this code"

# Debug mode
chatbot --debug -q "Test question"
```

### Setup Wizard
```bash
# Run setup to configure providers
chatbot --setup

# Or using launcher
./launch.sh setup
```

### Streaming Responses
```bash
# In interactive mode
chatbot
> /stream Tell me a long story

# The response will stream in real-time
```

## 📁 Project Structure

```
/Volumes/Data/google/chatbot-cli/
├── src/                     # Source code
│   ├── index.ts            # Main entry point
│   ├── chatbot/            # Core chatbot logic
│   ├── providers/          # AI provider implementations
│   ├── config/             # Configuration management
│   ├── tools/              # Tool integration
│   └── ui/                 # User interface
├── dist/                   # Built JavaScript files
├── node_modules/           # Dependencies
├── .env                    # Environment variables
├── launch.sh               # Convenient launcher script
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Documentation
```

## 🔧 Development

If you want to modify the code:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Development mode (watch for changes)
npm run dev

# Run tests
npm test

# Format code
npm run format
```

## 🏆 Features Implemented

✅ **Multi-Provider Support**: Switch between Gemini, DeepSeek, and Ollama
✅ **Interactive Mode**: Real-time chat with AI models
✅ **Streaming Support**: See responses as they're generated
✅ **Configuration Management**: Easy setup and configuration
✅ **Conversation History**: Save and load conversations
✅ **Model Management**: List and switch between models
✅ **Tool Integration**: Built-in tools for enhanced functionality
✅ **Global CLI**: Install and use from anywhere
✅ **Error Handling**: Graceful error handling and validation
✅ **Debug Mode**: Detailed logging for troubleshooting
✅ **Cross-Platform**: Works on macOS, Linux, and Windows

## 🎯 Ready to Use!

Your multi-provider chatbot CLI is now fully functional and ready to use. You can:

1. **Start chatting immediately** with any of the three providers
2. **Switch between providers** seamlessly
3. **Use streaming mode** for real-time responses
4. **Save and load conversations** for later reference
5. **Configure settings** through the setup wizard
6. **Use the convenient launcher** for quick commands

Enjoy your new AI-powered CLI tool! 🚀

## 🆘 Support

If you encounter any issues:

1. Check the configuration: `./launch.sh config`
2. Verify API keys are working: `chatbot --debug -q "test"`
3. Run setup wizard: `./launch.sh setup`
4. Check the logs in debug mode

The CLI is designed to be robust and user-friendly, with helpful error messages and fallback behavior.
