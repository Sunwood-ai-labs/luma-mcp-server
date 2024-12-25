import { LumaAI } from 'lumaai';
import fetch from 'node-fetch';
import fs from 'fs';
import {
  VideoGeneration,
  VideoGenerationParams,
  BaseVideoOptions,
} from '../types/types.js';

/**
 * Luma APIクライアントクラス
 * ビデオ生成に関する操作を提供します
 */
export class LumaClient {
  private client: LumaAI;
  private readonly pollingInterval = 3000; // ポーリング間隔（ミリ秒）

  constructor() {
    const apiKey = process.env.LUMA_API_KEY;
    if (!apiKey) {
      throw new Error('LUMA_API_KEY environment variable is required');
    }
    this.client = new LumaAI({ authToken: apiKey });
  }

  /**
   * テキストからビデオを生成します
   */
  async generateVideo(prompt: string, options?: BaseVideoOptions): Promise<VideoGeneration> {
    const params: LumaAI.GenerationCreateParams = {
      prompt,
      loop: options?.loop,
      callback_url: options?.callback_url,
    };

    const generation = await this.client.generations.create(params);
    if (!generation.id) {
      throw new Error('Generation ID is missing');
    }
    return this.waitForCompletion(generation.id, prompt);
  }

  /**
   * 画像からビデオを生成します
   */
  async generateVideoFromImage(
    prompt: string,
    imageUrl: string,
    options?: BaseVideoOptions
  ): Promise<VideoGeneration> {
    const params: LumaAI.GenerationCreateParams = {
      prompt,
      keyframes: {
        frame0: {
          type: 'image',
          url: imageUrl,
        },
      },
      loop: options?.loop,
      callback_url: options?.callback_url,
    };

    const generation = await this.client.generations.create(params);
    if (!generation.id) {
      throw new Error('Generation ID is missing');
    }
    return this.waitForCompletion(generation.id, prompt);
  }

  /**
   * 既存のビデオを拡張します
   */
  async extendVideo(
    prompt: string,
    sourceGenerationId: string,
    options?: BaseVideoOptions
  ): Promise<VideoGeneration> {
    const params: LumaAI.GenerationCreateParams = {
      prompt,
      keyframes: {
        frame0: {
          type: 'generation',
          id: sourceGenerationId,
        },
      },
      loop: options?.loop,
      callback_url: options?.callback_url,
    };

    const generation = await this.client.generations.create(params);
    if (!generation.id) {
      throw new Error('Generation ID is missing');
    }
    return this.waitForCompletion(generation.id, prompt);
  }

  /**
   * 2つのビデオ間を補間します
   */
  async interpolateVideos(
    prompt: string,
    startGenerationId: string,
    endGenerationId: string,
    options?: Pick<BaseVideoOptions, 'callback_url'>
  ): Promise<VideoGeneration> {
    const params: LumaAI.GenerationCreateParams = {
      prompt,
      keyframes: {
        frame0: {
          type: 'generation',
          id: startGenerationId,
        },
        frame1: {
          type: 'generation',
          id: endGenerationId,
        },
      },
      callback_url: options?.callback_url,
    };

    const generation = await this.client.generations.create(params);
    if (!generation.id) {
      throw new Error('Generation ID is missing');
    }
    return this.waitForCompletion(generation.id, prompt);
  }

  /**
   * 生成の完了を待機します
   */
  private async waitForCompletion(generationId: string, prompt: string): Promise<VideoGeneration> {
    let generation = await this.client.generations.get(generationId);

    while (generation.state !== 'completed') {
      if (generation.state === 'failed') {
        throw new Error(`Generation failed: ${generation.failure_reason}`);
      }
      await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
      generation = await this.client.generations.get(generationId);
    }

    return {
      ...generation,
      prompt,
    };
  }

  /**
   * 生成されたビデオをダウンロードします
   */
  async downloadVideo(videoUrl: string, outputPath: string): Promise<void> {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(outputPath);
    await new Promise<void>((resolve, reject) => {
      response.body?.pipe(fileStream);
      response.body?.on('error', reject);
      fileStream.on('finish', resolve);
    });
  }
}
