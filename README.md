<div align="center">
  <img src="assets/header.svg" alt="Luma MCP Server" width="100%" />

# Luma MCP Server

Luma AIのビデオ生成APIをModel Context Protocol (MCP)として提供するサーバー

</div>

## 🌟 概要

Luma MCP Serverは、Luma AIのビデオ生成機能をMCPサーバーとして提供します。テキストや画像からビデオを生成したり、既存のビデオを拡張・補間したりする機能を提供します。

## 🚀 機能

- テキストからビデオ生成
- 画像からビデオ生成
- 既存ビデオの拡張
- 2つのビデオ間の補間

## 📦 インストール

```bash
npm install @sunwood-ai-labs/luma-mcp-server
```

## ⚙️ 環境設定

1. Luma APIキーの取得
   - [Luma AI Developer Portal](https://lumalabs.ai/dream-machine/api/keys)からAPIキーを取得してください。

2. 環境変数の設定
   ```bash
   export LUMA_API_KEY=your_api_key_here
   ```

## 🛠️ 使用可能なツール

### generate_video
テキストプロンプトからビデオを生成します。

```typescript
{
  name: 'generate_video',
  arguments: {
    prompt: "A teddy bear in sunglasses playing electric guitar and dancing",
    loop: true,  // オプション
    callback_url: "https://your-callback-url.com"  // オプション
  }
}
```

### generate_video_from_image
画像を開始フレームとしてビデオを生成します。

```typescript
{
  name: 'generate_video_from_image',
  arguments: {
    prompt: "Low-angle shot of a majestic tiger prowling through a snowy landscape",
    image_url: "https://your-image-url.com/start-frame.jpg",
    loop: true,  // オプション
    callback_url: "https://your-callback-url.com"  // オプション
  }
}
```

### extend_video
既存のビデオを拡張します。

```typescript
{
  name: 'extend_video',
  arguments: {
    prompt: "Continue the dance sequence",
    source_generation_id: "existing-video-generation-id",
    loop: true,  // オプション
    callback_url: "https://your-callback-url.com"  // オプション
  }
}
```

### interpolate_videos
2つのビデオ間をスムーズに補間します。

```typescript
{
  name: 'interpolate_videos',
  arguments: {
    prompt: "Create a smooth transition between the videos",
    start_generation_id: "first-video-generation-id",
    end_generation_id: "second-video-generation-id",
    callback_url: "https://your-callback-url.com"  // オプション
  }
}
```

## 📝 注意事項

- プロンプトは英語で記述してください
- ビデオ生成には時間がかかる場合があります
- APIの利用制限に注意してください

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m '✨ feat: Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。
