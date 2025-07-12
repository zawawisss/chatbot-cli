import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseProvider } from './BaseProvider.js';
import { ToolManager } from '../tools/ToolManager.js';
export class GeminiProvider extends BaseProvider {
    name = 'gemini';
    genAI;
    toolManager;
    constructor(config) {
        super(config);
        this.validateRequiredConfig(['apiKey']);
        this.genAI = new GoogleGenerativeAI(config.apiKey);
        this.toolManager = new ToolManager();
    }
    async chat(messages, options) {
        try {
            const modelName = options?.model || this.getDefaultModel();
            const modelConfig = {
                model: modelName,
                generationConfig: {
                    temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                    maxOutputTokens: options?.maxTokens ?? this.config.maxTokens ?? 4096,
                    topP: options?.topP ?? 1,
                    topK: options?.topK ?? 40,
                }
            };
            // Only add tools for models that support function calling
            if (this.supportsToolCalling(modelName)) {
                const tools = this.getFunctionDeclarations();
                modelConfig.tools = tools;
            }
            const model = this.genAI.getGenerativeModel(modelConfig);
            // Get the user's latest message for intent analysis
            const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
            // Enhance system prompt with human-aware intelligence
            const enhancedSystemPrompt = this.getHumanAwareSystemPrompt(latestUserMessage, options?.systemPrompt);
            const formattedMessages = this.formatMessages(messages, enhancedSystemPrompt);
            // Convert messages to Gemini format
            const history = formattedMessages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
            const lastMessage = formattedMessages[formattedMessages.length - 1];
            const systemMessage = formattedMessages.find(m => m.role === 'system');
            const chat = model.startChat({
                history: history.filter(h => h.role !== 'system'),
                systemInstruction: systemMessage ? {
                    role: 'system',
                    parts: [{ text: systemMessage.content }]
                } : undefined
            });
            const result = await chat.sendMessage(lastMessage.content);
            const response = await result.response;
            // Handle function calls differently for agentic mode
            const candidates = response.candidates;
            if (candidates && candidates[0]?.content?.parts) {
                const parts = candidates[0].content.parts;
                const functionCalls = parts.filter(part => part.functionCall);
                if (functionCalls.length > 0) {
                    // Check if this is for agentic mode (includeToolsInResponse)
                    if (options?.includeToolsInResponse) {
                        // For agentic mode: return function calls for external processing
                        const formattedFunctionCalls = functionCalls.map(fc => ({
                            name: fc.functionCall.name,
                            args: fc.functionCall.args || {}
                        }));
                        return {
                            content: response.text() || '',
                            functionCalls: formattedFunctionCalls,
                            usage: {
                                promptTokens: response.usageMetadata?.promptTokenCount || 0,
                                completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
                                totalTokens: response.usageMetadata?.totalTokenCount || 0
                            },
                            model: options?.model || this.getDefaultModel()
                        };
                    }
                    else {
                        // For non-agentic mode: execute tools immediately (existing behavior)
                        const toolResults = [];
                        for (const functionCall of functionCalls) {
                            if (functionCall.functionCall) {
                                const toolCall = {
                                    name: functionCall.functionCall.name,
                                    arguments: functionCall.functionCall.args || {}
                                };
                                const toolResult = await this.toolManager.executeTool(toolCall);
                                toolResults.push(toolResult);
                            }
                        }
                        // Send function results back to the model
                        const functionResponseParts = toolResults.map(result => ({
                            functionResponse: {
                                name: result.name,
                                response: result.error ?
                                    { error: result.error } :
                                    { result: typeof result.result === 'object' ? JSON.stringify(result.result, null, 2) : String(result.result) }
                            }
                        }));
                        const functionResult = await chat.sendMessage(functionResponseParts);
                        const functionResponse = await functionResult.response;
                        const finalText = functionResponse.text();
                        return {
                            content: finalText,
                            usage: {
                                promptTokens: (response.usageMetadata?.promptTokenCount || 0) + (functionResponse.usageMetadata?.promptTokenCount || 0),
                                completionTokens: (response.usageMetadata?.candidatesTokenCount || 0) + (functionResponse.usageMetadata?.candidatesTokenCount || 0),
                                totalTokens: (response.usageMetadata?.totalTokenCount || 0) + (functionResponse.usageMetadata?.totalTokenCount || 0)
                            },
                            model: options?.model || this.getDefaultModel()
                        };
                    }
                }
            }
            const text = response.text();
            return {
                content: text,
                usage: {
                    promptTokens: response.usageMetadata?.promptTokenCount || 0,
                    completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata?.totalTokenCount || 0
                },
                model: options?.model || this.getDefaultModel()
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async *streamChat(messages, options) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: options?.model || this.getDefaultModel(),
                generationConfig: {
                    temperature: options?.temperature ?? this.config.temperature ?? 0.7,
                    maxOutputTokens: options?.maxTokens ?? this.config.maxTokens ?? 4096,
                    topP: options?.topP ?? 1,
                    topK: options?.topK ?? 40,
                },
                tools: this.getFunctionDeclarations()
            });
            // Get the user's latest message for intent analysis
            const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
            // Enhance system prompt with human-aware intelligence
            const enhancedSystemPrompt = this.getHumanAwareSystemPrompt(latestUserMessage, options?.systemPrompt);
            const formattedMessages = this.formatMessages(messages, enhancedSystemPrompt);
            // Convert messages to Gemini format
            const history = formattedMessages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
            const lastMessage = formattedMessages[formattedMessages.length - 1];
            const systemMessage = formattedMessages.find(m => m.role === 'system');
            const chat = model.startChat({
                history: history.filter(h => h.role !== 'system'),
                systemInstruction: systemMessage ? {
                    role: 'system',
                    parts: [{ text: systemMessage.content }]
                } : undefined
            });
            const result = await chat.sendMessageStream(lastMessage.content);
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    yield {
                        content: chunkText,
                        done: false
                    };
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
            // Note: The @google/generative-ai package doesn't have a listModels method
            // So we'll return the default models for now
            return this.getDefaultModels();
        }
        catch (error) {
            console.error('Error listing Gemini models:', error);
            return this.getDefaultModels();
        }
    }
    async validateConfig(config) {
        try {
            if (!config.apiKey) {
                return false;
            }
            const testAI = new GoogleGenerativeAI(config.apiKey);
            const model = testAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            // Test with a simple message
            const result = await model.generateContent('Hello');
            return !!result.response.text();
        }
        catch (error) {
            return false;
        }
    }
    getProviderDefaultModel() {
        return 'gemini-2.5-flash';
    }
    getDefaultModels() {
        return [
            {
                name: 'gemini-2.5-flash',
                description: 'Fast and efficient model for most tasks',
                contextLength: 1048576,
                maxTokens: 8192
            },
            {
                name: 'gemini-2.5-pro',
                description: 'Most capable model for complex tasks',
                contextLength: 2097152,
                maxTokens: 8192
            },
            {
                name: 'gemini-2.0-flash-exp',
                description: 'Experimental model with latest features',
                contextLength: 1048576,
                maxTokens: 8192
            }
        ];
    }
    getFunctionDeclarations() {
        const tools = this.toolManager.getTools();
        return [{
                functionDeclarations: tools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    parameters: this.convertToGeminiSchema(tool.parameters)
                }))
            }];
    }
    convertToGeminiSchema(parameters) {
        // Convert OpenAPI-style schema to Gemini schema
        const geminiSchema = {
            type: 'object',
            properties: {},
            required: parameters.required || []
        };
        if (parameters.properties) {
            for (const [key, value] of Object.entries(parameters.properties)) {
                const prop = value;
                geminiSchema.properties[key] = {
                    type: prop.type,
                    description: prop.description
                };
                if (prop.default !== undefined) {
                    geminiSchema.properties[key].default = prop.default;
                }
            }
        }
        return geminiSchema;
    }
    supportsToolCalling(modelName) {
        // Enable function calling for supported models
        const supportedModels = [
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash', // Add support for 1.5 models too
            'gemini-1.5-pro'
        ];
        return supportedModels.some(model => modelName.includes(model));
    }
}
//# sourceMappingURL=GeminiProvider.js.map