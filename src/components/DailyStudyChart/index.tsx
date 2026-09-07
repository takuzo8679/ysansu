'use client';

import { Box, Text } from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DrillRecord } from '@/types';

interface DailyData {
  date: string;
  label: string;
  minutes: number;
  count: number;
  isToday: boolean;
}

function toDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toLabel(dateKey: string): string {
  const [, m, d] = dateKey.split('-');
  return `${Number(m)}/${Number(d)}`;
}

function isToday(dateKey: string): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dateKey === today;
}

export default function DailyStudyChart({ records }: { records: DrillRecord[] }) {
  // 日別集計（直近14日分）
  const dailyMap = new Map<string, { totalSeconds: number; count: number }>();
  for (const r of records) {
    const key = toDateKey(r.timestamp);
    const entry = dailyMap.get(key) ?? { totalSeconds: 0, count: 0 };
    entry.totalSeconds += r.totalTime;
    entry.count += 1;
    dailyMap.set(key, entry);
  }

  // 直近14日の日付リスト（データがない日も含む）
  const days: DailyData[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const entry = dailyMap.get(key);
    days.push({
      date: key,
      label: toLabel(key),
      minutes: entry ? Math.round(entry.totalSeconds / 60 * 10) / 10 : 0,
      count: entry?.count ?? 0,
      isToday: isToday(key),
    });
  }

  const todayData = days.find((d) => d.isToday);
  const todayMinutes = todayData?.minutes ?? 0;
  const todayCount = todayData?.count ?? 0;

  return (
    <Box bg="white" borderRadius="xl" boxShadow="sm" p={4} w="100%" borderWidth="1px" borderColor="gray.100">
      <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={1}>
        📅 にちべつ がくしゅう じかん
      </Text>
      <Text fontSize="xs" color="gray.500" mb={3}>
        きょう: {todayMinutes > 0 ? `${todayMinutes}ふん（${todayCount}かい）` : 'まだ やってないよ'}
      </Text>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={days} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            fontSize={9}
            tick={{ fill: '#9CA3AF' }}
            interval={1}
          />
          <YAxis
            fontSize={9}
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(v) => `${v}m`}
          />
          <Tooltip
            formatter={(value) => [`${value}ふん`, 'がくしゅう']}
          />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
            {days.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday ? '#EF4444' : entry.minutes > 0 ? '#3B82F6' : '#E5E7EB'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
