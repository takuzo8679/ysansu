'use client';

import { Text } from '@chakra-ui/react';
import { formatTime } from '@/lib/formatTime';

interface TimerProps {
  elapsedTime: number;
  passTime: number;
}

export function Timer({ elapsedTime, passTime }: TimerProps) {
  const over = elapsedTime > passTime;

  return (
    <Text
      fontSize="2xl"
      fontWeight="bold"
      fontFamily="mono"
      color={over ? 'red.500' : 'gray.700'}
    >
      {formatTime(elapsedTime)}
    </Text>
  );
}
