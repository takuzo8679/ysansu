'use client';

import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import type { Problem } from '@/types';

interface PartialProblemProps {
  problem: Problem;
  value: string;
}

function Example({ target }: { target: 'ones' | 'tens' }) {
  if (target === 'ones') {
    // 1の位だけたす: 67+28 → 7+8=15
    return (
      <Box bg="gray.50" borderRadius="lg" px={4} py={2}>
        <Flex fontSize="xs" color="gray.500" justify="center" align="center" gap={1} wrap="wrap">
          <Text>（れい）67 + 28 ⇒</Text>
          <Text fontWeight="bold" color="blue.600">15</Text>
          <Text color="gray.400">… 7+8=15</Text>
        </Flex>
      </Box>
    );
  }
  // 10の位だけたす: 67+28 → 6+2=8
  return (
    <Box bg="gray.50" borderRadius="lg" px={4} py={2}>
      <Flex fontSize="xs" color="gray.500" justify="center" align="center" gap={1} wrap="wrap">
        <Text>（れい）67 + 28 ⇒</Text>
        <Text fontWeight="bold" color="blue.600">8</Text>
        <Text color="gray.400">… 6+2=8</Text>
      </Flex>
    </Box>
  );
}

export function PartialProblem({ problem, value }: PartialProblemProps) {
  const [left, right] = problem.operands;
  const target = problem.partialTarget ?? 'ones';

  return (
    <VStack gap={3}>
      <Example target={target} />
      <Flex align="center" justify="center" gap={3} wrap="wrap">
        <Text fontSize="4xl" fontWeight="bold">
          {left}
        </Text>
        <Text fontSize="4xl" fontWeight="bold">
          +
        </Text>
        <Text fontSize="4xl" fontWeight="bold">
          {right}
        </Text>
        <Text fontSize="4xl" fontWeight="bold">
          ⇒
        </Text>
        <Box
          minW="80px"
          minH="56px"
          borderBottom="3px solid"
          borderColor="blue.400"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={2}
          aria-label="こたえ"
        >
          <Text fontSize="4xl" fontWeight="bold" color="blue.600">
            {value || ' '}
          </Text>
        </Box>
      </Flex>
    </VStack>
  );
}
