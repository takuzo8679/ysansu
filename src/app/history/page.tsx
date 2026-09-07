'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useUser } from '@/hooks/useUser';
import { useHistory } from '@/hooks/useStorage';
import { formatTime } from '@/lib/formatTime';
import { getLevels } from '@/constants/levels';
import type { DrillRecord, Judgment, OperationType } from '@/types';

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${h}:${m}`;
}

interface ChartData {
  name: string;
  time: number;
  judgment: Judgment;
}

function TimeChart({
  records,
  passTime,
  excellentTime,
}: {
  records: DrillRecord[];
  passTime: number;
  excellentTime: number;
}) {
  const data: ChartData[] = records.map((r, i) => ({
    name: formatDate(r.timestamp),
    time: Math.round(r.totalTime),
    judgment: r.judgment,
  }));

  const dotColor = (judgment: Judgment) => {
    if (judgment === 'excellent') return '#EAB308';
    if (judgment === 'pass') return '#9CA3AF';
    return '#F97316';
  };

  return (
    <Box bg="white" borderRadius="xl" boxShadow="sm" p={4} w="100%" borderWidth="1px" borderColor="gray.100">
      <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
        ⏱ タイムのすいい
      </Text>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" fontSize={10} tick={{ fill: '#9CA3AF' }} />
          <YAxis fontSize={10} tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `${v}s`} />
          <Tooltip
            formatter={(value) => [`${formatTime(Number(value))}`, 'タイム']}
          />
          <ReferenceLine
            y={passTime}
            stroke="#3B82F6"
            strokeDasharray="4 4"
            label={{ value: '○', position: 'right', fontSize: 12, fill: '#3B82F6' }}
          />
          <ReferenceLine
            y={excellentTime}
            stroke="#EAB308"
            strokeDasharray="4 4"
            label={{ value: '◎', position: 'right', fontSize: 12, fill: '#EAB308' }}
          />
          <Line
            type="monotone"
            dataKey="time"
            stroke="#EF4444"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, index } = props as { cx?: number; cy?: number; index?: number };
              if (cx == null || cy == null || index == null) return <></>;
              const j = data[index]?.judgment ?? 'fail';
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={dotColor(j)}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
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

  // レベルでフィルタ（デフォルト: 全レベル）
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const levels = getLevels('addition');

  const filtered = useMemo(() => {
    let r = records.filter((rec) => rec.operation === 'addition');
    if (selectedLevel !== null) {
      r = r.filter((rec) => rec.level === selectedLevel);
    }
    return r.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [records, selectedLevel]);

  const sorted = useMemo(
    () => [...filtered].reverse(),
    [filtered],
  );

  // グラフ用のタイム基準
  const levelDef = selectedLevel
    ? levels.find((l) => l.level === selectedLevel)
    : null;

  return (
    <Box minH="100vh" bg="gray.50" py={6} px={4}>
      <VStack gap={4} maxW="480px" mx="auto">
        {/* ヘッダー */}
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

        {/* レベルフィルタ */}
        <Flex gap={1} w="100%" flexWrap="wrap">
          <Box
            as="button"
            onClick={() => setSelectedLevel(null)}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
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
              as="button"
              key={l.level}
              onClick={() => setSelectedLevel(l.level)}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
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

        {/* グラフ */}
        {filtered.length >= 2 && levelDef && (
          <TimeChart
            records={filtered}
            passTime={levelDef.timeLimit.pass}
            excellentTime={levelDef.timeLimit.excellent}
          />
        )}

        {/* 履歴リスト */}
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
