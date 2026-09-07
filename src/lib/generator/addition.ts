import { LevelDefinition, Problem } from '@/types';
import { ProblemGenerator } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOperands(
  levelDef: LevelDefinition,
  prev: [number, number] | null,
): [number, number] {
  const maxAttempts = 100;
  for (let i = 0; i < maxAttempts; i++) {
    const left = randomInt(levelDef.operands.left.min, levelDef.operands.left.max);
    const right = randomInt(levelDef.operands.right.min, levelDef.operands.right.max);

    // レベル1: 両方0は不可
    if (left === 0 && right === 0) continue;

    // 直前と同一の問題は出題しない
    if (prev && prev[0] === left && prev[1] === right) continue;

    return [left, right];
  }
  // フォールバック（理論上到達しない）
  const left = randomInt(levelDef.operands.left.min, levelDef.operands.left.max);
  const right = randomInt(levelDef.operands.right.min, levelDef.operands.right.max);
  return [left, right];
}

function getPartialAnswer(left: number, right: number, target: 'ones' | 'tens'): number {
  if (target === 'ones') {
    // 1の位だけたす: 67+28 → 7+8=15
    return (left % 10) + (right % 10);
  }
  // 10の位だけたす: 67+28 → 60+20=80
  const leftTens = Math.floor(left / 10) * 10 - Math.floor(left / 100) * 100;
  const rightTens = Math.floor(right / 10) * 10 - Math.floor(right / 100) * 100;
  return leftTens + rightTens;
}

function getDecomposed(
  left: number,
  right: number,
): { upperDigits: number; lowerDigits: number } {
  const sum = left + right;

  // 上位の位の合計: 10の位以上を丸めた値
  // 例: 67 + 28 → upperDigits = 80 (60+20), lowerDigits = 15 (7+8)
  // 例: 235 + 81 → upperDigits = 310 (230+80), lowerDigits = 6 (5+1)
  // 例: 317 + 524 → upperDigits = 830 (310+520), lowerDigits = 11 (7+4)

  // 1の位を取り出す
  const leftOnes = left % 10;
  const rightOnes = right % 10;
  const lowerDigits = leftOnes + rightOnes;

  // 上位の位（10の位以上）を合計
  const leftUpper = left - leftOnes;
  const rightUpper = right - rightOnes;
  const upperDigits = leftUpper + rightUpper;

  // 検証: upperDigits + lowerDigits === sum
  // (常に成立するはず)
  return { upperDigits, lowerDigits };
}

export class AdditionGenerator implements ProblemGenerator {
  generate(levelDef: LevelDefinition): Problem[] {
    const problems: Problem[] = [];
    let prev: [number, number] | null = null;

    for (let i = 0; i < levelDef.questionCount; i++) {
      const operands = generateOperands(levelDef, prev);
      const [left, right] = operands;
      const correctAnswer = left + right;

      const problem: Problem = {
        id: i + 1,
        operands,
        operator: 'addition',
        correctAnswer,
        format: levelDef.format,
      };

      if (levelDef.format === 'partial' && levelDef.partialTarget) {
        problem.partialTarget = levelDef.partialTarget;
        problem.partialAnswer = getPartialAnswer(left, right, levelDef.partialTarget);
      }

      if (levelDef.format === 'decomposed') {
        problem.decomposed = getDecomposed(left, right);
      }

      problems.push(problem);
      prev = operands;
    }

    return problems;
  }
}
