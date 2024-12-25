import { z } from 'zod';

/**
 * ビデオ生成の基本オプション
 */
export const BaseVideoOptionsSchema = z.object({
  loop: z.boolean().optional(),
  callback_url: z.string().url().optional(),
});

/**
 * テキストからビデオを生成する際の入力スキーマ
 */
export const GenerateVideoSchema = z.object({
  prompt: z.string().min(1),
  ...BaseVideoOptionsSchema.shape,
});

/**
 * 画像からビデオを生成する際の入力スキーマ
 */
export const GenerateVideoFromImageSchema = z.object({
  prompt: z.string().min(1),
  image_url: z.string().url(),
  ...BaseVideoOptionsSchema.shape,
});

/**
 * ビデオを拡張する際の入力スキーマ
 */
export const ExtendVideoSchema = z.object({
  prompt: z.string().min(1),
  source_generation_id: z.string().min(1),
  ...BaseVideoOptionsSchema.shape,
});

/**
 * ビデオを補間する際の入力スキーマ
 */
export const InterpolateVideosSchema = z.object({
  prompt: z.string().min(1),
  start_generation_id: z.string().min(1),
  end_generation_id: z.string().min(1),
  callback_url: z.string().url().optional(),
});
