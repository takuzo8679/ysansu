'use client';

import { useCallback, useEffect, useState } from 'react';
import { soundManager, type SoundType } from '@/lib/sound';
import { useSettings } from '@/hooks/useStorage';
import { useUser } from '@/hooks/useUser';

export function useSound(): {
  play: (type: SoundType) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
} {
  const { activeUser } = useUser();
  const userId = activeUser?.id ?? 'default-user';
  const { settings, updateSettings } = useSettings(userId);
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    setEnabledState(settings.soundEnabled);
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const play = useCallback((type: SoundType) => {
    soundManager.play(type);
  }, []);

  const setEnabled = useCallback(
    (v: boolean) => {
      setEnabledState(v);
      soundManager.setEnabled(v);
      updateSettings({ soundEnabled: v });
    },
    [updateSettings],
  );

  return { play, enabled, setEnabled };
}
