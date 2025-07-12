import { jest } from '@jest/globals';
import { ProviderConfig } from './types.js';

// Mock ToolManager to avoid external deps
jest.mock('../tools/ToolManager', () => {
  return {
    ToolManager: jest.fn().mockImplementation(() => ({
      executeTool: jest.fn(),
      getTools: jest.fn().mockReturnValue([])
    }))
  };
});

import { DeepSeekProvider } from './DeepSeekProvider.js';

describe('DeepSeekProvider', () => {
  const config: ProviderConfig = {
    apiKey: 'dummy-key',
    model: 'deepseek-chat',
  };

  it('should instantiate DeepSeekProvider without error', () => {
    expect(() => new DeepSeekProvider(config)).not.toThrow();
  });

  it('should throw error when instantiated with missing apiKey', () => {
    expect(() => new DeepSeekProvider({ ...config, apiKey: '' })).toThrow('Required configuration field missing: apiKey');
  });
});

