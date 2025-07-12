import fetch from 'node-fetch';
import https from 'https';
import { ToolDefinition } from '../providers/types.js';

export class WebSearchTools {
  static getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'web_search',
        description: 'Perform a web search using SerpAPI to get real-time search results from Google',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            no_html: {
              type: 'boolean',
              description: 'Exclude HTML from results',
              default: true
            },
            region: {
              type: 'string',
              description: 'Region to target the search',
              default: 'wt-wt'
            }
          },
          required: ['query']
        }
      }
    ];
  }

  static async webSearch(query: string, noHtml: boolean = true, region: string = 'wt-wt'): Promise<any> {
    try {
      const apiKey = '0d05bff7102460a4b25fba50bbd3d8e898627e1eb79c47469c03286e84ed303a';
      const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=5`);
      const data = await response.json() as any;

      if (!data.organic_results || data.organic_results.length === 0) {
        return {
          success: false,
          query: query,
          error: 'No results found'
        };
      }

      // Extract necessary details from results
      const searchResults = {
        success: true,
        query: query,
        heading: `Search Results for: ${query}`,
        abstract: data.organic_results[0].snippet || '',
        relatedTopics: data.organic_results.map((result: any) => ({
          text: result.title,
          firstUrl: result.link
        })),
        source: 'SerpAPI',
        searchUrl: `https://serpapi.com/search?q=${encodeURIComponent(query)}`
      };

      return searchResults;
      
    } catch (error) {
      return {
        success: false,
        query: query,
        error: `Failed to perform web search: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
