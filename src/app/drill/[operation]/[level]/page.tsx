'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { isOperationType } from '@/types';
import type { OperationType } from '@/types';
import { getLevel } from '@/constants/levels';
import { getGenerator } from '@/lib/generator';
import { DrillProvider, useDrill } from '@/hooks/useDrill';
import { ProblemDisplay } from '@/components/Problem';
import { Numpad } from '@/components/Numpad';
import { ProgressBar } from '@/components/ProgressBar';
import { CountdownOverlay } from '@/components/CountdownOverlay';
import { useHistory } from '@/hooks/useStorage';
import { useDrillResult } from '@/hooks/useDrillResult';
import { useUser } from '@/hooks/useUser';

function DrillRunner() {
  const router = useRouter();
  const { state, dispatch, result } = useDrill();
  const { phase, problems, currentIndex, elapsedTime, levelDef, answers } = state;
  const { activeUser } = useUser();
  const userId = activeUser?.id ?? 'default-user';
  const { addRecord } = useHistory(userId);
  const { setResult } = useDrillResult();

  // 回答入力
  const [value, setValue] = useState('');
  // 分解回答用: 3ステップの値
  const [decomposedValues, setDecomposedValues] = useState<string[]>(['', '', '']);
  const [activeStep, setActiveStep] = useState(0);

  const currentProblem = problems[currentIndex] ?? null;
  const isDecomposed = currentProblem?.format === 'decomposed';

  // Escape キーで入力クリア
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDecomposed) {
          setDecomposedValues((prev) => {
            const next = [...prev];
            next[activeStep] = '';
            return next;
          });
        } else {
          setValue('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDecomposed, activeStep]);

  // タイマー
  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [phase, dispatch]);

  // フェードアウト状態
  const [fadingOut, setFadingOut] = useState(false);

  // 結果画面遷移 + 履歴保存
  useEffect(() => {
    if (phase === 'finished' && result && !fadingOut) {
      addRecord({
        operation: result.operation,
        level: result.level,
        timestamp: result.timestamp,
        totalTime: result.totalTime,
        allCorrect: result.allCorrect,
        correctCount: result.correctCount,
        totalCount: result.totalCount,
        judgment: result.judgment,
      });
      setResult(result);
      // フェードアウト → 遷移
      setFadingOut(true);
      setTimeout(() => router.push('/result'), 600);
    }
  }, [phase, result, router, addRecord, setResult, fadingOut]);

  const handleCountdownComplete = useCallback(() => {
    dispatch({ type: 'START' });
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    if (!currentProblem) return;

    if (isDecomposed) {
      const currentVal = decomposedValues[activeStep];
      if (currentVal === '') return;

      if (activeStep < 2) {
        setActiveStep(activeStep + 1);
        return;
      }

      const nums = decomposedValues.map(Number);
      dispatch({ type: 'SUBMIT_ANSWER', userAnswer: nums });
      setDecomposedValues(['', '', '']);
      setActiveStep(0);
    } else {
      if (value === '') return;
      const num = Number(value);
      dispatch({ type: 'SUBMIT_ANSWER', userAnswer: num });
      setValue('');
    }
  }, [currentProblem, isDecomposed, decomposedValues, activeStep, value, dispatch]);

  const handleChange = useCallback(
    (v: string) => {
      if (isDecomposed) {
        const next = [...decomposedValues];
        next[activeStep] = v;
        setDecomposedValues(next);
      } else {
        setValue(v);
      }
    },
    [isDecomposed, decomposedValues, activeStep],
  );

  if (phase === 'countdown') {
    return <CountdownOverlay onComplete={handleCountdownComplete} />;
  }

  if (!currentProblem) {
    return null;
  }

  const displayValue = isDecomposed ? (decomposedValues[activeStep] ?? '') : value;

  const MotionBox = motion.create(Box);

  return (
    <MotionBox
      minH="100vh"
      bg="white"
      py={4}
      px={3}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <VStack gap={4} maxW="400px" mx="auto">
        {/* ヘッダー */}
        <Box w="100%" display="flex" justifyContent="flex-end" alignItems="center">
          <Text fontSize="sm" color="gray.500">
            Lv.{levelDef.level}
          </Text>
        </Box>

        <ProgressBar current={answers.length + 1} total={problems.length} />

        {/* 問題説明文 */}
        <Text fontSize="xs" color="gray.500" textAlign="center" px={2}>
          {levelDef.description}
        </Text>

        {/* 問題表示 */}
        <Box py={4}>
          <ProblemDisplay
            problem={currentProblem}
            value={displayValue}
            values={isDecomposed ? decomposedValues : undefined}
            activeStep={isDecomposed ? activeStep : undefined}
          />
        </Box>

        {/* テンキー */}
        <Numpad value={displayValue} onChange={handleChange} onSubmit={handleSubmit} />
      </VStack>
    </MotionBox>
  );
}

export default function DrillPage() {
  const params = useParams<{ operation: string; level: string }>();
  const router = useRouter();

  if (!isOperationType(params.operation)) {
    notFound();
  }
  const operation = params.operation;
  const levelNum = Number(params.level);

  const levelDef = useMemo(() => getLevel(operation, levelNum), [operation, levelNum]);
  const problems = useMemo(() => {
    if (!levelDef) return [];
    const gen = getGenerator(operation);
    return gen.generate(levelDef);
  }, [levelDef, operation]);

  if (!levelDef) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={3}>
          <Text fontSize="xl" color="red.500">
            レベルが見つかりません
          </Text>
          <Text
            as="button"
            color="blue.500"
            textDecoration="underline"
            onClick={() => router.push('/')}
          >
            ホームへ戻る
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <DrillProvider levelDef={levelDef} problems={problems}>
      <DrillRunner />
    </DrillProvider>
  );
}
