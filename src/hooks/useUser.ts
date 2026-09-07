'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createElement } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '@/lib/storage/storageService';
import type { UserProfile } from '@/types';

const STORAGE_KEY_USERS = 'users';
const STORAGE_KEY_ACTIVE = 'activeUserId';

interface UserContextValue {
  users: UserProfile[];
  activeUser: UserProfile | null;
  createUser: (name: string, avatar: string) => void;
  switchUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // Load from storage on mount
  useEffect(() => {
    const saved = StorageService.get<UserProfile[]>(STORAGE_KEY_USERS, []);
    const savedActiveId = StorageService.get<string | null>(STORAGE_KEY_ACTIVE, null);
    setUsers(saved);
    setActiveUserId(savedActiveId);
  }, []);

  const activeUser = users.find((u) => u.id === activeUserId) ?? null;

  const createUser = useCallback(
    (name: string, avatar: string) => {
      const newUser: UserProfile = {
        id: uuidv4(),
        name,
        avatar,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => {
        const next = [...prev, newUser];
        StorageService.set(STORAGE_KEY_USERS, next);
        return next;
      });
      setActiveUserId(newUser.id);
      StorageService.set(STORAGE_KEY_ACTIVE, newUser.id);
    },
    [],
  );

  const switchUser = useCallback((userId: string) => {
    if (usersRef.current.some((u) => u.id === userId)) {
      setActiveUserId(userId);
      StorageService.set(STORAGE_KEY_ACTIVE, userId);
    }
  }, []);

  const deleteUser = useCallback((userId: string) => {
    const newUsers = usersRef.current.filter((u) => u.id !== userId);
    setUsers(newUsers);
    StorageService.set(STORAGE_KEY_USERS, newUsers);

    setActiveUserId((prevId) => {
      if (prevId === userId) {
        const nextId = newUsers.length > 0 ? newUsers[0].id : '';
        StorageService.set(STORAGE_KEY_ACTIVE, nextId);
        return nextId;
      }
      return prevId;
    });
  }, []);

  return createElement(
    UserContext.Provider,
    { value: { users, activeUser, createUser, switchUser, deleteUser } },
    children,
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
