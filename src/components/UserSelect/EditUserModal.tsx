'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogBackdrop,
  DialogPositioner,
  DialogTitle,
  DialogCloseTrigger,
} from '@chakra-ui/react';
import type { UserProfile } from '@/types';

const AVATAR_PRESETS = ['🦁', '🐱', '🐶', '🐰', '🐼', '🦊', '🐸', '🐧', '🐵', '🦄'];

interface EditUserModalProps {
  open: boolean;
  user: UserProfile;
  onOpenChange: (details: { open: boolean }) => void;
  onSave: (userId: string, name: string, avatar: string) => void;
  onDelete: (userId: string) => void;
}

export default function EditUserModal({
  open,
  user,
  onOpenChange,
  onSave,
  onDelete,
}: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(user.id, trimmed, avatar);
    onOpenChange({ open: false });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(user.id);
    setConfirmDelete(false);
    onOpenChange({ open: false });
  };

  const handleCancel = () => {
    setName(user.name);
    setAvatar(user.avatar);
    setConfirmDelete(false);
    onOpenChange({ open: false });
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} placement="center">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent borderRadius="2xl" mx={4}>
          <DialogHeader>
            <DialogTitle fontSize="lg" fontWeight="bold">
              ユーザーの へんしゅう
            </DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />

          <DialogBody>
            <Text fontSize="sm" color="gray.600" mb={2}>
              なまえ
            </Text>
            <Input
              placeholder="なまえ を いれてね"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="lg"
              mb={4}
              aria-label="なまえ"
            />

            <Text fontSize="sm" color="gray.600" mb={2}>
              アバター
            </Text>
            <Flex gap={2} flexWrap="wrap" mb={4}>
              {AVATAR_PRESETS.map((emoji) => (
                <Box
                  key={emoji}
                  as="button"
                  onClick={() => setAvatar(emoji)}
                  w="48px"
                  h="48px"
                  borderRadius="xl"
                  fontSize="2xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={avatar === emoji ? 'red.50' : 'gray.50'}
                  borderWidth="2px"
                  borderColor={avatar === emoji ? 'red.400' : 'transparent'}
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ bg: avatar === emoji ? 'red.100' : 'gray.100' }}
                  aria-label={emoji + 'アバター'}
                >
                  {emoji}
                </Box>
              ))}
            </Flex>

            {/* 削除エリア */}
            <Box borderTopWidth="1px" borderColor="gray.100" pt={4}>
              {confirmDelete ? (
                <Flex direction="column" gap={2} alignItems="center">
                  <Text fontSize="sm" color="red.500" fontWeight="bold">
                    ⚠️ このユーザーと がくしゅうの きろくが ぜんぶ けされます
                  </Text>
                  <Flex gap={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(false)}
                    >
                      やめる
                    </Button>
                    <Button
                      size="sm"
                      colorPalette="red"
                      onClick={handleDelete}
                    >
                      けす
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  as="button"
                  onClick={handleDelete}
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                  w="100%"
                  py={2}
                  cursor="pointer"
                  borderRadius="lg"
                  _hover={{ bg: 'red.50' }}
                  transition="all 0.15s"
                >
                  <Text fontSize="sm" color="red.400">
                    🗑 このユーザーを けす
                  </Text>
                </Flex>
              )}
            </Box>
          </DialogBody>

          <DialogFooter gap={2}>
            <Button variant="ghost" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button
              colorPalette="red"
              onClick={handleSave}
              disabled={!name.trim()}
            >
              ほぞん
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
