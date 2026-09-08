'use client';

import { useState } from 'react';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';
import { useUser } from '@/hooks/useUser';
import type { UserProfile } from '@/types';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

export default function UserSelect() {
  const { users, activeUser, createUser, updateUser, switchUser, deleteUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);

  if (users.length === 0) {
    return (
      <>
        <Box w="100%" textAlign="center">
          <Button
            colorPalette="red"
            size="lg"
            borderRadius="xl"
            onClick={() => setCreateOpen(true)}
          >
            ユーザーをつくる 🎉
          </Button>
        </Box>
        <CreateUserModal
          open={createOpen}
          onOpenChange={(d) => setCreateOpen(d.open)}
          onCreate={createUser}
        />
      </>
    );
  }

  return (
    <>
      <Box w="100%" position="relative">
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
          <Text fontSize="sm" color="gray.400">▼</Text>
        </Flex>

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
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  bg={user.id === activeUser?.id ? 'red.50' : 'transparent'}
                  _hover={{ bg: user.id === activeUser?.id ? 'red.100' : 'gray.50' }}
                  transition="background 0.1s"
                >
                  <Flex
                    as="button"
                    onClick={() => {
                      switchUser(user.id);
                      setMenuOpen(false);
                    }}
                    alignItems="center"
                    gap={3}
                    flex={1}
                    cursor="pointer"
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
                  {/* 編集ボタン */}
                  <Box
                    as="button"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setEditUser(user);
                    }}
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    color="gray.400"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100', color: 'gray.600' }}
                    transition="all 0.15s"
                    aria-label={user.name + 'を編集'}
                  >
                    ✏️
                  </Box>
                </Flex>
              ))}

              <Box h="1px" bg="gray.100" />

              <Flex
                as="button"
                onClick={() => {
                  setMenuOpen(false);
                  setCreateOpen(true);
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
        open={createOpen}
        onOpenChange={(d) => setCreateOpen(d.open)}
        onCreate={createUser}
      />

      {editUser && (
        <EditUserModal
          open={!!editUser}
          user={editUser}
          onOpenChange={(d) => {
            if (!d.open) setEditUser(null);
          }}
          onSave={updateUser}
          onDelete={(userId) => {
            deleteUser(userId);
            setEditUser(null);
          }}
        />
      )}
    </>
  );
}
