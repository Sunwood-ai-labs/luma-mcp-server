import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { ZodError } from 'zod';

/**
 * エラーハンドリングユーティリティ
 */
export class ErrorHandler {
  /**
   * エラーをMCPエラーに変換
   */
  static toMcpError(error: unknown): McpError {
    if (error instanceof McpError) {
      return error;
    }

    if (error instanceof ZodError) {
      return new McpError(
        ErrorCode.InvalidParams,
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`
      );
    }

    if (error instanceof Error) {
      // APIエラーの特別な処理
      if (error.message.includes('API key')) {
        return new McpError(
          ErrorCode.InvalidRequest,
          'Invalid or missing API key'
        );
      }

      // レート制限エラーの処理
      if (error.message.includes('rate limit')) {
        return new McpError(
          ErrorCode.InvalidRequest,
          'API rate limit exceeded'
        );
      }

      return new McpError(
        ErrorCode.InternalError,
        `Internal error: ${error.message}`
      );
    }

    return new McpError(
      ErrorCode.InternalError,
      `Unknown error: ${String(error)}`
    );
  }

  /**
   * エラーレスポンスを生成
   */
  static createErrorResponse(error: unknown) {
    const mcpError = this.toMcpError(error);
    console.error('[Error]', mcpError);

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${mcpError.message}`,
        },
      ],
      isError: true,
    };
  }
}
