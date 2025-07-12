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
export declare enum TurnEventType {
    TurnStart = "turn_start",
    ToolCallRequest = "tool_call_request",
    ToolCallResponse = "tool_call_response",
    AIResponse = "ai_response",
    TurnComplete = "turn_complete",
    Error = "error"
}
export interface TurnEvent {
    type: TurnEventType;
    data: any;
    timestamp: Date;
}
export declare class AgenticTurn {
    private toolManager;
    private history;
    private options;
    private currentTurn;
    private totalToolCalls;
    private eventListeners;
    constructor(toolManager: ToolManager, history: ChatHistory, options?: AgenticTurnOptions);
    /**
     * Execute agentic turn loop
     */
    executeAgenticLoop(initialPrompt: string, provider: any, chatOptions: any): AsyncGenerator<TurnEvent>;
    /**
     * Extract tool calls from AI response
     */
    private extractToolCalls;
    /**
     * Parse tool calls from text content
     */
    private parseToolCallsFromText;
    /**
     * Execute tool calls
     */
    private executeToolCalls;
    /**
     * Analyze if continuation is needed based on AI response and tool results
     */
    private analyzeIfContinuationNeeded;
    /**
     * Prepare next prompt with tool results
     */
    private prepareNextPrompt;
    /**
     * Add tool results to chat history
     */
    private addToolResultsToHistory;
    /**
     * Check if should continue the loop
     */
    private shouldContinue;
    /**
     * Parse tool arguments from string
     */
    private parseToolArguments;
    /**
     * Infer tool arguments from context
     */
    private inferToolArguments;
    /**
     * Generate unique call ID
     */
    private generateCallId;
    /**
     * Emit event
     */
    private emitEvent;
    /**
     * Add event listener
     */
    addEventListener(type: TurnEventType, listener: (event: TurnEvent) => void): void;
    /**
     * Remove event listener
     */
    removeEventListener(type: TurnEventType, listener: (event: TurnEvent) => void): void;
    /**
     * Get current statistics
     */
    getStats(): {
        currentTurn: number;
        totalToolCalls: number;
        maxTurns: number;
        maxToolCalls: number;
    };
}
//# sourceMappingURL=AgenticTurn.d.ts.map