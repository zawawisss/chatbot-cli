import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

export interface ConversationMessage {
  id: string;
  timestamp: Date;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider: string;
  model: string;
  toolCalls?: any[];
  metadata?: Record<string, any>;
}

export interface ConversationSession {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  provider: string;
  model: string;
  messages: ConversationMessage[];
  settings: {
    temperature: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

export class ConversationManager {
  private conversationsDir: string;
  private currentSession: ConversationSession | null = null;

  constructor() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.conversationsDir = path.join(__dirname, '../../conversations');
  }

  private async ensureConversationsDir(): Promise<void> {
    try {
      await fs.access(this.conversationsDir);
    } catch {
      await fs.mkdir(this.conversationsDir, { recursive: true });
    }
  }

  async createSession(provider: string, model: string, name?: string): Promise<ConversationSession> {
    const sessionId = this.generateSessionId();
    const sessionName = name || `${provider}-${model}-${new Date().toISOString().split('T')[0]}`;
    
    const session: ConversationSession = {
      id: sessionId,
      name: sessionName,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider,
      model,
      messages: [],
      settings: {
        temperature: 0.7
      }
    };

    this.currentSession = session;
    await this.saveSession(session);
    
    console.log(chalk.green(`📝 Created new conversation session: ${sessionName}`));
    return session;
  }

  async loadSession(sessionId: string): Promise<ConversationSession | null> {
    try {
      const sessionPath = path.join(this.conversationsDir, `${sessionId}.json`);
      const content = await fs.readFile(sessionPath, 'utf-8');
      const session = JSON.parse(content) as ConversationSession;
      
      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      session.messages = session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      this.currentSession = session;
      console.log(chalk.blue(`📂 Loaded conversation session: ${session.name}`));
      return session;
    } catch (error) {
      console.error(chalk.red(`Failed to load session ${sessionId}:`), error);
      return null;
    }
  }

  async saveSession(session?: ConversationSession): Promise<void> {
    const sessionToSave = session || this.currentSession;
    if (!sessionToSave) return;

    try {
      sessionToSave.updatedAt = new Date();
      const sessionPath = path.join(this.conversationsDir, `${sessionToSave.id}.json`);
      await fs.writeFile(sessionPath, JSON.stringify(sessionToSave, null, 2), 'utf-8');
    } catch (error) {
      console.error(chalk.red('Failed to save session:'), error);
    }
  }

  async addMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    toolCalls?: any[],
    metadata?: Record<string, any>
  ): Promise<ConversationMessage> {
    if (!this.currentSession) {
      throw new Error('No active session. Create a session first.');
    }

    const message: ConversationMessage = {
      id: this.generateMessageId(),
      timestamp: new Date(),
      role,
      content,
      provider: this.currentSession.provider,
      model: this.currentSession.model,
      toolCalls,
      metadata
    };

    this.currentSession.messages.push(message);
    await this.saveSession();

    return message;
  }

  getConversationHistory(limit?: number): ConversationMessage[] {
    if (!this.currentSession) return [];
    
    const messages = this.currentSession.messages;
    return limit ? messages.slice(-limit) : messages;
  }

  async listSessions(): Promise<ConversationSession[]> {
    try {
      await this.ensureConversationsDir();
      const files = await fs.readdir(this.conversationsDir);
      const sessionFiles = files.filter(file => file.endsWith('.json'));
      
      const sessions: ConversationSession[] = [];
      
      for (const file of sessionFiles) {
        try {
          const content = await fs.readFile(path.join(this.conversationsDir, file), 'utf-8');
          const session = JSON.parse(content) as ConversationSession;
          session.createdAt = new Date(session.createdAt);
          session.updatedAt = new Date(session.updatedAt);
          sessions.push(session);
        } catch (error) {
          console.warn(chalk.yellow(`Failed to load session file ${file}:`), error);
        }
      }

      return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error(chalk.red('Failed to list sessions:'), error);
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionPath = path.join(this.conversationsDir, `${sessionId}.json`);
      await fs.unlink(sessionPath);
      
      if (this.currentSession?.id === sessionId) {
        this.currentSession = null;
      }
      
      console.log(chalk.green(`🗑️ Deleted session: ${sessionId}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to delete session ${sessionId}:`), error);
      return false;
    }
  }

