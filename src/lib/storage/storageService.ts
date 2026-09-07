const PREFIX = 'ysansu:';

export class StorageService {
  static isAvailable(): boolean {
    try {
      const key = `${PREFIX}__test__`;
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  static get<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(`${PREFIX}${key}`);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[StorageService] Failed to read key "${key}"`);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch {
      console.warn(`[StorageService] Failed to write key "${key}"`);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(`${PREFIX}${key}`);
    } catch {
      console.warn(`[StorageService] Failed to remove key "${key}"`);
    }
  }
}
