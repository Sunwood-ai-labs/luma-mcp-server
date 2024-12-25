#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ServerConfig } from './config/server-config.js';
import { LumaClient } from './clients/luma-client.js';
import { ToolHandlers } from './handlers/tool-handlers.js';
import { ErrorHandler } from './utils/error-handler.js';

/**
 * Luma MCPサーバークラス
 * ビデオ生成機能を提供するMCPサーバーの実装
 */
class LumaMcpServer {
  private server: Server;
  private toolHandlers: ToolHandlers;

  constructor() {
    // 環境変数の検証
    ServerConfig.validateEnv();

    // サーバーの初期化
    this.server = new Server(
      ServerConfig.info,
      {
        capabilities: ServerConfig.capabilities,
      }
    );

    // ツールハンドラーの初期化
    const lumaClient = new LumaClient();
    this.toolHandlers = new ToolHandlers(lumaClient);

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * リクエストハンドラーの設定
   */
  private setupHandlers(): void {
    // ツール一覧の取得
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.toolHandlers.getToolDefinitions(),
    }));

    // ツールの実行
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        return await this.toolHandlers.handleToolRequest(request);
      } catch (error) {
        return ErrorHandler.createErrorResponse(error);
      }
    });
  }

  /**
   * エラーハンドリングの設定
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('[Unhandled Rejection]', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('[Uncaught Exception]', error);
      process.exit(1);
    });
  }

  /**
   * サーバーの起動
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Luma MCP server running on stdio');
  }
}

// サーバーのインスタンス化と起動
const server = new LumaMcpServer();
server.run().catch((error) => {
  console.error('[Startup Error]', error);
  process.exit(1);
});
