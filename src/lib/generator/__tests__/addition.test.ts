import { AdditionGenerator } from '../addition';
import { ADDITION_LEVELS } from '@/constants/levels/addition';

const generator = new AdditionGenerator();

describe('AdditionGenerator', () => {
  describe.each(ADDITION_LEVELS)('レベル$level', (levelDef) => {
    const problems = generator.generate(levelDef);

    it(`${levelDef.questionCount}問 生成`, () => {
      expect(problems).toHaveLength(levelDef.questionCount);
    });

    it('オペランド値域内', () => {
      for (const p of problems) {
        const [left, right] = p.operands;
        expect(left).toBeGreaterThanOrEqual(levelDef.operands.left.min);
        expect(left).toBeLessThanOrEqual(levelDef.operands.left.max);
        expect(right).toBeGreaterThanOrEqual(levelDef.operands.right.min);
        expect(right).toBeLessThanOrEqual(levelDef.operands.right.max);
      }
    });

    it('correctAnswer = left + right', () => {
      for (const p of problems) {
        expect(p.correctAnswer).toBe(p.operands[0] + p.operands[1]);
      }
    });

    it('両方0の問題なし', () => {
      for (const p of problems) {
        expect(p.operands[0] === 0 && p.operands[1] === 0).toBe(false);
      }
    });

    it('直前と同一問題なし', () => {
      for (let i = 1; i < problems.length; i++) {
        const prev = problems[i - 1];
        const curr = problems[i];
        const same = prev.operands[0] === curr.operands[0] && prev.operands[1] === curr.operands[1];
        expect(same).toBe(false);
      }
    });

    if (levelDef.format === 'partial') {
      it(`部分回答 (${levelDef.partialTarget}) 正しい`, () => {
        for (const p of problems) {
          expect(p.partialTarget).toBe(levelDef.partialTarget);
          const sum = p.correctAnswer;
          const [left, right] = p.operands;
          if (levelDef.partialTarget === 'ones') {
            // 1の位だけたす: 67+28 → 7+8=15
            expect(p.partialAnswer).toBe((left % 10) + (right % 10));
          } else {
            // 10の位だけたす: 67+28 → 60+20=80
            const leftTens = Math.floor(left / 10) * 10 - Math.floor(left / 100) * 100;
            const rightTens = Math.floor(right / 10) * 10 - Math.floor(right / 100) * 100;
            expect(p.partialAnswer).toBe(leftTens + rightTens);
          }
        }
      });
    }

    if (levelDef.format === 'decomposed') {
      it('分解回答: upperDigits + lowerDigits = correctAnswer', () => {
        for (const p of problems) {
          expect(p.decomposed).toBeDefined();
          expect(p.decomposed!.upperDigits + p.decomposed!.lowerDigits).toBe(p.correctAnswer);
        }
      });

      it('分解回答: lowerDigits = 1の位同士の和', () => {
        for (const p of problems) {
          const [left, right] = p.operands;
          expect(p.decomposed!.lowerDigits).toBe((left % 10) + (right % 10));
        }
      });
    }
  });
});
