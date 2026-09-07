import { LevelDefinition, OperationType } from '@/types';
import { ADDITION_LEVELS } from './addition';

const LEVEL_MAP: Record<OperationType, LevelDefinition[]> = {
  addition: ADDITION_LEVELS,
  subtraction: [],
  multiplication: [],
  division: [],
};

export function getLevels(operation: OperationType): LevelDefinition[] {
  return LEVEL_MAP[operation];
}

export function getLevel(operation: OperationType, level: number): LevelDefinition | undefined {
  return LEVEL_MAP[operation].find((l) => l.level === level);
}

export { ADDITION_LEVELS };
