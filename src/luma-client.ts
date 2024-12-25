import { LumaAI } from 'lumaai';
import fetch from 'node-fetch';
import fs from 'fs';

/**
 * Luma APIクライアントクラス
 * ビデオ生成に関する操作を提供します
 */
export class LumaClient {
  private client: LumaAI;

  constructor() {
    const apiKey = process.env.LUMA_API_KEY;
    if (!apiKey) {
      throw new Error('LUMA_API_KEY environment variable is required');
    }
    this.client = new LumaAI({ authToken: apiKey });
  }

  /**
   * テキストからビデオを生成します
   * @param prompt 生成するビデオの説明（英語）
   * @param options 追加のオプション
   * @returns 生成されたビデオの情報
   */
  async generateVideo(prompt: string, options?: {
    loop?: boolean;
    callback_url?: string;
  }) {
    const generation = await this.client.generations.create({
      prompt,
      loop: options?.loop,
      callback_url: options?.callback_url
    });

    return this.waitForCompletion(generation.id);
  }

  /**
   * 画像からビデオを生成します
   * @param prompt 生成するビデオの説明（英語）
   * @param imageUrl 開始フレームとして使用する画像のURL
   * @param options 追加のオプション
   * @returns 生成されたビデオの情報
   */
  async generateVideoFromImage(prompt: string, imageUrl: string, options?: {
    loop?: boolean;
    callback_url?: string;
  }) {
    const generation = await this.client.generations.create({
      prompt,
      keyframes: {
        frame0: {
          type: "image",
          url: imageUrl
        }
      },
      loop: options?.loop,
      callback_url: options?.callback_url
    });

    return this.waitForCompletion(generation.id);
  }

  /**
   * 生成されたビデオを拡張します
   * @param prompt 生成するビデオの説明（英語）
   * @param sourceGenerationId 元のビデオの生成ID
   * @param options 追加のオプション
   * @returns 生成されたビデオの情報
   */
  async extendVideo(prompt: string, sourceGenerationId: string, options?: {
    loop?: boolean;
    callback_url?: string;
  }) {
    const generation = await this.client.generations.create({
      prompt,
      keyframes: {
        frame0: {
          type: "generation",
          id: sourceGenerationId
        }
      },
      loop: options?.loop,
      callback_url: options?.callback_url
    });

    return this.waitForCompletion(generation.id);
  }

  /**
   * 2つのビデオ間を補間します
   * @param prompt 生成するビデオの説明（英語）
   * @param startGenerationId 開始ビデオの生成ID
   * @param endGenerationId 終了ビデオの生成ID
   * @param options 追加のオプション
   * @returns 生成されたビデオの情報
   */
  async interpolateVideos(prompt: string, startGenerationId: string, endGenerationId: string, options?: {
    callback_url?: string;
  }) {
    const generation = await this.client.generations.create({
      prompt,
      keyframes: {
        frame0: {
          type: "generation",
          id: startGenerationId
        },
        frame1: {
          type: "generation",
          id: endGenerationId
        }
      },
      callback_url: options?.callback_url
    });

    return this.waitForCompletion(generation.id);
  }

  /**
   * 生成の完了を待機します
   * @param generationId 生成ID
   * @returns 生成されたビデオの情報
   */
  private async waitForCompletion(generationId: string) {
    let generation = await this.client.generations.get(generationId);
    let completed = false;

    while (!completed) {
      if (generation.state === "completed") {
        completed = true;
      } else if (generation.state === "failed") {
        throw new Error(`Generation failed: ${generation.failure_reason}`);
      } else {
        await new Promise(r => setTimeout(r, 3000)); // 3秒待機
        generation = await this.client.generations.get(generationId);
      }
    }

    return generation;
  }

  /**
   * 生成されたビデオをダウンロードします
   * @param videoUrl ビデオのURL
   * @param outputPath 保存先のパス
   */
  async downloadVideo(videoUrl: string, outputPath: string) {
    const response = await fetch(videoUrl);
    const fileStream = fs.createWriteStream(outputPath);
    await new Promise((resolve, reject) => {
      response.body?.pipe(fileStream);
      response.body?.on('error', reject);
      fileStream.on('finish', resolve);
    });
  }
}
