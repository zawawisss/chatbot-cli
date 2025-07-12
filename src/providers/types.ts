export type ProviderType = 'gemini' | 'deepseek' | 'ollama';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ModelInfo {
  name: string;
  description?: string;
  contextLength?: number;
  maxTokens?: number;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
  systemPrompt?: string;
  includeToolsInResponse?: boolean;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  debug?: boolean;
  humanAware?: boolean; // Enable human-centric AI intelligence
}

export interface StreamResponse {
  content: string;
  done: boolean;
  error?: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  error?: string;
  functionCalls?: Array<{
    name: string;
    args: Record<string, any>;
  }>;
  tool_calls?: Array<{
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface Provider {
  name: ProviderType;
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;
  streamChat(messages: Message[], options?: ChatOptions): AsyncGenerator<StreamResponse>;
  listModels(): Promise<ModelInfo[]>;
  validateConfig(config: ProviderConfig): Promise<boolean>;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  name: string;
  result: any;
  error?: string;
  tool_call_id?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ChatContext {
  workingDirectory: string;
  files?: string[];
  gitBranch?: string;
  environment?: Record<string, string>;
}
