'use client';

import { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

interface FeedbackOverlayProps {
  correct: boolean | null;
}

const MotionBox = motion.create(Box);

export function FeedbackOverlay({ correct }: FeedbackOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (correct === null) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(timer);
  }, [correct]);

  return (
    <AnimatePresence>
      {visible && correct !== null && (
        <MotionBox
          position="fixed"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
          zIndex="popover"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.2 }}
        >
          <Text fontSize="9xl" fontWeight="bold" color={correct ? 'green.400' : 'red.400'}>
            {correct ? '○' : '×'}
          </Text>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
