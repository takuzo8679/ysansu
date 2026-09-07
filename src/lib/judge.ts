import { Answer, DrillRecord, DrillResult, Judgment, LevelDefinition, OperationType } from '@/types';

export function judge(
  answers: Answer[],
  totalTime: number,
  levelDef: LevelDefinition,
): Judgment {
  const allCorrect = answers.every((a) => a.correct);
  if (!allCorrect) return 'fail';
  if (totalTime <= levelDef.timeLimit.excellent) return 'excellent';
  if (totalTime <= levelDef.timeLimit.pass) return 'pass';
  return 'fail';
}

export function createDrillResult(
  answers: Answer[],
  totalTime: number,
  levelDef: LevelDefinition,
): DrillResult {
  const allCorrect = answers.every((a) => a.correct);
  const correctCount = answers.filter((a) => a.correct).length;

  return {
    level: levelDef.level,
    operation: levelDef.operation,
    answers,
    totalTime,
    allCorrect,
    correctCount,
    totalCount: answers.length,
    judgment: judge(answers, totalTime, levelDef),
    timestamp: new Date().toISOString(),
  };
}

const JUDGMENT_RANK: Record<Judgment, number> = {
  excellent: 0,
  pass: 1,
  fail: 2,
};

export function getBestRecord(
  records: DrillRecord[],
  operation: OperationType,
  level: number,
): DrillRecord | null {
  return (
    records
      .filter((r) => r.operation === operation && r.level === level)
      .sort((a, b) => {
        if (JUDGMENT_RANK[a.judgment] !== JUDGMENT_RANK[b.judgment]) {
          return JUDGMENT_RANK[a.judgment] - JUDGMENT_RANK[b.judgment];
        }
        return a.totalTime - b.totalTime;
      })[0] ?? null
  );
}
