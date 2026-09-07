'use client';

import Link from 'next/link';
import { Box, Flex, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import UserSelect from '@/components/UserSelect';

const OPERATIONS = [
  { key: 'addition', label: 'たし算', icon: '＋', enabled: true, href: '/drill/addition' },
  { key: 'subtraction', label: 'ひき算', icon: '−', enabled: false, href: '#' },
  { key: 'multiplication', label: 'かけ算', icon: '×', enabled: false, href: '#' },
  { key: 'division', label: 'わり算', icon: '÷', enabled: false, href: '#' },
] as const;

function OperationCard({
  label,
  icon,
  enabled,
  href,
}: {
  label: string;
  icon: string;
  enabled: boolean;
  href: string;
}) {
  const content = (
    <Box
      bg={enabled ? 'white' : 'gray.50'}
      borderRadius="2xl"
      boxShadow={enabled ? 'md' : 'sm'}
      p={6}
      textAlign="center"
      cursor={enabled ? 'pointer' : 'default'}
      opacity={enabled ? 1 : 0.5}
      transition="all 0.2s"
      _hover={enabled ? { transform: 'scale(1.05)', boxShadow: 'lg' } : {}}
      _active={enabled ? { transform: 'scale(0.97)' } : {}}
      borderWidth="1px"
      borderColor={enabled ? 'gray.100' : 'gray.200'}
      position="relative"
    >
      <Flex
        w="64px"
        h="64px"
        borderRadius="xl"
        bg={enabled ? 'red.500' : 'gray.300'}
        color="white"
        alignItems="center"
        justifyContent="center"
        fontSize="2xl"
        fontWeight="bold"
        mx="auto"
        mb={3}
      >
        {icon}
      </Flex>
      <Text fontWeight="bold" fontSize="lg" color={enabled ? 'gray.800' : 'gray.400'}>
        {label}
      </Text>
      {!enabled && (
        <Text fontSize="xs" color="gray.400" mt={1}>
          Coming Soon
        </Text>
      )}
    </Box>
  );

  if (!enabled) return content;

  return (
    <Link href={href} style={{ textDecoration: 'none' }} aria-label={`${label}を選ぶ`}>
      {content}
    </Link>
  );
}

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <VStack gap={8} maxW="480px" mx="auto">
        <VStack gap={2}>
          <Heading
            size="3xl"
            color="red.500"
            fontWeight="extrabold"
            letterSpacing="tight"
          >
            🔢 ワイさんすう
          </Heading>
          <Text color="gray.500" fontSize="sm">
            えらんで れんしゅう しよう！
          </Text>
        </VStack>

        <UserSelect />

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} w="100%">
          {OPERATIONS.map((op) => (
            <OperationCard
              key={op.key}
              label={op.label}
              icon={op.icon}
              enabled={op.enabled}
              href={op.href}
            />
          ))}
        </SimpleGrid>

        <Link href="/history" style={{ textDecoration: 'none', width: '100%' }}>
          <Box
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            p={4}
            textAlign="center"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ transform: 'scale(1.02)', boxShadow: 'md' }}
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Text fontWeight="bold" color="gray.600">
              📋 がくしゅうの きろく
            </Text>
          </Box>
        </Link>
      </VStack>
    </Box>
  );
}
