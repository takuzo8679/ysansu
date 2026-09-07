'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DrillRecord, UserSettings } from '@/types';
import {
  getHistory,
  addRecord as addRecordToStorage,
  getSettings,
  updateSettings as updateSettingsInStorage,
} from '@/lib/storage';

export function useHistory(userId: string): {
  records: DrillRecord[];
  addRecord: (r: Omit<DrillRecord, 'id'>) => void;
} {
  const [records, setRecords] = useState<DrillRecord[]>(() => getHistory(userId));

  useEffect(() => {
    setRecords(getHistory(userId));
  }, [userId]); // userId変更時に再取得

  const addRecord = useCallback(
    (r: Omit<DrillRecord, 'id'>) => {
      const saved = addRecordToStorage(userId, r);
      setRecords((prev) => [...prev, saved]);
    },
    [userId],
  );

  return { records, addRecord };
}

export function useSettings(userId: string): {
  settings: UserSettings;
  updateSettings: (p: Partial<UserSettings>) => void;
} {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings(userId));

  useEffect(() => {
    setSettings(getSettings(userId));
  }, [userId]); // userId変更時に再取得

  const updateSettingsHandler = useCallback(
    (p: Partial<UserSettings>) => {
      updateSettingsInStorage(userId, p);
      setSettings((prev) => ({ ...prev, ...p }));
    },
    [userId],
  );

  return { settings, updateSettings: updateSettingsHandler };
}
