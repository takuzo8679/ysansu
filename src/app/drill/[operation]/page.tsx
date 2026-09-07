'use client';

import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Box, Flex, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { isOperationType } from '@/types';
import type { OperationType } from '@/types';
import { getLevels } from '@/constants/levels';
import LevelCard from '@/components/LevelCard';
import { getBestForLevel } from '@/lib/storage';
import { useHistory } from '@/hooks/useStorage';
import { useUser } from '@/hooks/useUser';

const OPERATION_LABELS: Record<OperationType, string> = {
  addition: 'たし算',
  subtraction: 'ひき算',
  multiplication: 'かけ算',
  division: 'わり算',
};

export default function LevelSelectPage() {
  const params = useParams<{ operation: string }>();
  const router = useRouter();

  if (!isOperationType(params.operation)) {
    notFound();
  }
  const operation = params.operation;

  const { activeUser } = useUser();
  const userId = activeUser?.id ?? 'default-user';

  const levels = getLevels(operation);
  const label = OPERATION_LABELS[operation] ?? operation;
  // 履歴をフックで保持（履歴が更新されると再描画される）
  const { records } = useHistory(userId);

  if (levels.length === 0) {
    return (
      <Box minH="100vh" bg="gray.50" py={10} px={4}>
        <VStack gap={4} maxW="480px" mx="auto">
          <Text color="gray.500">このカテゴリはまだ準備中です</Text>
          <Link href="/">
            <Text color="blue.500" fontSize="sm">
              ← ホームにもどる
            </Text>
          </Link>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={6} px={4}>
      <VStack gap={6} maxW="560px" mx="auto">
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
          <Heading size="xl" color="gray.800" fontWeight="bold">
            {label}
          </Heading>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 3 }} gap={3} w="100%">
          {levels.map((levelDef) => (
            <LevelCard
              key={levelDef.level}
              levelDef={levelDef}
              bestRecord={getBestForLevel(userId, operation, levelDef.level)}
              onClick={() => router.push(`/drill/${operation}/${levelDef.level}`)}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
