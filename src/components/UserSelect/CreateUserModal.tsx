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

const AVATAR_PRESETS = ['🦁', '🐱', '🐶', '🐰', '🐼', '🦊', '🐸', '🐧', '🐵', '🦄'];

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  onCreate: (name: string, avatar: string) => void;
}

export default function CreateUserModal({ open, onOpenChange, onCreate }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, avatar);
    setName('');
    setAvatar(AVATAR_PRESETS[0]);
    onOpenChange({ open: false });
  };

  const handleCancel = () => {
    setName('');
    setAvatar(AVATAR_PRESETS[0]);
    onOpenChange({ open: false });
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} placement="center">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent borderRadius="2xl" mx={4}>
          <DialogHeader>
            <DialogTitle fontSize="lg" fontWeight="bold">
              あたらしい ユーザー
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
            <Flex gap={2} flexWrap="wrap">
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
          </DialogBody>

          <DialogFooter gap={2}>
            <Button variant="ghost" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button
              colorPalette="red"
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              つくる
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
