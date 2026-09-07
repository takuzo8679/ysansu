'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { DrillResultProvider } from '@/hooks/useDrillResult';
import { UserProvider } from '@/hooks/useUser';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <UserProvider>
        <DrillResultProvider>{children}</DrillResultProvider>
      </UserProvider>
    </ChakraProvider>
  );
}
