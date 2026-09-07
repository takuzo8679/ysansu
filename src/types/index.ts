/** 演算種別 */
const OPERATION_TYPES = ['addition', 'subtraction', 'multiplication', 'division'] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export function isOperationType(value: unknown): value is OperationType {
  return typeof value === 'string' && OPERATION_TYPES.includes(value as OperationType);
}

/** 問題形式 */
export type ProblemFormat = 'direct' | 'partial' | 'decomposed';

/** 部分回答の対象桁 */
export type PartialTarget = 'ones' | 'tens';

/** 合格判定 */
export type Judgment = 'excellent' | 'pass' | 'fail';

/** レベル定義 */
export interface LevelDefinition {
  level: number;
  operation: OperationType;
  format: ProblemFormat;
  questionCount: number;
  timeLimit: {
    pass: number; // ○タイム（秒）
    excellent: number; // ◎タイム（秒）
  };
  operands: {
    left: { min: number; max: number };
    right: { min: number; max: number };
  };
  partialTarget?: PartialTarget;
  description: string;
}

/** 問題 */
export interface Problem {
  id: number;
  operands: [number, number];
  operator: OperationType;
  correctAnswer: number;
  format: ProblemFormat;
  decomposed?: {
    upperDigits: number;
    lowerDigits: number;
  };
  partialAnswer?: number;
  partialTarget?: PartialTarget;
}

/** ユーザーの回答 */
export interface Answer {
  problem: Problem;
  userAnswer: number | number[];
  correct: boolean;
  answerTime: number;
}

/** ドリル結果 */
export interface DrillResult {
  level: number;
  operation: OperationType;
  answers: Answer[];
  totalTime: number;
  allCorrect: boolean;
  correctCount: number;
  totalCount: number;
  judgment: Judgment;
  timestamp: string;
}

/** ドリル記録（永続化用） */
export interface DrillRecord {
  id: string;
  operation: OperationType;
  level: number;
  timestamp: string;
  totalTime: number;
  allCorrect: boolean;
  correctCount: number;
  totalCount: number;
  judgment: Judgment;
}

/** ユーザープロファイル */
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
}

/** ユーザー設定 */
export interface UserSettings {
  soundEnabled: boolean;
  lastOperation: OperationType | null;
  lastLevel: number | null;
}
