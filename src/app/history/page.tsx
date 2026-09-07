'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { useUser } from '@/hooks/useUser';
import { useHistory } from '@/hooks/useStorage';
import { formatTime } from '@/lib/formatTime';
import { getLevels } from '@/constants/levels';
import type { DrillRecord, Judgment, OperationType } from '@/types';

// recharts を遅延ロード（履歴ページ初回アクセス時にのみ読み込み）
const TimeChart = dynamic(() => import('@/components/TimeChart'), { ssr: false });

const OPERATION_LABELS: Record<OperationType, string> = {
  addition: 'たし算',
  subtraction: 'ひき算',
  multiplication: 'かけ算',
  division: 'わり算',
};

function JudgmentBadge({ judgment }: { judgment: Judgment }) {
  const config = {
    excellent: { label: '◎', bg: 'yellow.400', color: 'yellow.900' },
    pass: { label: '○', bg: 'gray.300', color: 'gray.700' },
    fail: { label: '△', bg: 'orange.100', color: 'orange.600' },
  }[judgment];

  return (
    <Flex
      w="28px"
      h="28px"
      borderRadius="full"
      bg={config.bg}
      color={config.color}
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      fontSize="sm"
      flexShrink={0}
    >
      {config.label}
    </Flex>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${h}:${m}`;
}

function RecordRow({ record }: { record: DrillRecord }) {
  const opLabel = OPERATION_LABELS[record.operation] ?? record.operation;
  return (
    <Flex bg="white" borderRadius="lg" p={3} gap={3} alignItems="center" borderWidth="1px" borderColor="gray.100">
      <JudgmentBadge judgment={record.judgment} />
      <Box flex={1} minW={0}>
        <Flex gap={2} alignItems="baseline">
          <Text fontWeight="bold" fontSize="sm" color="gray.800">
            {opLabel} Lv.{record.level}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {record.correctCount}/{record.totalCount}
          </Text>
        </Flex>
        <Text fontSize="xs" color="gray.500" mt={0.5}>
          {formatDateTime(record.timestamp)}
        </Text>
      </Box>
      <Text fontWeight="bold" fontSize="sm" color="gray.700" flexShrink={0}>
        {formatTime(record.totalTime)}
      </Text>
    </Flex>
  );
}

export default function HistoryPage() {
  const { activeUser } = useUser();
  const userId = activeUser?.id ?? 'default-user';
  const { records } = useHistory(userId);

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const levels = getLevels('addition');

  const filtered = useMemo(() => {
    let r = records.filter((rec) => rec.operation === 'addition');
    if (selectedLevel !== null) {
      r = r.filter((rec) => rec.level === selectedLevel);
    }
    return r.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [records, selectedLevel]);

  const sorted = useMemo(() => [...filtered].reverse(), [filtered]);

  const levelDef = selectedLevel ? levels.find((l) => l.level === selectedLevel) : null;

  return (
    <Box minH="100vh" bg="gray.50" py={6} px={4}>
      <VStack gap={4} maxW="480px" mx="auto">
        <Flex w="100%" alignItems="center" gap={3}>
          <Link href="/">
            <Flex
              w="36px"
              h="36px"
              borderRadius="lg"
              bg="white"
              boxShadow="sm"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
            >
              <Text fontSize="lg">←</Text>
            </Flex>
          </Link>
          <Heading size="lg" color="gray.800" fontWeight="bold">
            📋 がくしゅうの きろく
          </Heading>
        </Flex>

        {activeUser && (
          <Text fontSize="sm" color="gray.500" w="100%">
            {activeUser.avatar} {activeUser.name}
          </Text>
        )}

        <Flex gap={1} w="100%" flexWrap="wrap">
          <Box
            as="button"
            onClick={() => setSelectedLevel(null)}
            px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold"
            bg={selectedLevel === null ? 'red.500' : 'white'}
            color={selectedLevel === null ? 'white' : 'gray.600'}
            borderWidth="1px"
            borderColor={selectedLevel === null ? 'red.500' : 'gray.200'}
            cursor="pointer"
          >
            ぜんぶ
          </Box>
          {levels.map((l) => (
            <Box
              as="button" key={l.level}
              onClick={() => setSelectedLevel(l.level)}
              px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold"
              bg={selectedLevel === l.level ? 'red.500' : 'white'}
              color={selectedLevel === l.level ? 'white' : 'gray.600'}
              borderWidth="1px"
              borderColor={selectedLevel === l.level ? 'red.500' : 'gray.200'}
              cursor="pointer"
            >
              Lv.{l.level}
            </Box>
          ))}
        </Flex>

        {filtered.length >= 2 && levelDef && (
          <TimeChart
            records={filtered}
            passTime={levelDef.timeLimit.pass}
            excellentTime={levelDef.timeLimit.excellent}
          />
        )}

        {sorted.length === 0 ? (
          <Box bg="white" borderRadius="xl" p={8} textAlign="center" w="100%" borderWidth="1px" borderColor="gray.100">
            <Text fontSize="3xl" mb={2}>📝</Text>
            <Text color="gray.500" fontSize="sm">まだ きろくが ありません</Text>
            <Text color="gray.400" fontSize="xs" mt={1}>ドリルを やってみよう！</Text>
          </Box>
        ) : (
          <VStack gap={2} w="100%">
            {sorted.map((record) => (
              <RecordRow key={record.id} record={record} />
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
