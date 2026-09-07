# ワイさんすう 実装計画（WBS）

## フェーズ概要

| フェーズ | 内容 | 依存 |
|---------|------|------|
| 0 | プロジェクト初期化 | — |
| 1 | Domain Layer（型・定数・ロジック） | 0 |
| 2 | ドリル実行画面（コア体験） | 1 |
| 3 | レベル選択・ホーム画面 | 1 |
| 4 | 結果画面 | 2 |
| 5 | データ永続化（LocalStorage） | 2, 3, 4 |
| 6 | 効果音・アニメーション | 2, 4 |
| 7 | ユーザー管理 | 5 |
| 8 | E2Eテスト・仕上げ | 全フェーズ |

## フェーズ0: プロジェクト初期化

### 0-1. Next.jsプロジェクト作成

- `npx create-next-app@latest` (TypeScript, App Router, ESLint)
- Chakra UI インストール・プロバイダ設定
- Framer Motion インストール
- Howler.js インストール
- Jest + React Testing Library セットアップ
- Playwright セットアップ
- Prettier 設定（`.prettierrc`）
- `tsconfig.json` strict モード確認

### 0-2. ディレクトリ構造作成

- `src/components/`, `src/constants/`, `src/hooks/`, `src/lib/`, `src/types/` を作成
- 空の `index.ts` でモジュール境界を確保

### 0-3. CLAUDE.md 作成

- ビルド・テスト・lint コマンドを記載

**完了条件**: `npm run dev` で空のNext.jsアプリが起動する。`npm test` が通る。

---

## フェーズ1: Domain Layer

UIに依存しない純粋ロジック。テスト駆動で実装する。

### 1-1. 型定義

ファイル: `src/types/index.ts`

- `OperationType`, `ProblemFormat`
- `LevelDefinition`
- `Problem`
- `Answer`, `DrillResult`

### 1-2. たし算レベル定義

ファイル: `src/constants/levels/addition.ts`

- レベル1〜11の `LevelDefinition[]` をspec.mdに基づいて定義
- タイムは秒数に変換（例: 1分30秒 → 90）

テスト:
- 全11レベルが定義されていること
- 各レベルのタイム・問題数がspec.mdと一致すること

### 1-3. 問題生成ロジック

ファイル: `src/lib/generator/addition.ts`, `src/lib/generator/index.ts`

- `ProblemGenerator` インターフェース定義
- `AdditionGenerator` 実装
  - タイプA（直接回答）の問題生成
  - タイプB（部分回答）の問題生成
  - タイプC（分解回答）の問題生成・中間値計算
- ファクトリ関数 `getGenerator(operation)`

テスト:
- 各レベルで生成した問題のオペランドが値域内であること
- 0のみの数が出題されないこと
- 直前重複しないこと
- 問題数が正しいこと
- 分解回答の中間値（upperDigits + lowerDigits = correctAnswer）が正しいこと
- 部分回答の正解（1の位 or 10の位）が正しいこと

### 1-4. 合格判定ロジック

ファイル: `src/lib/judge.ts`

- `judge()` 関数
- `getBestRecord()` 関数

テスト:
- 全問正解 + ◎タイム以内 → `excellent`
- 全問正解 + ○タイム以内 → `pass`
- 全問正解 + ○タイム超過 → `fail`
- 1問でも不正解 → `fail`

**完了条件**: Domain Layer のユニットテストが全て通る。

---

## フェーズ2: ドリル実行画面（コア体験）

最も重要な画面。ここが動けばMVP。

### 2-1. DrillContext（状態管理）

ファイル: `src/hooks/useDrill.ts`

- `DrillState`, `DrillAction` 型
- `drillReducer` 実装
- `DrillProvider` / `useDrill` フック

### 2-2. テンキー（Numpad）

ファイル: `src/components/Numpad/`

- 0〜9のDigitButton
- DeleteButton（⌫アイコン）
- SubmitButton（→アイコン）
- ボタンはアイコンのみ、文字なし
- タップターゲット 44×44px以上

テスト:
- 数字タップで入力値が更新されること
- 削除タップで末尾1文字が消えること
- 送信タップで回答がsubmitされること

### 2-3. 問題表示（ProblemDisplay）

ファイル: `src/components/Problem/`

- `DirectProblem` — タイプA
- `PartialProblem` — タイプB（「⇒」表記、回答欄1つ）
- `DecomposedProblem` — タイプC（回答欄3つ、フォーカス自動移動）
- `ProblemDisplay` — format に応じた出し分け

テスト:
- 各formatで正しいコンポーネントが描画されること

### 2-4. タイマー（TimerDisplay）

ファイル: `src/components/Timer/`

- カウントアップ表示（mm:ss形式）
- ○タイム超過時に色変化

### 2-5. カウントダウン（CountdownOverlay）

ファイル: `src/components/CountdownOverlay/`

- 3 → 2 → 1 → スタート！のオーバーレイ表示
- アニメーション付き

### 2-6. 正誤フィードバック（FeedbackOverlay）

ファイル: `src/components/FeedbackOverlay/`

- ○（正解）/ ×（不正解）のオーバーレイ
- 短時間表示後に自動で消える（500ms程度）

### 2-7. 進捗バー（ProgressBar）

ファイル: `src/components/ProgressBar/`

- 現在の問題番号 / 全問題数を表示

