import { OperationType } from '@/types';
import { ProblemGenerator } from './types';
import { AdditionGenerator } from './addition';

const generators: Partial<Record<OperationType, ProblemGenerator>> = {
  addition: new AdditionGenerator(),
};

export function getGenerator(operation: OperationType): ProblemGenerator {
  const gen = generators[operation];
  if (!gen) {
    throw new Error(`Generator not implemented for operation: ${operation}`);
  }
  return gen;
}

export type { ProblemGenerator };
