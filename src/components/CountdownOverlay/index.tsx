'use client';

import { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { soundManager } from '@/lib/sound';

interface CountdownOverlayProps {
  onComplete: () => void;
}

const MotionBox = motion.create(Box);

export function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      soundManager.play('countdown');
      const timer = setTimeout(() => setCount(count - 1), 800);
      return () => clearTimeout(timer);
    }
    // count === 0: "スタート！" を表示後に完了
    soundManager.play('start');
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  const label = count > 0 ? String(count) : 'スタート！';

  return (
    <Box
      position="fixed"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="blackAlpha.600"
      zIndex="overlay"
    >
      <AnimatePresence mode="wait">
        <MotionBox
          key={label}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Text fontSize="8xl" fontWeight="bold" color="white">
            {label}
          </Text>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
}
