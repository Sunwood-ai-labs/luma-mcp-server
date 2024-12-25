import {
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { LumaClient } from '../clients/luma-client.js';
import {
  GenerateVideoSchema,
  GenerateVideoFromImageSchema,
  ExtendVideoSchema,
  InterpolateVideosSchema,
} from '../types/schemas.js';

/**
 * ツール定義とハンドラーの管理クラス
 */
export class ToolHandlers {
  constructor(private readonly lumaClient: LumaClient) {}

  /**
   * 利用可能なツールの定義を取得
   */
  getToolDefinitions() {
    return [
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
    ];
  }

  /**
   * ツールリクエストを処理
   */
  async handleToolRequest(request: typeof CallToolRequestSchema._type) {
    try {
      const args = request.params.arguments;
      if (!args || typeof args !== 'object') {
        throw new McpError(ErrorCode.InvalidParams, 'Invalid arguments');
      }

      const result = await this.executeToolAction(request.params.name, args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
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
  }

  /**
   * ツールアクションを実行
   */
  private async executeToolAction(toolName: string, args: unknown) {
    switch (toolName) {
      case 'generate_video': {
        const params = GenerateVideoSchema.parse(args);
        return await this.lumaClient.generateVideo(params.prompt, {
          loop: params.loop,
          callback_url: params.callback_url,
        });
      }

      case 'generate_video_from_image': {
        const params = GenerateVideoFromImageSchema.parse(args);
        return await this.lumaClient.generateVideoFromImage(
          params.prompt,
          params.image_url,
          {
            loop: params.loop,
            callback_url: params.callback_url,
          }
        );
      }

      case 'extend_video': {
        const params = ExtendVideoSchema.parse(args);
        return await this.lumaClient.extendVideo(
          params.prompt,
          params.source_generation_id,
          {
            loop: params.loop,
            callback_url: params.callback_url,
          }
        );
      }

      case 'interpolate_videos': {
        const params = InterpolateVideosSchema.parse(args);
        return await this.lumaClient.interpolateVideos(
          params.prompt,
          params.start_generation_id,
          params.end_generation_id,
          {
            callback_url: params.callback_url,
          }
        );
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${toolName}`
        );
    }
  }
}
