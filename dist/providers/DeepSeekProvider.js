import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import { ToolManager } from '../tools/ToolManager.js';
export class DeepSeekProvider extends BaseProvider {
    name = 'deepseek';
    client;
    toolManager;
    constructor(config) {
        super(config);
        this.validateRequiredConfig(['apiKey']);
        this.client = axios.create({
            baseURL: config.baseUrl || 'https://api.deepseek.com/v1',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Multi-Provider-Chatbot-CLI/1.0.0'
            },
            timeout: config.timeout || 30000
        });
        this.toolManager = new ToolManager();
    }
    async chat(messages, options) {
        try {
            const formattedMessages = this.formatMessages(messages, options?.systemPrompt);
            const modelName = options?.model || this.getDefaultModel();
            const requestData = {
                model: modelName,
                messages: formattedMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 4096,
                top_p: options?.topP ?? 1,
                stream: false
            };
            // Only add tools for models that support function calling and includeToolsInResponse is true
            if (this.supportsToolCalling(modelName) && options?.includeToolsInResponse) {
                requestData.tools = this.getOpenAITools();
            }
            const response = await this.client.post('/chat/completions', requestData);
            if (this.config.debug) {
                console.log('🔍 Debug - DeepSeek Request:', JSON.stringify(requestData, null, 2));
                console.log('🔍 Debug - DeepSeek Response:', JSON.stringify(response.data, null, 2));
            }
            const choice = response.data.choices[0];
            const usage = response.data.usage;
            // Handle tool calls - Only execute tools if not in agentic mode
            if (choice.message.tool_calls && choice.message.tool_calls.length > 0 && !options?.includeToolsInResponse) {
                const toolResults = [];
                for (const toolCall of choice.message.tool_calls) {
                    const call = {
                        name: toolCall.function.name,
                        arguments: JSON.parse(toolCall.function.arguments || '{}')
                    };
                    const result = await this.toolManager.executeTool(call);
                    toolResults.push({
                        ...result,
                        tool_call_id: toolCall.id
                    });
                }
                // Send tool results back
                const messagesWithToolResults = [
                    ...formattedMessages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    {
                        role: 'assistant',
                        content: choice.message.content || '',
                        tool_calls: choice.message.tool_calls
                    },
                    ...toolResults.map(result => ({
                        role: 'tool',
                        content: result.error ? `Error: ${result.error}` : JSON.stringify(result.result),
                        tool_call_id: result.tool_call_id
                    }))
                ];
                const followupData = {
                    ...requestData,
                    messages: messagesWithToolResults
                };
                const followupResponse = await this.client.post('/chat/completions', followupData);
                const followupChoice = followupResponse.data.choices[0];
                const followupUsage = followupResponse.data.usage;
                return {
                    content: followupChoice.message.content,
                    usage: {
                        promptTokens: usage.prompt_tokens + followupUsage.prompt_tokens,
                        completionTokens: usage.completion_tokens + followupUsage.completion_tokens,
                        totalTokens: usage.total_tokens + followupUsage.total_tokens
                    },
                    model: response.data.model
                };
            }
            return {
                content: choice.message.content,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
                model: response.data.model,
                tool_calls: choice.message.tool_calls // Include tool_calls in response
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async *streamChat(messages, options) {
        try {
            const formattedMessages = this.formatMessages(messages, options?.systemPrompt);
            const requestData = {
                model: options?.model || this.getDefaultModel(),
                messages: formattedMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? this.config.maxTokens ?? 4096,
                top_p: options?.topP ?? 1,
                stream: true
            };
            const response = await this.client.post('/chat/completions', requestData, {
                responseType: 'stream'
            });
            let buffer = '';
            for await (const chunk of response.data) {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const data = trimmed.slice(6);
                        if (data === '[DONE]') {
                            yield {
                                content: '',
                                done: true
                            };
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices[0]?.delta?.content;
                            if (delta) {
                                yield {
                                    content: delta,
                                    done: false
                                };
                            }
                        }
                        catch (e) {
                            // Ignore parsing errors for individual chunks
                        }
                    }
                }
            }
            yield {
                content: '',
                done: true
            };
        }
        catch (error) {
            yield {
                content: '',
                done: true,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    async listModels() {
        try {
            const response = await this.client.get('/models');
            return response.data.data.map((model) => ({
                name: model.id,
                description: model.description || `DeepSeek model: ${model.id}`,
                contextLength: model.context_length,
                maxTokens: model.max_tokens
            }));
        }
        catch (error) {
            console.error('Error listing DeepSeek models:', error);
            return this.getDefaultModels();
        }
    }
    async validateConfig(config) {
        try {
            if (!config.apiKey) {
                return false;
            }
            const testClient = axios.create({
                baseURL: config.baseUrl || 'https://api.deepseek.com/v1',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            const response = await testClient.get('/models');
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
    getProviderDefaultModel() {
        return 'deepseek-chat';
    }
    getDefaultModels() {
        return [
            {
                name: 'deepseek-chat',
                description: 'DeepSeek Chat model for general conversation',
                contextLength: 32768,
                maxTokens: 4096
            },
            {
                name: 'deepseek-coder',
                description: 'DeepSeek Coder model optimized for coding tasks',
                contextLength: 16384,
                maxTokens: 4096
            },
            {
                name: 'deepseek-math',
                description: 'DeepSeek Math model for mathematical reasoning',
                contextLength: 4096,
                maxTokens: 2048
            }
        ];
    }
    getOpenAITools() {
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
    supportsToolCalling(modelName) {
        // Enable function calling for supported DeepSeek models
        const supportedModels = ['deepseek-chat', 'deepseek-coder'];
        return supportedModels.some(model => modelName.includes(model));
    }
}
//# sourceMappingURL=DeepSeekProvider.js.map