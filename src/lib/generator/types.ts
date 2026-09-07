import { LevelDefinition, Problem } from '@/types';

export interface ProblemGenerator {
  generate(levelDef: LevelDefinition): Problem[];
}
