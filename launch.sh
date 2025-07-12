#!/bin/bash

# Multi-Provider Chatbot CLI Launcher
# This script provides easy commands to run the chatbot

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Multi-Provider Chatbot CLI${NC}"
echo -e "${BLUE}================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js version 20 or higher.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="20.0.0"

if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Please install version 20 or higher.${NC}"
    exit 1
fi

# Check if built
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}📦 Building the project...${NC}"
    npm run build
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Function to display help
show_help() {
    echo -e "${GREEN}Available commands:${NC}"
    echo -e "  ${BLUE}./launch.sh${NC}                    - Start interactive mode"
    echo -e "  ${BLUE}./launch.sh setup${NC}              - Run setup wizard"
    echo -e "  ${BLUE}./launch.sh ask \"question\"${NC}      - Ask a single question"
    echo -e "  ${BLUE}./launch.sh gemini \"question\"${NC}   - Ask Gemini"
    echo -e "  ${BLUE}./launch.sh deepseek \"question\"${NC} - Ask DeepSeek"
    echo -e "  ${BLUE}./launch.sh ollama \"question\"${NC}   - Ask Ollama"
    echo -e "  ${BLUE}./launch.sh models${NC}              - List available models"
    echo -e "  ${BLUE}./launch.sh tools${NC}               - Show available tools"
    echo -e "  ${BLUE}./launch.sh config${NC}              - Show configuration"
    echo -e "  ${BLUE}./launch.sh help${NC}                - Show this help"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo -e "  ${BLUE}./launch.sh ask \"What is AI?\"${NC}"
    echo -e "  ${BLUE}./launch.sh gemini \"Write a Python function\"${NC}"
    echo -e "  ${BLUE}./launch.sh deepseek \"Explain machine learning\"${NC}"
}

# Parse command line arguments
case "${1:-interactive}" in
    "help"|"-h"|"--help")
        show_help
        ;;
    "setup")
        echo -e "${YELLOW}🔧 Starting setup wizard...${NC}"
        node dist/index.js --setup
        ;;
    "ask")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please provide a question: ./launch.sh ask \"your question\"${NC}"
            exit 1
        fi
        echo -e "${YELLOW}💬 Asking: $2${NC}"
        node dist/index.js -q "$2"
        ;;
    "gemini")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please provide a question: ./launch.sh gemini \"your question\"${NC}"
            exit 1
        fi
        echo -e "${YELLOW}💬 Asking Gemini: $2${NC}"
        node dist/index.js -p gemini -q "$2"
        ;;
    "deepseek")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please provide a question: ./launch.sh deepseek \"your question\"${NC}"
            exit 1
        fi
        echo -e "${YELLOW}💬 Asking DeepSeek: $2${NC}"
        node dist/index.js -p deepseek -q "$2"
        ;;
    "ollama")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please provide a question: ./launch.sh ollama \"your question\"${NC}"
            exit 1
        fi
        echo -e "${YELLOW}💬 Asking Ollama: $2${NC}"
        node dist/index.js -p ollama -q "$2"
        ;;
    "models")
        echo -e "${YELLOW}📊 Available models:${NC}"
        echo ""
        echo -e "${GREEN}Gemini models:${NC}"
        node dist/index.js --list-models -p gemini
        echo ""
        echo -e "${GREEN}DeepSeek models:${NC}"
        node dist/index.js --list-models -p deepseek
        echo ""
        echo -e "${GREEN}Ollama models:${NC}"
        node dist/index.js --list-models -p ollama
        ;;
    "config")
        echo -e "${YELLOW}⚙️ Current configuration:${NC}"
        if [ -f "$HOME/.chatbot-cli/config.json" ]; then
            cat "$HOME/.chatbot-cli/config.json"
        else
            echo -e "${RED}No configuration file found. Run setup first.${NC}"
        fi
        ;;
    "tools")
        echo -e "${YELLOW}🔧 Available tools:${NC}"
        node dist/index.js -q "/tools"
        ;;
    "interactive"|"")
        echo -e "${YELLOW}🚀 Starting interactive mode...${NC}"
        echo -e "${GREEN}Type /help for commands or /quit to exit${NC}"
        echo ""
        node dist/index.js
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