  async exportSession(sessionId: string, format: 'json' | 'txt' | 'markdown' = 'json'): Promise<string> {
    const session = await this.loadSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const exportPath = path.join(this.conversationsDir, `${sessionId}-export.${format}`);
    
    switch (format) {
      case 'json':
        await fs.writeFile(exportPath, JSON.stringify(session, null, 2), 'utf-8');
        break;
      
      case 'txt':
        const txtContent = this.formatSessionAsText(session);
        await fs.writeFile(exportPath, txtContent, 'utf-8');
        break;
      
      case 'markdown':
        const mdContent = this.formatSessionAsMarkdown(session);
        await fs.writeFile(exportPath, mdContent, 'utf-8');
        break;
    }

    console.log(chalk.green(`📤 Exported session to: ${exportPath}`));
    return exportPath;
  }

  private formatSessionAsText(session: ConversationSession): string {
    let content = `Conversation: ${session.name}\n`;
    content += `Provider: ${session.provider} (${session.model})\n`;
    content += `Created: ${session.createdAt.toISOString()}\n`;
    content += `Updated: ${session.updatedAt.toISOString()}\n`;
    content += `Messages: ${session.messages.length}\n\n`;
    content += '='.repeat(50) + '\n\n';

    for (const message of session.messages) {
      content += `[${message.timestamp.toISOString()}] ${message.role.toUpperCase()}:\n`;
      content += `${message.content}\n\n`;
      
      if (message.toolCalls && message.toolCalls.length > 0) {
        content += `Tool Calls: ${JSON.stringify(message.toolCalls, null, 2)}\n\n`;
      }
    }

    return content;
  }

  private formatSessionAsMarkdown(session: ConversationSession): string {
    let content = `# ${session.name}\n\n`;
    content += `**Provider:** ${session.provider} (${session.model})  \n`;
    content += `**Created:** ${session.createdAt.toISOString()}  \n`;
    content += `**Updated:** ${session.updatedAt.toISOString()}  \n`;
    content += `**Messages:** ${session.messages.length}  \n\n`;
    content += '---\n\n';

    for (const message of session.messages) {
      content += `## ${message.role === 'user' ? '👤 User' : '🤖 Assistant'}\n`;
      content += `*${message.timestamp.toISOString()}*\n\n`;
      content += `${message.content}\n\n`;
      
      if (message.toolCalls && message.toolCalls.length > 0) {
        content += '### Tool Calls\n```json\n';
        content += JSON.stringify(message.toolCalls, null, 2);
        content += '\n```\n\n';
      }
    }

    return content;
  }

  getCurrentSession(): ConversationSession | null {
    return this.currentSession;
  }

  clearCurrentSession(): void {
    this.currentSession = null;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getSessionSummary(): Promise<string> {
    if (!this.currentSession) return 'No active session';

    const messageCount = this.currentSession.messages.length;
    const userMessages = this.currentSession.messages.filter(m => m.role === 'user').length;
    const assistantMessages = this.currentSession.messages.filter(m => m.role === 'assistant').length;
    const duration = new Date().getTime() - this.currentSession.createdAt.getTime();
    const durationMinutes = Math.round(duration / (1000 * 60));

    return `📊 Session: ${this.currentSession.name}
📅 Duration: ${durationMinutes} minutes
💬 Messages: ${messageCount} (${userMessages} user, ${assistantMessages} assistant)
🤖 Provider: ${this.currentSession.provider} (${this.currentSession.model})`;
  }
}
