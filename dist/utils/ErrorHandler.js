import chalk from 'chalk';
export class EnhancedErrorHandler {
    static defaultRetryConfig = {
        maxAttempts: 3,
        delayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 10000
    };
    static async withRetry(operation, context, config = {}) {
        const retryConfig = { ...this.defaultRetryConfig, ...config };
        let lastError;
        for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                const isRetryable = this.isRetryableError(error);
                if (attempt === retryConfig.maxAttempts || !isRetryable) {
                    break;
                }
                const delay = Math.min(retryConfig.delayMs * Math.pow(retryConfig.backoffMultiplier, attempt - 1), retryConfig.maxDelayMs);
                console.log(chalk.yellow(`⚠️ ${context.provider} ${context.operation} failed (attempt ${attempt}/${retryConfig.maxAttempts}). Retrying in ${delay}ms...`));
                await this.sleep(delay);
            }
        }
        throw this.enhanceError(lastError, context);
    }
    static isRetryableError(error) {
        if (!error)
            return false;
        // Network errors
        if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            return true;
        }
        // HTTP status codes that should be retried
        if (error.response?.status) {
            const status = error.response.status;
            return status === 429 || status === 502 || status === 503 || status === 504;
        }
        // Provider-specific retryable errors
        if (error.message) {
            const message = error.message.toLowerCase();
            return message.includes('quota') ||
                message.includes('rate limit') ||
                message.includes('service unavailable') ||
                message.includes('timeout') ||
                message.includes('overloaded');
        }
        return false;
    }
    static enhanceError(error, context) {
        const enhancedMessage = `
${chalk.red('❌ Operation Failed')}
${chalk.blue('Provider:')} ${context.provider}
${chalk.blue('Operation:')} ${context.operation}
${chalk.blue('Attempts:')} ${context.attempt}
${chalk.blue('Time:')} ${context.timestamp.toISOString()}
${chalk.blue('Error:')} ${error.message}

${this.getErrorSuggestions(error, context.provider)}
    `.trim();
        const enhancedError = new Error(enhancedMessage);
        enhancedError.stack = error.stack;
        return enhancedError;
    }
    static getErrorSuggestions(error, provider) {
        const message = error.message.toLowerCase();
        if (message.includes('quota') || message.includes('429')) {
            return chalk.yellow(`
💡 Suggestions:
- Wait for quota reset (usually resets daily/monthly)
- Upgrade to paid tier for higher limits
- Try a different provider temporarily`);
        }
        if (message.includes('api key') || message.includes('401') || message.includes('403')) {
            return chalk.yellow(`
💡 Suggestions:
- Check if API key is correct in .env file
- Verify API key has necessary permissions
- Generate a new API key if expired`);
        }
        if (message.includes('endpoint') || message.includes('404') || message.includes('enotfound')) {
            return chalk.yellow(`
💡 Suggestions:
- Check if ${provider} service is running
- Verify endpoint URL is correct
- Check network connectivity`);
        }
        if (message.includes('timeout')) {
            return chalk.yellow(`
💡 Suggestions:
- Check network connection
- Try reducing request complexity
- Increase timeout if possible`);
        }
        return chalk.yellow(`
💡 Suggestions:
- Check .env configuration
- Verify ${provider} service status
- Try again after a few minutes`);
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static formatErrorForUser(error) {
        if (typeof error === 'string') {
            return error;
        }
        if (error.response?.data?.error) {
            return error.response.data.error;
        }
        if (error.message) {
            return error.message;
        }
        return 'An unknown error occurred';
    }
    static logError(error, context) {
        console.error(chalk.red(`[${new Date().toISOString()}] ${context}:`), error);
    }
}
//# sourceMappingURL=ErrorHandler.js.map