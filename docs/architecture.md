# ワイさんすう アーキテクチャ

## 1. システム概要

完全クライアントサイドのSPA。サーバーサイド処理なし。Next.jsのSSG（Static Site Generation）でビルドし、Vercelから静的配信する。

```
┌─────────────────────────────────────────────────┐
│                    Vercel CDN                   │
│              （静的ファイル配信のみ）               │
└──────────────────────┬──────────────────────────┘
                       │ HTML/JS/CSS
                       ▼
┌─────────────────────────────────────────────────┐
│                   ブラウザ                        │
│  ┌───────────────────────────────────────────┐  │
│  │           Next.js App (React)             │  │
│  │                                           │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐   │  │
│  │  │  Pages  │  │Components│  │  Hooks  │   │  │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘   │  │
│  │       └─────────────┼─────────────┘       │  │
│  │                     ▼                     │  │
│  │  ┌───────────────────────────────────┐    │  │
│  │  │         Domain Layer              │    │  │
│  │  │  (Generator / Judge / Types)      │    │  │
│  │  └──────────────┬────────────────────┘    │  │
│  │                 ▼                         │  │
│  │  ┌───────────────────────────────────┐    │  │
│  │  │         Data Layer                │    │  │
│  │  │      (LocalStorage)               │    │  │
│  │  └───────────────────────────────────┘    │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 2. レイヤー構成

### 2.1. Presentation Layer（`src/app/`, `src/components/`）

UIの描画とユーザー操作のハンドリングを担当する。

- **Pages**: Next.js App Routerのルートコンポーネント。画面遷移の単位
- **Components**: 再利用可能なUIパーツ。演算種別に依存しない汎用設計
- **Hooks**: UIとDomain Layerを接続するカスタムフック

### 2.2. Domain Layer（`src/lib/`, `src/constants/`, `src/types/`）

ビジネスロジックを担当する。React/Next.jsに依存しない純粋なTypeScriptモジュール。

- **Generator**: 問題生成ロジック（Strategyパターン）
- **Judge**: 合格判定ロジック
- **Constants**: レベル定義データ
- **Types**: 共有型定義

### 2.3. Data Layer（`src/lib/storage/`）

LocalStorageへの永続化を担当する。

- **StorageService**: CRUD操作の抽象化
- **Schemas**: 保存データのバリデーション

## 3. ルーティング

```
/                           → ホーム画面（演算種別選択 + ユーザー管理）
/drill/[operation]          → レベル選択画面
/drill/[operation]/[level]  → ドリル実行画面
/result                     → 結果画面
/history                    → 学習の記録画面（タイム推移グラフ + 履歴リスト）
```

- `[operation]`: `addition` | `subtraction` | `multiplication` | `division`（型ガード `isOperationType()` で検証、無効値は404）
- `[level]`: `1` 〜 `11`（演算種別により上限は異なる）

結果データはドリル実行画面から `sessionStorage` + `DrillResultProvider` 経由で結果画面に渡す（URLに含めない）。

## 4. コンポーネント設計

### 4.1. コンポーネントツリー

```
App (Providers: ChakraProvider > UserProvider > DrillResultProvider)
├── HomePage
│   ├── UserSelect                # ユーザー選択・作成
│   │   └── CreateUserModal       # 新規ユーザー作成ダイアログ
│   ├── OperationCard[]           # 演算種別カード（たし算/ひき算/...）
│   └── Link → /history           # 学習の記録リンク
│
├── LevelSelectPage
│   ├── LevelCard[]               # レベルカード（1〜11）
│   │   └── JudgmentBadge         # クリア状況アイコン（◎/○/△）
│   └── BackButton
│
├── DrillPage
│   ├── CountdownOverlay          # 3,2,1,スタート!
│   ├── ProgressBar               # 問題進捗（例: 15/36）
│   ├── Description               # 問題説明文
│   ├── ProblemDisplay            # 問題表示
│   │   ├── DirectProblem         # タイプA: A + B = [ ]
│   │   ├── PartialProblem        # タイプB: A + B ⇒ [ ] + 例題表示
│   │   └── DecomposedProblem     # タイプC: A + B = [ ] + [ ] = [ ] + 例題表示
│   └── Numpad                    # テンキー入力
│       ├── DigitButton[0-9]
│       ├── DeleteButton (⌫)
│       └── SubmitButton (→)
│
├── ResultPage
│   ├── JudgmentDisplay           # ◎/○/不合格（アニメーション付き）
│   ├── TimeSummary               # 経過時間
│   ├── ScoreSummary              # 正答数/全問数
│   ├── 全問正解: 「ぜんもん せいかい！」
│   ├── 間違いあり: 間違えた問題リスト（正解付き）
│   ├── RetryButton               # もういちど
│   └── BackToLevelButton         # レベルせんたく
│
└── HistoryPage
    ├── LevelFilter               # レベルフィルタ（ぜんぶ/Lv.1〜11）
    ├── TimeChart (Recharts)      # タイム推移折れ線グラフ
    └── RecordRow[]               # 履歴リスト（△/○/◎バッジ付き）
