'use client';

import { Box, Text } from '@chakra-ui/react';
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
import { formatTime } from '@/lib/formatTime';
import type { DrillRecord, Judgment } from '@/types';

interface ChartData {
  name: string;
  time: number;
  judgment: Judgment;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function TimeChart({
  records,
  passTime,
  excellentTime,
}: {
  records: DrillRecord[];
  passTime: number;
  excellentTime: number;
}) {
  const data: ChartData[] = records.map((r) => ({
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
          <Tooltip formatter={(value) => [`${formatTime(Number(value))}`, 'タイム']} />
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
