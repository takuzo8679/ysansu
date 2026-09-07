'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createElement } from 'react';
import type { DrillResult } from '@/types';

interface DrillResultContextValue {
  result: DrillResult | null;
  setResult: (result: DrillResult) => void;
  clearResult: () => void;
}

const DrillResultContext = createContext<DrillResultContextValue | null>(null);

function loadFromSessionStorage(): DrillResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('drillResult');
    if (raw) return JSON.parse(raw) as DrillResult;
  } catch { /* ignore */ }
  return null;
}

export function DrillResultProvider({ children }: { children: ReactNode }) {
  const [result, setResultState] = useState<DrillResult | null>(() => loadFromSessionStorage());

  const setResult = useCallback((r: DrillResult) => {
    setResultState(r);
    try { sessionStorage.setItem('drillResult', JSON.stringify(r)); } catch { /* ignore */ }
  }, []);

  const clearResult = useCallback(() => {
    setResultState(null);
    try { sessionStorage.removeItem('drillResult'); } catch { /* ignore */ }
  }, []);

  return createElement(
    DrillResultContext.Provider,
    { value: { result, setResult, clearResult } },
    children,
  );
}

export function useDrillResult(): DrillResultContextValue {
  const ctx = useContext(DrillResultContext);
  if (!ctx) {
    throw new Error('useDrillResult must be used within a DrillResultProvider');
  }
  return ctx;
}
