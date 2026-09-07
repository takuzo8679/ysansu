'use client';

import { useState } from 'react';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { useUser } from '@/hooks/useUser';
import CreateUserModal from './CreateUserModal';

export default function UserSelect() {
  const { users, activeUser, createUser, switchUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // No users yet: show create prompt
  if (users.length === 0) {
    return (
      <>
        <Box w="100%" textAlign="center">
          <Button
            colorPalette="red"
            size="lg"
            borderRadius="xl"
            onClick={() => setModalOpen(true)}
          >
            ユーザーをつくる 🎉
          </Button>
        </Box>
        <CreateUserModal
          open={modalOpen}
          onOpenChange={(d) => setModalOpen(d.open)}
          onCreate={createUser}
        />
      </>
    );
  }

  return (
    <>
      <Box w="100%" position="relative">
        {/* Active user button */}
        <Flex
          as="button"
          onClick={() => setMenuOpen((v) => !v)}
          alignItems="center"
          gap={2}
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          px={4}
          py={2}
          w="100%"
          cursor="pointer"
          borderWidth="1px"
          borderColor="gray.100"
          transition="all 0.15s"
          _hover={{ boxShadow: 'md' }}
          aria-label="ユーザーを選ぶ"
        >
          <Flex
            w="40px"
            h="40px"
            borderRadius="full"
            bg="red.50"
            alignItems="center"
            justifyContent="center"
            fontSize="xl"
            flexShrink={0}
          >
            {activeUser?.avatar ?? '👤'}
          </Flex>
          <Text fontWeight="bold" fontSize="md" color="gray.800" flex={1} textAlign="left">
            {activeUser?.name ?? 'ユーザーをえらんでね'}
          </Text>
          <Text fontSize="sm" color="gray.400">
            ▼
          </Text>
        </Flex>

        {/* Dropdown menu */}
        {menuOpen && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={1}
            bg="white"
            borderRadius="xl"
            boxShadow="lg"
            borderWidth="1px"
            borderColor="gray.100"
            zIndex={10}
            overflow="hidden"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMenuOpen(false);
            }}
          >
            <VStack gap={0} align="stretch">
              {users.map((user) => (
                <Flex
                  key={user.id}
                  as="button"
                  onClick={() => {
                    switchUser(user.id);
                    setMenuOpen(false);
                  }}
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  cursor="pointer"
                  bg={user.id === activeUser?.id ? 'red.50' : 'transparent'}
                  _hover={{ bg: user.id === activeUser?.id ? 'red.100' : 'gray.50' }}
                  transition="background 0.1s"
                  aria-label={user.name + 'に切りかえ'}
                >
                  <Flex
                    w="36px"
                    h="36px"
                    borderRadius="full"
                    bg={user.id === activeUser?.id ? 'red.100' : 'gray.100'}
                    alignItems="center"
                    justifyContent="center"
                    fontSize="lg"
                    flexShrink={0}
                  >
                    {user.avatar}
                  </Flex>
                  <Text
                    fontWeight={user.id === activeUser?.id ? 'bold' : 'medium'}
                    fontSize="sm"
                    color="gray.800"
                  >
                    {user.name}
                  </Text>
                </Flex>
              ))}

              {/* Divider */}
              <Box h="1px" bg="gray.100" />

              {/* Add user button */}
              <Flex
                as="button"
                onClick={() => {
                  setMenuOpen(false);
                  setModalOpen(true);
                }}
                alignItems="center"
                gap={3}
                px={4}
                py={3}
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
                transition="background 0.1s"
              >
                <Flex
                  w="36px"
                  h="36px"
                  borderRadius="full"
                  bg="gray.100"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="lg"
                  flexShrink={0}
                >
                  ＋
                </Flex>
                <Text fontWeight="medium" fontSize="sm" color="gray.600">
                  あたらしい ユーザーをつくる
                </Text>
              </Flex>
            </VStack>
          </Box>
        )}
      </Box>

      <CreateUserModal
        open={modalOpen}
        onOpenChange={(d) => setModalOpen(d.open)}
        onCreate={createUser}
      />
    </>
  );
}
