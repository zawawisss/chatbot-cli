import { jest } from '@jest/globals';
import { ProviderConfig } from './types.js';

jest.mock('../tools/ToolManager', () => {
  return {
    ToolManager: jest.fn().mockImplementation(() => ({
      executeTool: jest.fn(),
      getTools: jest.fn().mockReturnValue([])
    }))
  };
});

import { GeminiProvider } from './GeminiProvider.js';

describe('GeminiProvider', () => {
  const config: ProviderConfig = {
    apiKey: 'dummy-key',
    model: 'gemini-2.5-flash',
  };

  it('should instantiate GeminiProvider without error', () => {
    expect(() => new GeminiProvider(config)).not.toThrow();
  });

  it('should throw error when instantiated with missing apiKey', () => {
    expect(() => new GeminiProvider({ ...config, apiKey: '' })).toThrow('Required configuration field missing: apiKey');
  });
});

