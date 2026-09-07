'use client';

import { Box, Text } from '@chakra-ui/react';
import { ProgressRoot, ProgressTrack, ProgressRange } from '@chakra-ui/react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Box w="100%">
      <Text fontSize="sm" fontWeight="bold" textAlign="center" mb={1}>
        {current} / {total}
      </Text>
      <ProgressRoot value={pct} size="sm" colorPalette="blue">
        <ProgressTrack>
          <ProgressRange />
        </ProgressTrack>
      </ProgressRoot>
    </Box>
  );
}
