'use client';

import { Box, Button, SimpleGrid } from '@chakra-ui/react';

interface NumpadProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export function Numpad({ value, onChange, onSubmit }: NumpadProps) {
  const handleDigit = (digit: number) => {
    if (value.length >= 4) return;
    onChange(value + String(digit));
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <Box w="100%" maxW="280px" mx="auto">
      <SimpleGrid columns={3} gap={2}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <Button
            key={d}
            onClick={() => handleDigit(d)}
            minH="44px"
            minW="44px"
            fontSize="xl"
            variant="outline"
          >
            {d}
          </Button>
        ))}
        <Button
          onClick={handleDelete}
          minH="44px"
          minW="44px"
          fontSize="xl"
          variant="outline"
          aria-label="削除"
        >
          ⌫
        </Button>
        <Button
          onClick={() => handleDigit(0)}
          minH="44px"
          minW="44px"
          fontSize="xl"
          variant="outline"
          aria-label="0"
        >
          0
        </Button>
        <Button
          onClick={onSubmit}
          minH="44px"
          minW="44px"
          fontSize="xl"
          colorPalette="blue"
          aria-label="送信"
          data-testid="submit-button"
        >
          →
        </Button>
      </SimpleGrid>
    </Box>
  );
}
