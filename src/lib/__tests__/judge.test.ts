import { judge, getBestRecord } from '../judge';
import { Answer, DrillRecord, LevelDefinition } from '@/types';

const mockLevel: LevelDefinition = {
  level: 1,
  operation: 'addition',
  format: 'direct',
  questionCount: 40,
  timeLimit: { pass: 50, excellent: 35 },
  operands: { left: { min: 0, max: 9 }, right: { min: 0, max: 9 } },
  description: 'test',
};

function makeAnswer(correct: boolean): Answer {
  return {
    problem: {
      id: 1,
      operands: [3, 4],
      operator: 'addition',
      correctAnswer: 7,
      format: 'direct',
    },
    userAnswer: correct ? 7 : 8,
    correct,
    answerTime: 1,
  };
}

describe('judge', () => {
  it('全問正解 + ◎タイム以内 → excellent', () => {
    const answers = Array(40).fill(null).map(() => makeAnswer(true));
    expect(judge(answers, 30, mockLevel)).toBe('excellent');
  });

  it('全問正解 + ◎タイム丁度 → excellent', () => {
    const answers = Array(40).fill(null).map(() => makeAnswer(true));
    expect(judge(answers, 35, mockLevel)).toBe('excellent');
  });

  it('全問正解 + ○タイム以内 → pass', () => {
    const answers = Array(40).fill(null).map(() => makeAnswer(true));
    expect(judge(answers, 45, mockLevel)).toBe('pass');
  });

  it('全問正解 + ○タイム丁度 → pass', () => {
    const answers = Array(40).fill(null).map(() => makeAnswer(true));
    expect(judge(answers, 50, mockLevel)).toBe('pass');
  });

  it('全問正解 + タイムオーバー → fail', () => {
    const answers = Array(40).fill(null).map(() => makeAnswer(true));
    expect(judge(answers, 51, mockLevel)).toBe('fail');
  });

  it('1問不正解 → fail', () => {
    const answers = Array(39).fill(null).map(() => makeAnswer(true));
    answers.push(makeAnswer(false));
    expect(judge(answers, 30, mockLevel)).toBe('fail');
  });
});

describe('getBestRecord', () => {
  const records: DrillRecord[] = [
    { id: '1', operation: 'addition', level: 1, timestamp: '', totalTime: 45, allCorrect: true, correctCount: 40, totalCount: 40, judgment: 'pass' },
    { id: '2', operation: 'addition', level: 1, timestamp: '', totalTime: 30, allCorrect: true, correctCount: 40, totalCount: 40, judgment: 'excellent' },
    { id: '3', operation: 'addition', level: 1, timestamp: '', totalTime: 60, allCorrect: false, correctCount: 38, totalCount: 40, judgment: 'fail' },
    { id: '4', operation: 'addition', level: 2, timestamp: '', totalTime: 80, allCorrect: true, correctCount: 40, totalCount: 40, judgment: 'pass' },
  ];

  it('excellent が最優先', () => {
    const best = getBestRecord(records, 'addition', 1);
    expect(best?.judgment).toBe('excellent');
    expect(best?.totalTime).toBe(30);
  });

  it('該当なし → null', () => {
    expect(getBestRecord(records, 'subtraction', 1)).toBeNull();
  });

  it('レベル別フィルタ', () => {
    const best = getBestRecord(records, 'addition', 2);
    expect(best?.level).toBe(2);
  });
});