### 2-8. ドリル画面統合

ファイル: `src/app/drill/[operation]/[level]/page.tsx`

- 上記コンポーネントを組み合わせ
- フロー: カウントダウン → 問題表示 → 回答 → フィードバック → 次の問題 → ... → 終了

**完了条件**: レベル1のたし算ドリルが開始〜全問回答〜終了まで動作する。

---

## フェーズ3: レベル選択・ホーム画面

### 3-1. レベルカード（LevelCard）

ファイル: `src/components/LevelCard/`

- レベル番号、説明、○タイム / ◎タイム表示
- クリア状況バッジ（ClearBadge）
- タップでドリル画面へ遷移

### 3-2. レベル選択画面

ファイル: `src/app/drill/[operation]/page.tsx`

- LevelCard を11個並べるグリッドレイアウト
- 演算種別名をヘッダーに表示
- 戻るボタン

### 3-3. ホーム画面

ファイル: `src/app/page.tsx`

- 演算種別カード（OperationCard）
- v1.0では「たし算」のみ活性、他はグレーアウト＋「Coming Soon」
- アプリタイトル・ロゴ

**完了条件**: ホーム → レベル選択 → ドリル実行の画面遷移が動作する。

---

## フェーズ4: 結果画面

### 4-1. 結果画面

ファイル: `src/app/result/page.tsx`

- 合格判定バッジ（◎ / ○ / 不合格）
- 経過時間表示
- 正答数 / 全問数
- 各問の正誤一覧（スクロール可能）
- 「もう一度」ボタン → 同レベルでドリル再開
- 「レベル選択に戻る」ボタン

### 4-2. ドリル→結果のデータ受け渡し

- DrillContextの状態からDrillResultを生成
- Context経由で結果画面に渡す（URLには含めない）
- 結果画面にContextなしで直接アクセスした場合はホームにリダイレクト

**完了条件**: ドリル完了後に結果画面が正しく表示される。「もう一度」で再挑戦できる。

---

## フェーズ5: データ永続化

### 5-1. StorageService

ファイル: `src/lib/storage/storageService.ts`

- LocalStorageのラッパー
- JSON シリアライズ/デシリアライズ
- エラーハンドリング（プライベートブラウジング対応）

テスト:
- 保存・取得・削除が動作すること
- LocalStorage無効時にエラーにならないこと

### 5-2. 履歴保存

- ドリル完了時に `DrillRecord` を保存
- レベル選択画面でベストスコアを表示

### 5-3. 設定保存

- 効果音ON/OFF
- 最終プレイ（演算種別・レベル）

**完了条件**: ドリル結果がLocalStorageに保存され、レベル選択画面にクリア状況が反映される。ブラウザリロード後も履歴が保持される。

---

## フェーズ6: 効果音・アニメーション

### 6-1. 効果音システム

ファイル: `src/lib/sound.ts`

- Howler.jsで効果音を管理
- 正解音、不正解音、カウントダウン音、開始音、合格音、不合格音、ファンファーレ
- 設定に応じたON/OFF制御

### 6-2. フリー効果音の選定・配置

- ライセンスフリーの効果音素材を選定
- `public/sounds/` に配置

### 6-3. アニメーション強化

- Framer Motionによる正解/不正解エフェクト
- レベルクリア時の演出
- 画面遷移アニメーション

**完了条件**: 効果音がON/OFF切り替えできる。正誤時にアニメーション+音が出る。

---

## フェーズ7: ユーザー管理

### 7-1. ユーザー作成・選択

- ユーザー名入力
- アバター選択（プリセットアイコン）
- ユーザー切り替えUI（ホーム画面）

### 7-2. ユーザー別データ分離

- LocalStorageのキーに `{userId}` を含めて分離
- ユーザー削除時のデータクリーンアップ

**完了条件**: 複数ユーザーが作成でき、それぞれ独立したクリア履歴を持つ。

---

## フェーズ8: E2Eテスト・仕上げ

### 8-1. E2Eテスト

ファイル: `e2e/`

- ホーム → レベル選択 → ドリル実行 → 結果表示の一連フロー
- 全問正解 + ○タイム内 → ○合格表示
- 不正解あり → 不合格 + 最後まで進む
- ユーザー切り替え → 履歴が分離されている

### 8-2. レスポンシブ対応確認

- 320px（iPhone SE）〜 1200px
- iPad縦横

### 8-3. Lighthouse監査

- Performance 90+
- Accessibility 90+

### 8-4. Vercelデプロイ

- GitHub連携設定
- 本番デプロイ確認

**完了条件**: E2Eテスト全通過。Vercelにデプロイ済み。

---

## 実装順序の依存関係

```
Phase 0 ──→ Phase 1 ──→ Phase 2 ──→ Phase 4
                │            │            │
                └──→ Phase 3 ─┘            │
                                           ▼
                                       Phase 5 ──→ Phase 7
                                           │
                          Phase 2,4 ──→ Phase 6
                                                    │
                          All Phases ──→ Phase 8 ◄──┘
```

## MVP定義

**Phase 0〜4 完了時点でMVP**:
- たし算レベル1〜11のドリルが実行可能
- ランダム問題生成
- テンキー入力
- 合格判定
- 結果表示
- 再挑戦

MVPにはLocalStorage永続化・効果音・ユーザー管理は含まない。
