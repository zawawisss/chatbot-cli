import axios, { AxiosInstance } from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { ProviderType, Message, ChatOptions, ChatResponse, StreamResponse, ModelInfo, ProviderConfig, ToolCall, ToolResult } from './types.js';
import { ToolManager } from '../tools/ToolManager.js';

export class OllamaProvider extends BaseProvider {
  name: ProviderType = 'ollama';
  private client: AxiosInstance;
  private toolManager: ToolManager;

  constructor(config: ProviderConfig) {
    super(config);
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'http://localhost:11434',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Multi-Provider-Chatbot-CLI/1.0.0'
      },
      timeout: config.timeout || 60000 // Ollama can be slower
    });
    
    this.toolManager = new ToolManager();
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
    try {
      const formattedMessages = this.formatMessages(messages, options?.systemPrompt);
      
      const modelName = options?.model || this.getDefaultModel();
      const requestData: any = {
        model: modelName,
        messages: formattedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: false,
        options: {
          temperature: options?.temperature ?? this.config.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? this.config.maxTokens ?? 4096,
          top_p: options?.topP ?? 1,
          top_k: options?.topK ?? 40,
        }
      };
      
      // Only add tools for models that support function calling
      if (this.supportsToolCalling(modelName)) {
        requestData.tools = this.getOllamaTools();
      }

      const response = await this.client.post('/api/chat', requestData);
      
      // Handle tool calls (Ollama format may vary)
      if (response.data.message.tool_calls && response.data.message.tool_calls.length > 0) {
        const toolResults: ToolResult[] = [];
        
        for (const toolCall of response.data.message.tool_calls) {
          const call: ToolCall = {
            name: toolCall.function.name,
            arguments: typeof toolCall.function.arguments === 'string' 
              ? JSON.parse(toolCall.function.arguments) 
              : toolCall.function.arguments
          };
          
          const result = await this.toolManager.executeTool(call);
          toolResults.push(result);
        }
        
        // Send tool results back
        const messagesWithToolResults = [
          ...formattedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'assistant',
            content: response.data.message.content || '',
            tool_calls: response.data.message.tool_calls
          },
          ...toolResults.map(result => ({
            role: 'tool',
            content: result.error ? `Error: ${result.error}` : JSON.stringify(result.result)
          }))
        ];
        
        const followupData = {
          ...requestData,
          messages: messagesWithToolResults
        };
        
        const followupResponse = await this.client.post('/api/chat', followupData);
        
        return {
          content: followupResponse.data.message.content,
          usage: {
            promptTokens: (response.data.prompt_eval_count || 0) + (followupResponse.data.prompt_eval_count || 0),
            completionTokens: (response.data.eval_count || 0) + (followupResponse.data.eval_count || 0),
            totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0) + (followupResponse.data.prompt_eval_count || 0) + (followupResponse.data.eval_count || 0)
          },
          model: response.data.model
        };
      }
      
      return {
        content: response.data.message.content,
        usage: {
          promptTokens: response.data.prompt_eval_count || 0,
          completionTokens: response.data.eval_count || 0,
          totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
        },
        model: response.data.model
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async* streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamResponse> {
    try {
      const formattedMessages = this.formatMessages(messages, options?.systemPrompt);
      
      const requestData = {
        model: options?.model || this.getDefaultModel(),
        messages: formattedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true,
        options: {
          temperature: options?.temperature ?? this.config.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? this.config.maxTokens ?? 4096,
          top_p: options?.topP ?? 1,
          top_k: options?.topK ?? 40,
        }
      };

      const response = await this.client.post('/api/chat', requestData, {
        responseType: 'stream'
      });

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            try {
              const parsed = JSON.parse(trimmed);
              
              if (parsed.message?.content) {
                yield {
                  content: parsed.message.content,
                  done: false
                };
              }
              
              if (parsed.done) {
                yield {
                  content: '',
                  done: true
                };
                return;
              }
            } catch (e) {
              // Ignore parsing errors for individual chunks
            }
          }
        }
      }

      yield {
        content: '',
        done: true
      };

    } catch (error) {
      yield {
        content: '',
        done: true,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.get('/api/tags');
      
      return response.data.models.map((model: any) => ({
        name: model.name,
        description: model.details?.parameter_size ? 
          `${model.name} (${model.details.parameter_size})` : 
          model.name,
        contextLength: model.details?.context_length || 4096,
        maxTokens: model.details?.context_length || 4096
      }));
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return this.getDefaultModels();
    }
  }

  async validateConfig(config: ProviderConfig): Promise<boolean> {
    try {
      const testClient = axios.create({
        baseURL: config.baseUrl || 'http://localhost:11434',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const response = await testClient.get('/api/tags');
      return response.status === 200 && response.data.models?.length > 0;
    } catch (error) {
      return false;
    }
  }

  protected getProviderDefaultModel(): string {
    return 'llama3.2:latest';
  }

  private getDefaultModels(): ModelInfo[] {
    return [
      {
        name: 'llama3.2:latest',
        description: 'Llama 3.2 - Latest version',
        contextLength: 4096,
        maxTokens: 4096
      },
      {
        name: 'llama3.1:latest',
        description: 'Llama 3.1 - Stable version',
        contextLength: 4096,
        maxTokens: 4096
      },
      {
        name: 'codellama:latest',
        description: 'Code Llama - Optimized for coding',
        contextLength: 4096,
        maxTokens: 4096
      },
      {
        name: 'mistral:latest',
        description: 'Mistral 7B - Efficient model',
        contextLength: 4096,
        maxTokens: 4096
      },
      {
        name: 'gemma:latest',
        description: 'Gemma - Google model',
        contextLength: 4096,
        maxTokens: 4096
      }
    ];
  }

  // Ollama specific methods
  async pullModel(modelName: string): Promise<boolean> {
    try {
      const response = await this.client.post('/api/pull', {
        name: modelName
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error pulling model:', error);
      return false;
    }
  }

  async deleteModel(modelName: string): Promise<boolean> {
    try {
      const response = await this.client.delete('/api/delete', {
        data: { name: modelName }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error deleting model:', error);
      return false;
    }
  }

  async showModel(modelName: string): Promise<any> {
    try {
      const response = await this.client.post('/api/show', {
        name: modelName
      });
      return response.data;
    } catch (error) {
      console.error('Error showing model info:', error);
      return null;
    }
  }

  private getOllamaTools(): any[] {
    const tools = this.toolManager.getTools();
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }

  private supportsToolCalling(modelName: string): boolean {
    // Enable function calling for supported Ollama models
    const supportedModels = ['llama3.2', 'llama3.1', 'mistral'];
    return supportedModels.some(model => modelName.includes(model));
  }
}
