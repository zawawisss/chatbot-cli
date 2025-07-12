/**
 * Agentic Turn Manager
 * Manages the turn-based conversation loop where AI can continuously execute tools
 * until the objective is achieved, similar to Gemini CLI
 */

import { ToolManager } from '../tools/ToolManager.js';
import { ChatHistory } from '../chatbot/ChatHistory.js';

export interface AgenticTurnOptions {
  maxTurns?: number;
  maxToolCalls?: number;
  timeout?: number;
  debug?: boolean;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  id?: string;
}

export interface ToolResult {
  name: string;
  result: unknown;
  error?: string;
  id?: string;
}

export interface TurnState {
  turnNumber: number;
  userMessage: string;
  aiResponse: string;
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
  isComplete: boolean;
  needsContinuation: boolean;
}

export enum TurnEventType {
  TurnStart = 'turn_start',
  ToolCallRequest = 'tool_call_request',
  ToolCallResponse = 'tool_call_response',
  AIResponse = 'ai_response',
  TurnComplete = 'turn_complete',
  Error = 'error'
}

export interface TurnEvent {
  type: TurnEventType;
  data: any;
  timestamp: Date;
}

export class AgenticTurn {
  private toolManager: ToolManager;
  private history: ChatHistory;
  private options: Required<AgenticTurnOptions>;
  private currentTurn: number = 0;
  private totalToolCalls: number = 0;
  private eventListeners: Map<TurnEventType, ((event: TurnEvent) => void)[]> = new Map();

  constructor(
    toolManager: ToolManager,
    history: ChatHistory,
    options: AgenticTurnOptions = {}
  ) {
    this.toolManager = toolManager;
    this.history = history;
    this.options = {
      maxTurns: options.maxTurns ?? 10,
      maxToolCalls: options.maxToolCalls ?? 50,
      timeout: options.timeout ?? 300000, // 5 minutes
      debug: options.debug ?? false
    };
  }

  /**
   * Execute agentic turn loop
   */
  async *executeAgenticLoop(
    initialPrompt: string,
    provider: any,
    chatOptions: any
  ): AsyncGenerator<TurnEvent> {
    const startTime = Date.now();
    this.currentTurn = 0;
    this.totalToolCalls = 0;

    try {
      yield this.emitEvent(TurnEventType.TurnStart, {
        prompt: initialPrompt,
        options: this.options
      });

      let currentPrompt = initialPrompt;
      let isComplete = false;

      while (!isComplete && this.shouldContinue(startTime)) {
        this.currentTurn++;
        
        if (this.options.debug) {
          console.log(`🔄 Starting turn ${this.currentTurn}/${this.options.maxTurns}`);
        }

        const turnState: TurnState = {
          turnNumber: this.currentTurn,
          userMessage: currentPrompt,
          aiResponse: '',
          toolCalls: [],
          toolResults: [],
          isComplete: false,
          needsContinuation: false
        };

        // Get AI response
        const aiResponse = await provider.chat(this.history.getMessages(), {
          ...chatOptions,
          includeToolsInResponse: true
        });

        turnState.aiResponse = aiResponse.content;

        yield this.emitEvent(TurnEventType.AIResponse, {
          response: aiResponse.content,
          turn: this.currentTurn
        });

        // Check for tool calls in the response
        const toolCalls = this.extractToolCalls(aiResponse);
        
        if (this.options.debug) {
          console.log(`🔍 Debug - AI Response:`, JSON.stringify(aiResponse, null, 2));
          console.log(`🔍 Debug - Extracted tool calls:`, toolCalls);
        }
        
        if (toolCalls.length > 0) {
          turnState.toolCalls = toolCalls;
          
          // Execute tools
          const toolResults = await this.executeToolCalls(toolCalls);
          turnState.toolResults = toolResults;

          // Check if we need to continue
          const needsContinuation = this.analyzeIfContinuationNeeded(
            aiResponse.content,
            toolResults
          );

          turnState.needsContinuation = needsContinuation;

          if (needsContinuation) {
            // Prepare next prompt with tool results
            currentPrompt = this.prepareNextPrompt(aiResponse.content, toolResults);
            
            // Add tool results to history
            this.addToolResultsToHistory(toolResults);
          } else {
            isComplete = true;
            turnState.isComplete = true;
          }
        } else {
          // No tool calls, turn is complete
          isComplete = true;
          turnState.isComplete = true;
        }

        yield this.emitEvent(TurnEventType.TurnComplete, turnState);
      }

    } catch (error) {
      yield this.emitEvent(TurnEventType.Error, {
        error: error instanceof Error ? error.message : String(error),
        turn: this.currentTurn
      });
      throw error;
    }
  }

