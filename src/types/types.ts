import { LumaAI } from 'lumaai';

/**
 * ビデオ生成のステータス
 */
export type GenerationState = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * ビデオ生成の基本オプション
 */
export interface BaseVideoOptions {
  loop?: boolean;
  callback_url?: string;
}

/**
 * キーフレームの参照タイプ
 */
export type KeyframeReference = {
  type: 'image';
  url: string;
} | {
  type: 'generation';
  id: string;
};

/**
 * キーフレーム設定
 */
export interface KeyframeConfig {
  frame0?: KeyframeReference;
  frame1?: KeyframeReference;
}

/**
 * ビデオ生成のパラメータ
 */
export type VideoGenerationParams = {
  prompt: string;
  keyframes?: KeyframeConfig;
  loop?: boolean;
  callback_url?: string;
};

/**
 * ビデオ生成のレスポンス
 * LumaAIのGenerationオブジェクトを拡張
 */
export type VideoGeneration = LumaAI.Generation & {
  prompt: string;
};

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
