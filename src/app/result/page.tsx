'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import type { DrillRecord, DrillResult } from '@/types';
import { getLevel } from '@/constants/levels';
import ResultComponent from '@/components/Result';
import { useSound } from '@/hooks/useSound';
import { useUser } from '@/hooks/useUser';
import { getHistory } from '@/lib/storage';

function loadResult(): DrillResult | null {
  try {
    const raw = sessionStorage.getItem('drillResult');
    if (raw) return JSON.parse(raw) as DrillResult;
  } catch { /* ignore */ }
  return null;
}

export default function ResultPage() {
  const [result, setResult] = useState<DrillResult | null>(null);
  const [prevRecord, setPrevRecord] = useState<DrillRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const { play } = useSound();
  const { activeUser } = useUser();

  useEffect(() => {
    const r = loadResult();
    setResult(r);
    setLoaded(true);
    if (r) {
      play(r.judgment);
      // 前回記録を取得（今回分を除く直近）
      const userId = activeUser?.id ?? 'default-user';
      const history = getHistory(userId);
      const prev = history
        .filter((h) => h.operation === r.operation && h.level === r.level && h.id !== r.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      // 最新が今回の記録（直前に保存済み）なので2番目を取得
      setPrevRecord(prev.length > 1 ? prev[1] : prev[0] ?? null);
    }
  }, [play, activeUser]);

  // ロード完了後に結果がなければリダイレクト
  useEffect(() => {
    if (loaded && !result) {
      router.replace('/');
    }
  }, [loaded, result, router]);

  const clearResult = () => {
    try { sessionStorage.removeItem('drillResult'); } catch { /* ignore */ }
  };

  if (!loaded || !result) return null;

  const levelDef = getLevel(result.operation, result.level);
  if (!levelDef) return null;

  return (
    <Box minH="100vh" bg="gray.50" py={6} px={4}>
      <VStack gap={6} maxW="480px" mx="auto">
        <ResultComponent result={result} levelDef={levelDef} prevRecord={prevRecord} />

        <Flex gap={3} w="100%">
          <Link
            href={`/drill/${result.operation}/${result.level}`}
            style={{ flex: 1, textDecoration: 'none' }}
            onClick={clearResult}
          >
            <Box
              bg="red.500"
              color="white"
              borderRadius="xl"
              py={3}
              textAlign="center"
              fontWeight="bold"
              cursor="pointer"
              _hover={{ bg: 'red.600' }}
              transition="all 0.2s"
            >
              もういちど
            </Box>
          </Link>

          <Link
            href={`/drill/${result.operation}`}
            style={{ flex: 1, textDecoration: 'none' }}
            onClick={clearResult}
          >
            <Box
              bg="white"
              color="gray.700"
              borderRadius="xl"
              py={3}
              textAlign="center"
              fontWeight="bold"
              cursor="pointer"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{ bg: 'gray.50' }}
              transition="all 0.2s"
            >
              レベルせんたく
            </Box>
          </Link>
        </Flex>

        <Link href="/history" style={{ textDecoration: 'none', width: '100%' }} onClick={clearResult}>
          <Box
            bg="white"
            color="gray.500"
            borderRadius="xl"
            py={2}
            textAlign="center"
            fontSize="sm"
            cursor="pointer"
            borderWidth="1px"
            borderColor="gray.200"
            _hover={{ bg: 'gray.50' }}
            transition="all 0.2s"
          >
            📋 がくしゅうの きろく
          </Box>
        </Link>
      </VStack>
    </Box>
  );
}