  /**
   * Extract tool calls from AI response
   */
  private extractToolCalls(aiResponse: any): ToolCall[] {
    const toolCalls: ToolCall[] = [];

    // Check if response contains function calls (Gemini format)
    if (aiResponse.functionCalls) {
      for (const functionCall of aiResponse.functionCalls) {
        toolCalls.push({
          name: functionCall.name,
          arguments: functionCall.args || {},
          id: this.generateCallId()
        });
      }
    }

    // Check if response contains tool_calls (OpenAI/DeepSeek format)
    if (aiResponse.tool_calls) {
      for (const toolCall of aiResponse.tool_calls) {
        toolCalls.push({
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments || '{}'),
          id: toolCall.id
        });
      }
    }

    // Also parse tool calls from text content
    const textToolCalls = this.parseToolCallsFromText(aiResponse.content);
    toolCalls.push(...textToolCalls);

    return toolCalls;
  }

  /**
   * Parse tool calls from text content
   */
  private parseToolCallsFromText(content: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    const availableTools = this.toolManager.getToolNames();

    // Look for tool call patterns in the response
    for (const toolName of availableTools) {
      // Pattern: <tool_name>(args...)
      const pattern = new RegExp(`${toolName}\\s*\\(([^)]*)\\)`, 'gi');
      const matches = content.matchAll(pattern);

      for (const match of matches) {
        const argsString = match[1];
        const args = this.parseToolArguments(argsString);
        
        toolCalls.push({
          name: toolName,
          arguments: args,
          id: this.generateCallId()
        });
      }

      // Pattern: I need to use <tool_name> with <args>
      const needPattern = new RegExp(
        `(?:I need to|I will|Let me)\\s+(?:use\\s+)?${toolName}(?:\\s+with\\s+(.+?))?(?:\\.|$)`, 
        'gi'
      );
      const needMatches = content.matchAll(needPattern);

      for (const match of needMatches) {
        const tool = this.toolManager.getTool(toolName);
        if (tool) {
          const args = this.inferToolArguments(toolName, match[1] || '', content);
          toolCalls.push({
            name: toolName,
            arguments: args,
            id: this.generateCallId()
          });
        }
      }
    }

    return toolCalls;
  }

  /**
   * Execute tool calls
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      this.totalToolCalls++;

      if (this.totalToolCalls > this.options.maxToolCalls) {
        results.push({
          name: toolCall.name,
          result: null,
          error: `Maximum tool calls (${this.options.maxToolCalls}) exceeded`,
          id: toolCall.id
        });
        break;
      }

      this.emitEvent(TurnEventType.ToolCallRequest, toolCall);

      try {
        const result = await this.toolManager.executeTool(toolCall);
        
        const toolResult: ToolResult = {
          name: result.name,
          result: result.result,
          error: result.error,
          id: toolCall.id
        };

        results.push(toolResult);

        this.emitEvent(TurnEventType.ToolCallResponse, toolResult);

        if (this.options.debug) {
          console.log(`🔧 Tool ${result.name}:`, result.error ? `❌ ${result.error}` : `✅ ${result.result}`);
        }

      } catch (error) {
        const toolResult: ToolResult = {
          name: toolCall.name,
          result: null,
          error: error instanceof Error ? error.message : String(error),
          id: toolCall.id
        };

        results.push(toolResult);
        this.emitEvent(TurnEventType.ToolCallResponse, toolResult);
      }
    }

    return results;
  }

  /**
   * Analyze if continuation is needed based on AI response and tool results
   */
  private analyzeIfContinuationNeeded(aiResponse: string, toolResults: ToolResult[]): boolean {
    const lowerResponse = aiResponse.toLowerCase();
    
    if (this.options.debug) {
      console.log(`🔍 Debug - Analyzing continuation for response: "${aiResponse.substring(0, 200)}..."`);  
    }

    // Check for continuation indicators in the response
    const continuationIndicators = [
      'next', 'then', 'now i will', 'let me also', 'i need to',
      'i should', 'after that', 'following', 'continue', 'proceed',
      'sekarang', 'selanjutnya', 'lalu', 'kemudian', 'mari', 'langkah'
    ];

    const hasContinuationIndicators = continuationIndicators.some(indicator => 
      lowerResponse.includes(indicator)
    );

    // Check if any tool had errors (might need retry)
    const hasErrors = toolResults.some(result => result.error);

    // Check for incomplete tasks
    const hasIncompleteTask = lowerResponse.includes('incomplete') || 
                              lowerResponse.includes('partial') ||
                              lowerResponse.includes('in progress');

    // Check for explicit completion indicators
    const completionIndicators = [
      'done', 'complete', 'finished', 'task completed', 'successfully',
      'all set', 'that\'s it', 'final result', 'task accomplished',
      'selesai', 'berhasil', 'telah selesai'
    ];

    const hasCompletionIndicators = completionIndicators.some(indicator =>
      lowerResponse.includes(indicator)
    );

    // NEW: Check if original user request contains multiple tasks
    const originalPrompt = this.history.getMessages()
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ')
      .toLowerCase();
      
    const multiTaskIndicators = [
      'then', 'and then', 'lalu', 'kemudian', 'dan', 'juga', 'serta',
      'setelah itu', 'after that', 'next'
    ];
    
    const originalHasMultipleTasks = multiTaskIndicators.some(indicator =>
      originalPrompt.includes(indicator)
    );

    // NEW: Check if current turn has only completed one part of multi-step task
    const currentTaskProgress = toolResults.length;
    const isFirstToolOnly = currentTaskProgress === 1 && originalHasMultipleTasks;
    
    if (this.options.debug) {
      console.log(`🔍 Debug - Continuation analysis:`);
      console.log(`  - Has continuation indicators: ${hasContinuationIndicators}`);
      console.log(`  - Has errors: ${hasErrors}`);
      console.log(`  - Has incomplete task: ${hasIncompleteTask}`);
      console.log(`  - Has completion indicators: ${hasCompletionIndicators}`);
      console.log(`  - Original has multiple tasks: ${originalHasMultipleTasks}`);
      console.log(`  - Is first tool only: ${isFirstToolOnly}`);
    }

    // If there are explicit completion indicators and no errors, stop
    if (hasCompletionIndicators && !hasErrors && !isFirstToolOnly) {
      return false;
    }

    // Continue if there are continuation indicators, errors to handle, or incomplete multi-step task
    return hasContinuationIndicators || hasErrors || hasIncompleteTask || isFirstToolOnly;
  }

  /**
   * Prepare next prompt with tool results
   */
  private prepareNextPrompt(previousResponse: string, toolResults: ToolResult[]): string {
    let prompt = "Based on the previous actions, here are the results:\n\n";

    for (const result of toolResults) {
      if (result.error) {
        prompt += `❌ ${result.name}: Error - ${result.error}\n`;
      } else {
        prompt += `✅ ${result.name}: ${JSON.stringify(result.result, null, 2)}\n`;
      }
    }

    prompt += "\nPlease continue with the next steps to complete the task.";
    return prompt;
  }

  /**
   * Add tool results to chat history
   */
  private addToolResultsToHistory(toolResults: ToolResult[]): void {
    const toolResultsMessage = toolResults.map(result => {
      if (result.error) {
        return `Tool ${result.name} failed: ${result.error}`;
      } else {
        return `Tool ${result.name} succeeded: ${JSON.stringify(result.result)}`;
      }
    }).join('\n');

    this.history.addMessage({
      role: 'assistant',
      content: `Tool execution results:\n${toolResultsMessage}`,
      timestamp: new Date()
    });
  }

  /**
   * Check if should continue the loop
   */
  private shouldContinue(startTime: number): boolean {
    const elapsed = Date.now() - startTime;
    
    if (elapsed > this.options.timeout) {
      if (this.options.debug) {
        console.log(`⏰ Timeout reached: ${elapsed}ms > ${this.options.timeout}ms`);
      }
      return false;
    }

    if (this.currentTurn >= this.options.maxTurns) {
      if (this.options.debug) {
        console.log(`🔄 Max turns reached: ${this.currentTurn} >= ${this.options.maxTurns}`);
      }
      return false;
    }

    return true;
  }

  /**
   * Parse tool arguments from string
   */
  private parseToolArguments(argsString: string): Record<string, unknown> {
    const args: Record<string, unknown> = {};
    
    if (!argsString.trim()) {
      return args;
    }

    // Parse key="value" or key=value patterns
    const argPattern = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^,\s]+))/g;
    let match;

    while ((match = argPattern.exec(argsString)) !== null) {
      const key = match[1];
      const value = match[2] || match[3] || match[4];
      
      // Type conversion
      if (value === 'true') args[key] = true;
      else if (value === 'false') args[key] = false;
      else if (/^\d+$/.test(value)) args[key] = parseInt(value);
      else if (/^\d+\.\d+$/.test(value)) args[key] = parseFloat(value);
      else args[key] = value;
    }

    return args;
  }

  /**
   * Infer tool arguments from context
   */
  private inferToolArguments(toolName: string, argText: string, fullContext: string): Record<string, unknown> {
    const tool = this.toolManager.getTool(toolName);
    if (!tool) return {};

    const args: Record<string, unknown> = {};
    const required = tool.parameters.required || [];

    // Simple inference based on tool type
    switch (toolName) {
      case 'read_file':
        const fileMatch = fullContext.match(/([^\s]+\.[a-zA-Z]+)/);
        if (fileMatch) args.path = fileMatch[1];
        break;
        
      case 'write_file':
        const writeMatch = fullContext.match(/write\s+(.+?)\s+to\s+([^\s]+)/i);
        if (writeMatch) {
          args.content = writeMatch[1];
          args.path = writeMatch[2];
        }
        break;
        
      case 'run_command':
        const cmdMatch = fullContext.match(/run\s+(?:command\s+)?["`']([^"`']+)["`']/i);
        if (cmdMatch) args.command = cmdMatch[1];
        break;
        
      case 'calculate':
        const mathMatch = fullContext.match(/calculate\s+(.+)/i);
        if (mathMatch) args.expression = mathMatch[1].trim();
        break;
    }

    // Set defaults for required parameters if not set
    for (const reqParam of required) {
      if (!(reqParam in args)) {
        switch (reqParam) {
          case 'path': args[reqParam] = '.'; break;
          case 'recursive': args[reqParam] = false; break;
          case 'create_directories': args[reqParam] = true; break;
        }
      }
    }

    return args;
  }

  /**
   * Generate unique call ID
   */
  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit event
   */
  private emitEvent(type: TurnEventType, data: any): TurnEvent {
    const event: TurnEvent = {
      type,
      data,
      timestamp: new Date()
    };

    const listeners = this.eventListeners.get(type) || [];
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error);
      }
    }

    return event;
  }

  /**
   * Add event listener
   */
  addEventListener(type: TurnEventType, listener: (event: TurnEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: TurnEventType, listener: (event: TurnEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      currentTurn: this.currentTurn,
      totalToolCalls: this.totalToolCalls,
      maxTurns: this.options.maxTurns,
      maxToolCalls: this.options.maxToolCalls
    };
  }
}
