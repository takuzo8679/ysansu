'use client';

import type { Problem } from '@/types';
import { DirectProblem } from './DirectProblem';
import { PartialProblem } from './PartialProblem';
import { DecomposedProblem } from './DecomposedProblem';

interface ProblemDisplayProps {
  problem: Problem;
  value: string;
  values?: string[];
  activeStep?: number;
}

export function ProblemDisplay({ problem, value, values, activeStep }: ProblemDisplayProps) {
  switch (problem.format) {
    case 'direct':
      return <DirectProblem problem={problem} value={value} />;
    case 'partial':
      return <PartialProblem problem={problem} value={value} />;
    case 'decomposed':
      return (
        <DecomposedProblem
          problem={problem}
          values={values ?? []}
          activeStep={activeStep ?? 0}
        />
      );
  }
}
