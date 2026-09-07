'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { Problem } from '@/types';

interface DirectProblemProps {
  problem: Problem;
  value: string;
}

export function DirectProblem({ problem, value }: DirectProblemProps) {
  const [left, right] = problem.operands;

  return (
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
        =
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
          {value || ' '}
        </Text>
      </Box>
    </Flex>
  );
}
