'use client';

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { createElement } from 'react';
import type { Answer, DrillResult, LevelDefinition, Problem } from '@/types';
import { createDrillResult } from '@/lib/judge';

export type DrillPhase = 'countdown' | 'running' | 'finished';

export interface DrillState {
  levelDef: LevelDefinition;
  problems: Problem[];
  phase: DrillPhase;
  currentIndex: number;
  startTime: number | null;
  elapsedTime: number;
  answers: Answer[];
}

type DrillAction =
  | { type: 'START' }
  | { type: 'SUBMIT_ANSWER'; userAnswer: number | number[] }
  | { type: 'TICK' }
  | { type: 'FINISH' };

function checkCorrect(problem: Problem, userAnswer: number | number[]): boolean {
  if (problem.format === 'decomposed' && Array.isArray(userAnswer) && problem.decomposed) {
    const [upper, lower, total] = userAnswer;
    return (
      upper === problem.decomposed.upperDigits &&
      lower === problem.decomposed.lowerDigits &&
      total === problem.correctAnswer
    );
  }
  if (problem.format === 'partial') {
    return userAnswer === problem.partialAnswer;
  }
  return userAnswer === problem.correctAnswer;
}

function drillReducer(state: DrillState, action: DrillAction): DrillState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        phase: 'running',
        startTime: Date.now(),
      };

    case 'SUBMIT_ANSWER': {
      const problem = state.problems[state.currentIndex];
      const correct = checkCorrect(problem, action.userAnswer);
      const now = Date.now();
      const answerTime = state.startTime ? (now - state.startTime) / 1000 : 0;

      const answer: Answer = {
        problem,
        userAnswer: action.userAnswer,
        correct,
        answerTime,
      };

      const newAnswers = [...state.answers, answer];
      const nextIndex = state.currentIndex + 1;
      const isLast = nextIndex >= state.problems.length;

      return {
        ...state,
        answers: newAnswers,
        currentIndex: isLast ? state.currentIndex : nextIndex,
        phase: isLast ? 'finished' : state.phase,
        elapsedTime: state.startTime ? (now - state.startTime) / 1000 : state.elapsedTime,
      };
    }

    case 'TICK': {
      if (state.phase !== 'running' || !state.startTime) return state;
      return {
        ...state,
        elapsedTime: (Date.now() - state.startTime) / 1000,
      };
    }

    case 'FINISH':
      return {
        ...state,
        phase: 'finished',
        elapsedTime: state.startTime ? (Date.now() - state.startTime) / 1000 : state.elapsedTime,
      };

    default:
      return state;
  }
}

interface DrillContextValue {
  state: DrillState;
  dispatch: Dispatch<DrillAction>;
  result: DrillResult | null;
}

const DrillContext = createContext<DrillContextValue | null>(null);

export function DrillProvider({
  levelDef,
  problems,
  children,
}: {
  levelDef: LevelDefinition;
  problems: Problem[];
  children: ReactNode;
}) {
  const initialState: DrillState = {
    levelDef,
    problems,
    phase: 'countdown',
    currentIndex: 0,
    startTime: null,
    elapsedTime: 0,
    answers: [],
  };

  const [state, dispatch] = useReducer(drillReducer, initialState);

  const result =
    state.phase === 'finished'
      ? createDrillResult(state.answers, state.elapsedTime, state.levelDef)
      : null;

  return createElement(DrillContext.Provider, { value: { state, dispatch, result } }, children);
}

export function useDrill(): DrillContextValue {
  const ctx = useContext(DrillContext);
  if (!ctx) {
    throw new Error('useDrill must be used within a DrillProvider');
  }
  return ctx;
}
