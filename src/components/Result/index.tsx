'use client';

import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { DrillResult, LevelDefinition } from '@/types';
import { formatTime } from '@/lib/formatTime';

const MotionFlex = motion.create(Flex);

interface ResultProps {
  result: DrillResult;
  levelDef: LevelDefinition;
}

function JudgmentDisplay({ judgment }: { judgment: DrillResult['judgment'] }) {
  const config = {
    excellent: {
      label: '◎ ごうかく！',
      bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      color: 'yellow.900',
      emoji: '🌟',
    },
    pass: {
      label: '○ ごうかく',
      bg: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
      color: 'gray.800',
      emoji: '👍',
    },
    fail: {
      label: 'もういちど がんばろう',
      bg: 'gray.100',
      color: 'gray.600',
      emoji: '💪',
    },
  }[judgment];

  return (
    <MotionFlex
      direction="column"
      alignItems="center"
      justifyContent="center"
      bgGradient={config.bg}
      borderRadius="2xl"
      p={6}
      w="100%"
      gap={2}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Text fontSize="4xl">{config.emoji}</Text>
      <Text fontSize="2xl" fontWeight="bold" color={config.color}>
        {config.label}
      </Text>
    </MotionFlex>
  );
}

export default function Result({ result, levelDef }: ResultProps) {
  return (
    <VStack gap={5} w="100%" maxW="400px" mx="auto">
      <JudgmentDisplay judgment={result.judgment} />

      <Flex
        bg="white"
        borderRadius="xl"
        boxShadow="md"
        p={4}
        w="100%"
        justifyContent="space-around"
        borderWidth="1px"
        borderColor="gray.100"
      >
        <VStack gap={1}>
          <Text fontSize="xs" color="gray.500">
            タイム
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            {formatTime(result.totalTime)}
          </Text>
        </VStack>
        <Box w="1px" bg="gray.200" />
        <VStack gap={1}>
          <Text fontSize="xs" color="gray.500">
            せいかい
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            {result.correctCount}/{result.totalCount}
          </Text>
        </VStack>
      </Flex>

      {result.allCorrect ? (
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="md"
          p={6}
          w="100%"
          textAlign="center"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Text fontSize="2xl" mb={1}>🎉</Text>
          <Text fontWeight="bold" color="green.600">
            ぜんもん せいかい！
          </Text>
        </Box>
      ) : (
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="md"
          p={4}
          w="100%"
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
            まちがえた もんだい
          </Text>
          <Box maxH="200px" overflowY="auto">
            <VStack gap={1} alignItems="stretch">
              {result.answers
                .filter((a) => !a.correct)
                .map((answer, i) => (
                  <Flex
                    key={i}
                    justifyContent="space-between"
                    alignItems="center"
                    px={3}
                    py={2}
                    borderRadius="md"
                    bg="orange.50"
                  >
                    <Text fontSize="sm" color="gray.700">
                      {answer.problem.operands[0]} + {answer.problem.operands[1]}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      こたえ: <Text as="span" fontWeight="bold" color="orange.600">{answer.problem.correctAnswer}</Text>
                    </Text>
                  </Flex>
                ))}
            </VStack>
          </Box>
        </Box>
      )}

      <Flex fontSize="xs" color="gray.400" justifyContent="center" gap={3}>
        <Text>○タイム: {formatTime(levelDef.timeLimit.pass)}</Text>
        <Text>◎タイム: {formatTime(levelDef.timeLimit.excellent)}</Text>
      </Flex>
    </VStack>
  );
}
