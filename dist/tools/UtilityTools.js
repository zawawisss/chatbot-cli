import { createHash } from 'crypto';
export class UtilityTools {
    static getToolDefinitions() {
        return [
            {
                name: 'get_current_time',
                description: 'Get the current date and time',
                parameters: {
                    type: 'object',
                    properties: {
                        format: {
                            type: 'string',
                            description: 'Format: iso, local, or timestamp',
                            default: 'iso'
                        },
                        timezone: {
                            type: 'string',
                            description: 'Timezone (e.g., America/New_York, UTC)',
                            default: 'local'
                        }
                    }
                }
            },
            {
                name: 'calculate',
                description: 'Perform mathematical calculations',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: {
                            type: 'string',
                            description: 'Mathematical expression to evaluate'
                        }
                    },
                    required: ['expression']
                }
            },
            {
                name: 'generate_uuid',
                description: 'Generate a random UUID',
                parameters: {
                    type: 'object',
                    properties: {
                        version: {
                            type: 'number',
                            description: 'UUID version (4 supported)',
                            default: 4
                        }
                    }
                }
            },
            {
                name: 'base64_encode',
                description: 'Encode text to base64',
                parameters: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'Text to encode'
                        }
                    },
                    required: ['text']
                }
            },
            {
                name: 'base64_decode',
                description: 'Decode base64 to text',
                parameters: {
                    type: 'object',
                    properties: {
                        encoded: {
                            type: 'string',
                            description: 'Base64 encoded string'
                        }
                    },
                    required: ['encoded']
                }
            },
            {
                name: 'hash_text',
                description: 'Generate hash of text',
                parameters: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'Text to hash'
                        },
                        algorithm: {
                            type: 'string',
                            description: 'Hash algorithm (md5, sha1, sha256, sha512)',
                            default: 'sha256'
                        }
                    },
                    required: ['text']
                }
            },
            {
                name: 'url_encode',
                description: 'URL encode text',
                parameters: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'Text to URL encode'
                        }
                    },
                    required: ['text']
                }
            },
            {
                name: 'url_decode',
                description: 'URL decode text',
                parameters: {
                    type: 'object',
                    properties: {
                        encoded: {
                            type: 'string',
                            description: 'URL encoded string'
                        }
                    },
                    required: ['encoded']
                }
            },
            {
                name: 'get_system_info',
                description: 'Get system information',
                parameters: {
                    type: 'object',
                    properties: {}
                }
            }
        ];
    }
    static getCurrentTime(format = 'iso', timezone = 'local') {
        const now = new Date();
        switch (format) {
            case 'iso':
                return now.toISOString();
            case 'local':
                return now.toLocaleString();
            case 'timestamp':
                return now.getTime().toString();
            default:
                return now.toISOString();
        }
    }
    static calculate(expression) {
        try {
            // Basic safe math evaluation (only allow numbers, operators, and parentheses)
            const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
            const result = Function('"use strict"; return (' + sanitized + ')')();
            return result;
        }
        catch (error) {
            throw new Error('Invalid mathematical expression');
        }
    }
    static generateUuid(version = 4) {
        if (version === 4) {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        else {
            throw new Error('Only UUID version 4 is supported');
        }
    }
    static base64Encode(text) {
        return Buffer.from(text, 'utf8').toString('base64');
    }
    static base64Decode(encoded) {
        try {
            return Buffer.from(encoded, 'base64').toString('utf8');
        }
        catch (error) {
            throw new Error('Invalid base64 string');
        }
    }
    static hashText(text, algorithm = 'sha256') {
        try {
            const supportedAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
            if (!supportedAlgorithms.includes(algorithm)) {
                return {
                    success: false,
                    error: `Unsupported algorithm: ${algorithm}. Supported: ${supportedAlgorithms.join(', ')}`,
                    supportedAlgorithms
                };
            }
            const hash = createHash(algorithm).update(text, 'utf8').digest('hex');
            return {
                success: true,
                text: text,
                algorithm: algorithm,
                hash: hash,
                length: hash.length
            };
        }
        catch (error) {
            return {
                success: false,
                text: text,
                algorithm: algorithm,
                error: `Failed to generate hash: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    static urlEncode(text) {
        return encodeURIComponent(text);
    }
    static urlDecode(encoded) {
        try {
            return decodeURIComponent(encoded);
        }
        catch (error) {
            throw new Error('Invalid URL encoded string');
        }
    }
    static getSystemInfo() {
        return {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            pid: process.pid,
            cwd: process.cwd(),
            env: {
                PATH: process.env.PATH?.split(':').slice(0, 5), // Show first 5 PATH entries
                HOME: process.env.HOME,
                SHELL: process.env.SHELL,
                USER: process.env.USER
            }
        };
    }
}
//# sourceMappingURL=UtilityTools.js.map