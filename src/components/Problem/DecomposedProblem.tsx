'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { Problem } from '@/types';

interface DecomposedProblemProps {
  problem: Problem;
  values: string[];
  activeStep: number;
}

function AnswerBox({
  value,
  active,
  label,
}: {
  value: string;
  active: boolean;
  label: string;
}) {
  return (
    <Box
      minW="70px"
      minH="56px"
      borderBottom="3px solid"
      borderColor={active ? 'blue.400' : 'gray.300'}
      bg={active ? 'blue.50' : 'transparent'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      borderRadius="sm"
      aria-label={label}
    >
      <Text
        fontSize="4xl"
        fontWeight="bold"
        color={active ? 'blue.600' : 'gray.700'}
      >
        {value || ' '}
      </Text>
    </Box>
  );
}

function DecomposedExample({ left, right }: { left: number; right: number }) {
  // 例題を生成: オペランドの桁数に応じた例
  const isTwoDigit = left < 100 && right < 100;
  const isThreeTwo = left >= 100 && right < 100;

  let exLeft: number, exRight: number;
  if (isTwoDigit) {
    exLeft = 67;
    exRight = 22;
  } else if (isThreeTwo) {
    exLeft = 235;
    exRight = 81;
  } else {
    exLeft = 317;
    exRight = 524;
  }

  const upper = (exLeft - (exLeft % 10)) + (exRight - (exRight % 10));
  const lower = (exLeft % 10) + (exRight % 10);
  const total = upper + lower;

  return (
    <Box bg="gray.50" borderRadius="lg" px={3} py={2}>
      <Flex fontSize="xs" color="gray.500" justify="center" align="center" gap={1} wrap="wrap">
        <Text>（れい）{exLeft} + {exRight} =</Text>
        <Text fontWeight="bold" color="blue.600">{upper}</Text>
        <Text>+</Text>
        <Text fontWeight="bold" color="blue.600">{lower}</Text>
        <Text>=</Text>
        <Text fontWeight="bold" color="blue.600">{total}</Text>
      </Flex>
    </Box>
  );
}

export function DecomposedProblem({ problem, values, activeStep }: DecomposedProblemProps) {
  const [left, right] = problem.operands;

  return (
    <Flex direction="column" align="center" gap={3}>
      <DecomposedExample left={left} right={right} />
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
        <AnswerBox value={values[0] ?? ''} active={activeStep === 0} label="上のくらい" />
        <Text fontSize="4xl" fontWeight="bold">
          +
        </Text>
        <AnswerBox value={values[1] ?? ''} active={activeStep === 1} label="下のくらい" />
        <Text fontSize="4xl" fontWeight="bold">
          =
        </Text>
        <AnswerBox value={values[2] ?? ''} active={activeStep === 2} label="こたえ" />
      </Flex>
    </Flex>
  );
}