```

### 4.2. ProblemDisplayの出し分け

`LevelDefinition.format` に基づいて表示コンポーネントを切り替える。

```typescript
// ProblemDisplay.tsx
switch (level.format) {
  case 'direct':
    return <DirectProblem ... />;
  case 'partial':
    return <PartialProblem ... />;
  case 'decomposed':
    return <DecomposedProblem ... />;
}
```

## 5. 状態管理

### 5.1. 方針

- グローバル状態管理ライブラリ（Redux等）は使用しない
- **React Context** + **useReducer** でドリル実行中の状態を管理する
- 画面をまたぐデータ受け渡しは **React Context** または **URLパラメータ** を使用する

### 5.2. ドリル実行中の状態（DrillContext）

```typescript
interface DrillState {
  // 設定（ドリル開始時に確定）
  levelDef: LevelDefinition;
  problems: Problem[];

  // 進行状態
  phase: 'countdown' | 'running' | 'finished';
  currentIndex: number;
  startTime: number | null;
  elapsedTime: number;

  // 回答履歴
  answers: Answer[];
}

interface Answer {
  problem: Problem;
  userAnswer: number | number[];   // 分解回答は配列
  correct: boolean;
  answerTime: number;              // この問題に要した時間
}

type DrillAction =
  | { type: 'START' }
  | { type: 'SUBMIT_ANSWER'; userAnswer: number | number[] }
  | { type: 'TICK' }
  | { type: 'FINISH' };
```

### 5.3. 永続データの状態

LocalStorageとの同期はカスタムフック `useHistory(userId)` / `useSettings(userId)` で抽象化する。userId はアクティブユーザーのIDを受け取る。

```typescript
function useHistory(userId: string): { records: DrillRecord[]; addRecord: (r: Omit<DrillRecord, 'id'>) => void; }
function useSettings(userId: string): { settings: UserSettings; updateSettings: (p: Partial<UserSettings>) => void; }
```

## 6. 問題生成アーキテクチャ（Strategy パターン）

### 6.1. クラス図

```
        ┌──────────────────────┐
        │  ProblemGenerator    │ ← interface
        │  ──────────────────  │
        │  generate(level):    │
        │    Problem[]         │
        └──────────┬───────────┘
                   │ implements
      ┌────────────┼────────────────┐
      ▼            ▼                ▼
┌──────────┐ ┌──────────────┐ ┌──────────────┐
│ Addition │ │ Subtraction  │ │Multiplication│  ...
│ Generator│ │ Generator    │ │ Generator    │
└──────────┘ └──────────────┘ └──────────────┘
```

### 6.2. 問題生成フロー

```
1. LevelDefinition を取得
2. 該当する ProblemGenerator を選択
3. questionCount 分の問題を生成
   - オペランド値域内でランダム値を生成
   - 制約チェック（0排除、直前重複排除）
   - Problem オブジェクトを生成
4. Problem[] を返却
```

### 6.3. Problem 型

```typescript
interface Problem {
  id: number;                     // 問題番号（1始まり）
  operands: [number, number];     // [左辺, 右辺]
  operator: OperationType;
  correctAnswer: number;          // 最終回答
  format: ProblemFormat;

  // 分解回答の場合の中間値
  decomposed?: {
    upperDigits: number;          // 上位の位の合計
    lowerDigits: number;          // 下位の位の合計
  };

  // 部分回答の場合の正解
  partialAnswer?: number;         // 特定の位の値
  partialTarget?: 'ones' | 'tens';
}
```

## 7. 合格判定ロジック

```typescript
interface DrillResult {
  level: number;
  operation: OperationType;
  answers: Answer[];
  totalTime: number;              // 秒
  allCorrect: boolean;
  correctCount: number;
  totalCount: number;
  judgment: 'excellent' | 'pass' | 'fail';
  timestamp: string;              // ISO 8601
}

