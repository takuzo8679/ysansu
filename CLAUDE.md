@AGENTS.md

# CLAUDE.md

## Project

ワイさんすう（ysansu）— 計算ドリルWebアプリ

## Commands

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # プロダクションビルド
npm run lint         # ESLint
npm test             # Jest ユニットテスト
npm test -- --watch  # Jest watchモード
npx playwright test  # E2Eテスト
```

## Architecture

- docs/spec.md — 仕様書 (SSOT)
- docs/architecture.md — アーキテクチャ
- docs/wbs.md — 実装計画
- AGENTS.md — AI開発規約

## Stack

Next.js (App Router) / TypeScript / Chakra UI / Framer Motion / Howler.js / Jest / Playwright

## Key Conventions

- TypeScript strict mode
- Domain Layer (src/lib/, src/types/) は React に依存しない
- 演算種別追加は Strategy パターンで拡張
- データ永続化は LocalStorage のみ
- コミット: Conventional Commits (日本語OK)
