import { v4 as uuidv4 } from 'uuid';
import type { DrillRecord, OperationType, UserProfile, UserSettings } from '@/types';
import { StorageService } from './storageService';
import { getBestRecord } from '@/lib/judge';

const KEYS = {
  users: 'users',
  activeUser: 'activeUser',
  history: (userId: string) => `history:${userId}`,
  settings: (userId: string) => `settings:${userId}`,
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  lastOperation: null,
  lastLevel: null,
};

// --- ユーザー ---

export function getUsers(): UserProfile[] {
  return StorageService.get<UserProfile[]>(KEYS.users, []);
}

export function addUser(name: string, avatar: string): UserProfile {
  const users = getUsers();
  const newUser: UserProfile = {
    id: uuidv4(),
    name,
    avatar,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  StorageService.set(KEYS.users, users);
  return newUser;
}

export function getActiveUser(): UserProfile | null {
  const userId = StorageService.get<string | null>(KEYS.activeUser, null);
  if (!userId) return null;
  const users = getUsers();
  return users.find((u) => u.id === userId) ?? null;
}

export function setActiveUser(userId: string): void {
  StorageService.set(KEYS.activeUser, userId);
}

// --- 履歴 ---

export function getHistory(userId: string): DrillRecord[] {
  return StorageService.get<DrillRecord[]>(KEYS.history(userId), []);
}

export function addRecord(userId: string, record: Omit<DrillRecord, 'id'>): DrillRecord {
  const history = getHistory(userId);
  const newRecord: DrillRecord = { ...record, id: uuidv4() };
  history.push(newRecord);
  StorageService.set(KEYS.history(userId), history);
  return newRecord;
}

export function getBestForLevel(
  userId: string,
  operation: OperationType,
  level: number,
): DrillRecord | null {
  const history = getHistory(userId);
  return getBestRecord(history, operation, level);
}

// --- 設定 ---

export function getSettings(userId: string): UserSettings {
  return StorageService.get<UserSettings>(KEYS.settings(userId), DEFAULT_SETTINGS);
}

export function updateSettings(userId: string, partial: Partial<UserSettings>): void {
  const current = getSettings(userId);
  StorageService.set(KEYS.settings(userId), { ...current, ...partial });
}