function judge(
  answers: Answer[],
  totalTime: number,
  levelDef: LevelDefinition
): DrillResult['judgment'] {
  const allCorrect = answers.every(a => a.correct);
  if (!allCorrect) return 'fail';
  if (totalTime <= levelDef.timeLimit.excellent) return 'excellent';
  if (totalTime <= levelDef.timeLimit.pass) return 'pass';
  return 'fail';
}
```

## 8. LocalStorage スキーマ

### 8.1. キー設計

```
ysansu:users                     → UserProfile[]
ysansu:activeUserId              → string (userId)
ysansu:history:{userId}          → DrillRecord[]
ysansu:settings:{userId}         → UserSettings
```

### 8.2. 型定義

```typescript
interface UserProfile {
  id: string;                     // UUID
  name: string;
  avatar: string;                 // プリセットアバターのキー
  createdAt: string;
}

interface DrillRecord {
  id: string;
  operation: OperationType;
  level: number;
  timestamp: string;              // ISO 8601
  totalTime: number;              // 秒
  allCorrect: boolean;
  correctCount: number;
  totalCount: number;
  judgment: 'excellent' | 'pass' | 'fail';
}

interface UserSettings {
  soundEnabled: boolean;
  lastOperation: OperationType | null;
  lastLevel: number | null;
}
```

### 8.3. ベストスコアの導出

保存は全履歴（`DrillRecord[]`）。ベストスコアの表示はUIレイヤーで `DrillRecord[]` からフィルタ・ソートして導出する（保存データの二重管理を避ける）。

```typescript
function getBestRecord(
  records: DrillRecord[],
  operation: OperationType,
  level: number
): DrillRecord | null {
  return records
    .filter(r => r.operation === operation && r.level === level)
    .sort((a, b) => {
      // judgment 優先: excellent > pass > fail
      const rank = { excellent: 0, pass: 1, fail: 2 };
      if (rank[a.judgment] !== rank[b.judgment]) {
        return rank[a.judgment] - rank[b.judgment];
      }
      // 同一judgment内ではタイム昇順
      return a.totalTime - b.totalTime;
    })[0] ?? null;
}
```

## 9. 演算種別の拡張手順

新しい演算種別（例: ひき算）を追加する手順:

### Step 1: レベル定義の追加

```
src/constants/levels/subtraction.ts
```

`LevelDefinition[]` を定義する。PDFが存在する場合はそこからレベル構成・タイム・問題形式を抽出する。

### Step 2: 問題生成Strategyの追加

```
src/lib/generator/subtraction.ts
```

`ProblemGenerator` インターフェースを実装する。引き算固有の制約（答えが負にならない等）をここに閉じ込める。

### Step 3: Generatorファクトリへの登録

```typescript
// src/lib/generator/index.ts
const generators: Record<OperationType, ProblemGenerator> = {
  addition: new AdditionGenerator(),
  subtraction: new SubtractionGenerator(),  // ← 追加
};
```

### Step 4: ルーティングの確認

`/drill/subtraction/[level]` が自動的にルーティングされる（動的ルートのため追加作業なし）。

### Step 5: ホーム画面への追加

`OperationCard` のデータソースに新しい演算種別を追加する。

### Step 6: ドキュメント更新

`docs/spec.md` のレベル定義に新しい演算種別のセクションを追加する。

## 10. エラーハンドリング

### 10.1. LocalStorage

- 容量超過: 古い履歴から削除して再試行
- データ破損: デフォルト値にフォールバック、コンソールに警告
- プライベートブラウジング: LocalStorageが使えない場合はインメモリで動作（履歴は保存されない旨を通知）

### 10.2. 問題生成

- 値域内でユニークな問題が生成できない場合: 直前重複チェックを緩和（理論上、36問の値域で枯渇することはないが安全弁として）

## 11. テスト戦略

### 11.1. ユニットテスト（Jest）

対象:
- `src/lib/generator/*` — 各演算種別の問題生成が値域・制約を満たすか
- `src/lib/judge.ts` — 合格判定ロジック
- `src/lib/storage/*` — LocalStorage操作

### 11.2. コンポーネントテスト（React Testing Library）

対象:
- `Numpad` — テンキー入力・削除・送信の動作
- `ProblemDisplay` — 問題形式に応じた表示切り替え

### 11.3. E2Eテスト（Playwright）

対象:
- ドリル実行の一連のフロー（レベル選択→問題回答→結果表示）
- 全問正解+○タイム内で○合格が表示されること
- 不正解があっても最後まで進めること
