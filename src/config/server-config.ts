/**
 * サーバー設定
 */
export const ServerConfig = {
  /**
   * サーバー情報
   */
  info: {
    name: 'luma-mcp-server',
    version: '0.1.0',
    description: 'A Model Context Protocol server for Luma AI video generation',
  },

  /**
   * サーバーの機能設定
   */
  capabilities: {
    tools: {},
  },

  /**
   * 環境変数の検証
   */
  validateEnv() {
    const requiredEnvVars = ['LUMA_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }
  },

  /**
   * APIキーの取得
   */
  getLumaApiKey() {
    return process.env.LUMA_API_KEY || '';
  },
} as const;
