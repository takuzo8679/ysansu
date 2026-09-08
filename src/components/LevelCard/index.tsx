'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { DrillRecord, LevelDefinition } from '@/types';
import { formatTimeLabel } from '@/lib/formatTime';

interface LevelCardProps {
  levelDef: LevelDefinition;
  bestRecord?: DrillRecord | null;
  onClick: () => void;
}

function JudgmentBadge({ judgment }: { judgment: 'excellent' | 'pass' | 'fail' }) {
  const config = {
    excellent: { label: '◎', bg: '#FFD700', color: '#92400E', border: '#F59E0B' },
    pass: { label: '○', bg: '#86EFAC', color: '#166534', border: '#4ADE80' },
    fail: { label: '−', bg: 'gray.100', color: 'gray.500', border: 'gray.200' },
  }[judgment];

  return (
    <Flex
      w="28px"
      h="28px"
      borderRadius="full"
      bg={config.bg}
      color={config.color}
      borderWidth="2px"
      borderColor={config.border}
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      fontSize="sm"
      boxShadow={judgment !== 'fail' ? 'sm' : 'none'}
    >
      {config.label}
    </Flex>
  );
}

export default function LevelCard({ levelDef, bestRecord, onClick }: LevelCardProps) {
  return (
    <Box
      as="button"
      onClick={onClick}
      bg="white"
      borderRadius="xl"
      boxShadow="md"
      p={4}
      textAlign="left"
      width="100%"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ transform: 'scale(1.03)', boxShadow: 'lg' }}
      _active={{ transform: 'scale(0.98)' }}
      borderWidth="1px"
      borderColor="gray.100"
    >
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <Flex
          w="36px"
          h="36px"
          borderRadius="lg"
          bg="red.500"
          color="white"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          fontSize="lg"
        >
          {levelDef.level}
        </Flex>
        {bestRecord && <JudgmentBadge judgment={bestRecord.judgment} />}
      </Flex>

      <Flex gap={3} mt={2} fontSize="xs" color="gray.500">
        <Text>
          ○ {formatTimeLabel(levelDef.timeLimit.pass)}
        </Text>
        <Text>
          ◎ {formatTimeLabel(levelDef.timeLimit.excellent)}
        </Text>
      </Flex>

      <Text fontSize="xs" color="gray.400" mt={1}>
        {levelDef.questionCount}問
      </Text>
    </Box>
  );
}
