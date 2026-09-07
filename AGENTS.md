# AGENTS.md — ワイさんすう開発規約

## SSOT (Single Source of Truth)

- ドキュメントは `docs/` 配下に集約する
- 仕様の正とする情報源は `docs/spec.md` のみ
- 技術選定は `docs/spec.md` §8 に記載する
- 仕様変更時は `docs/spec.md` を先に更新し、実装はそれに追従する
- コード内コメントで仕様を補足する場合、`docs/spec.md` への参照を併記する

## コーディング規約

### 言語・フレームワーク

- TypeScript strict モードを使用する
- Next.js App Router を使用する
- React Server Components をデフォルトとし、クライアント状態が必要な場合のみ `'use client'` を付与する

### 命名規則

- コンポーネント: PascalCase（例: `LevelCard`, `Numpad`）
- フック: camelCase、`use` プレフィックス（例: `useDrill`, `useHistory`）
- 定数: UPPER_SNAKE_CASE（例: `ADDITION_LEVELS`）
- 型: PascalCase（例: `LevelDefinition`, `DrillResult`）
- ファイル名: コンポーネントは PascalCase、その他は camelCase

### ディレクトリ構成

- `src/components/` — 再利用可能なUIコンポーネント
- `src/constants/` — レベル定義などの定数
- `src/hooks/` — カスタムReactフック
- `src/lib/` — フレームワーク非依存のユーティリティ
- `src/types/` — 共有型定義
- `e2e/` — Playwright E2Eテスト

### テスト

- ユニットテスト: 問題生成ロジック、合格判定ロジックは必ずテストを書く
- コンポーネントテスト: ユーザー操作を伴うコンポーネント（Numpad等）はテストを書く
- E2Eテスト: ドリル実行→結果表示の一連のフローをカバーする

## 拡張性ガイドライン

### 演算種別の追加手順

1. `src/constants/levels/` に新しい演算種別のレベル定義ファイルを追加する
2. `src/lib/generator/` に問題生成Strategyを追加する
3. `docs/spec.md` のレベル定義セクションに新しい演算種別を追記する
4. ホーム画面の演算種別選択に新しいカードを追加する

### レベル定義の変更

- レベル定義は `src/constants/levels/` 内のTypeScriptファイルで管理する
- タイム、問題数、オペランド範囲はデータとして定義し、ロジックに埋め込まない

## コミット規約

- Conventional Commits 形式を使用する
- プレフィックス: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- 日本語コミットメッセージを許可する（例: `feat: レベル1のたし算問題生成を実装`）

## ブランチ戦略

- `main` — プロダクションブランチ
- `feat/*` — 機能開発ブランチ
- `fix/*` — バグ修正ブランチ
- マージは GitHub Pull Request 経由で行う

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
