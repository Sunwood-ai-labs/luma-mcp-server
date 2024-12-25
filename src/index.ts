#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { LumaClient } from './luma-client.js';

class LumaMcpServer {
  private server: Server;
  private lumaClient: LumaClient;

  constructor() {
    this.server = new Server(
      {
        name: 'luma-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.lumaClient = new LumaClient();

    this.setupToolHandlers();
    
    // エラーハンドリング
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_video',
          description: 'Generate a video from text prompt',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Text description of the video to generate (in English)',
              },
              loop: {
                type: 'boolean',
                description: 'Whether to create a looping video',
              },
              callback_url: {
                type: 'string',
                description: 'URL to receive generation status updates',
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'generate_video_from_image',
          description: 'Generate a video from an image and text prompt',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Text description of the video to generate (in English)',
              },
              image_url: {
                type: 'string',
                description: 'URL of the image to use as the starting frame',
              },
              loop: {
                type: 'boolean',
                description: 'Whether to create a looping video',
              },
              callback_url: {
                type: 'string',
                description: 'URL to receive generation status updates',
              },
            },
            required: ['prompt', 'image_url'],
          },
        },
        {
          name: 'extend_video',
          description: 'Extend an existing video',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Text description of the video extension (in English)',
              },
              source_generation_id: {
                type: 'string',
                description: 'Generation ID of the source video',
              },
              loop: {
                type: 'boolean',
                description: 'Whether to create a looping video',
              },
              callback_url: {
                type: 'string',
                description: 'URL to receive generation status updates',
              },
            },
            required: ['prompt', 'source_generation_id'],
          },
        },
        {
          name: 'interpolate_videos',
          description: 'Create a smooth transition between two videos',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Text description of the transition (in English)',
              },
              start_generation_id: {
                type: 'string',
                description: 'Generation ID of the starting video',
              },
              end_generation_id: {
                type: 'string',
                description: 'Generation ID of the ending video',
              },
              callback_url: {
                type: 'string',
                description: 'URL to receive generation status updates',
              },
            },
            required: ['prompt', 'start_generation_id', 'end_generation_id'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const args = request.params.arguments;
        if (!args || typeof args !== 'object') {
          throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments');
        }

        switch (request.params.name) {
          case 'generate_video': {
            if (!('prompt' in args) || typeof args.prompt !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid prompt');
            }
            const result = await this.lumaClient.generateVideo(args.prompt, {
              loop: typeof args.loop === 'boolean' ? args.loop : undefined,
              callback_url: typeof args.callback_url === 'string' ? args.callback_url : undefined,
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'generate_video_from_image': {
            if (!('prompt' in args) || typeof args.prompt !== 'string' ||
                !('image_url' in args) || typeof args.image_url !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid prompt or image_url');
            }
            const result = await this.lumaClient.generateVideoFromImage(
              args.prompt,
              args.image_url,
              {
                loop: typeof args.loop === 'boolean' ? args.loop : undefined,
                callback_url: typeof args.callback_url === 'string' ? args.callback_url : undefined,
              }
            );
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'extend_video': {
            if (!('prompt' in args) || typeof args.prompt !== 'string' ||
                !('source_generation_id' in args) || typeof args.source_generation_id !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid prompt or source_generation_id');
            }
            const result = await this.lumaClient.extendVideo(
              args.prompt,
              args.source_generation_id,
              {
                loop: typeof args.loop === 'boolean' ? args.loop : undefined,
                callback_url: typeof args.callback_url === 'string' ? args.callback_url : undefined,
              }
            );
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'interpolate_videos': {
            if (!('prompt' in args) || typeof args.prompt !== 'string' ||
                !('start_generation_id' in args) || typeof args.start_generation_id !== 'string' ||
                !('end_generation_id' in args) || typeof args.end_generation_id !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'Invalid prompt, start_generation_id, or end_generation_id');
            }
            const result = await this.lumaClient.interpolateVideos(
              args.prompt,
              args.start_generation_id,
              args.end_generation_id,
              {
                callback_url: typeof args.callback_url === 'string' ? args.callback_url : undefined,
              }
            );
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        console.error('[Tool Error]', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Luma MCP server running on stdio');
  }
}

const server = new LumaMcpServer();
server.run().catch(console.error);
