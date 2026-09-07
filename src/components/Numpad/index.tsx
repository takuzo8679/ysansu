'use client';

import { Box, SimpleGrid } from '@chakra-ui/react';
import { useState, useCallback } from 'react';

interface NumpadProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

function NumpadButton({
  onClick,
  label,
  ariaLabel,
  variant,
}: {
  onClick: () => void;
  label: string;
  ariaLabel?: string;
  variant: 'digit' | 'delete' | 'submit';
}) {
  const [pressed, setPressed] = useState(false);

  const baseStyle = {
    digit: {
      bg: 'white',
      color: 'gray.800',
      borderColor: 'gray.200',
      pressedBg: 'blue.50',
      pressedBorder: 'blue.300',
    },
    delete: {
      bg: 'red.50',
      color: 'red.600',
      borderColor: 'red.200',
      pressedBg: 'red.100',
      pressedBorder: 'red.400',
    },
    submit: {
      bg: 'blue.500',
      color: 'white',
      borderColor: 'blue.500',
      pressedBg: 'blue.700',
      pressedBorder: 'blue.700',
    },
  }[variant];

  const handlePointerDown = useCallback(() => setPressed(true), []);
  const handlePointerUp = useCallback(() => {
    setPressed(false);
    onClick();
  }, [onClick]);
  const handlePointerLeave = useCallback(() => setPressed(false), []);

  return (
    <Box
      as="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      h="60px"
      fontSize="2xl"
      fontWeight="bold"
      borderRadius="xl"
      borderWidth="2px"
      borderColor={pressed ? baseStyle.pressedBorder : baseStyle.borderColor}
      bg={pressed ? baseStyle.pressedBg : baseStyle.bg}
      color={baseStyle.color}
      cursor="pointer"
      userSelect="none"
      transition="all 0.1s"
      transform={pressed ? 'scale(0.95)' : 'scale(1)'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      aria-label={ariaLabel}
      data-testid={variant === 'submit' ? 'submit-button' : undefined}
      _hover={{ boxShadow: 'sm' }}
    >
      {label}
    </Box>
  );
}

export function Numpad({ value, onChange, onSubmit }: NumpadProps) {
  const handleDigit = useCallback(
    (digit: number) => {
      if (value.length >= 4) return;
      onChange(value + String(digit));
    },
    [value, onChange],
  );

  const handleDelete = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);

  return (
    <Box w="100%" maxW="320px" mx="auto">
      <SimpleGrid columns={3} gap={3}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <NumpadButton
            key={d}
            onClick={() => handleDigit(d)}
            label={String(d)}
            variant="digit"
          />
        ))}
        <NumpadButton
          onClick={handleDelete}
          label="⌫"
          ariaLabel="削除"
          variant="delete"
        />
        <NumpadButton
          onClick={() => handleDigit(0)}
          label="0"
          ariaLabel="0"
          variant="digit"
        />
        <NumpadButton
          onClick={onSubmit}
          label="→"
          ariaLabel="送信"
          variant="submit"
        />
      </SimpleGrid>
    </Box>
  );
}
