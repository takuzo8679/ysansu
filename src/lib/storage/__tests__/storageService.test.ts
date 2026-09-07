import { StorageService } from '../storageService';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('get / set / remove', () => {
    it('存在しないキーはデフォルト値を返す', () => {
      expect(StorageService.get('nonexistent', 42)).toBe(42);
    });

    it('set した値を get で取得できる', () => {
      StorageService.set('name', 'たろう');
      expect(StorageService.get('name', '')).toBe('たろう');
    });

    it('オブジェクトを保存・取得できる', () => {
      const data = { score: 100, time: 30 };
      StorageService.set('obj', data);
      expect(StorageService.get('obj', {})).toEqual(data);
    });

    it('配列を保存・取得できる', () => {
      const arr = [1, 2, 3];
      StorageService.set('arr', arr);
      expect(StorageService.get('arr', [])).toEqual(arr);
    });

    it('remove でキーを削除するとデフォルト値になる', () => {
      StorageService.set('temp', 'value');
      StorageService.remove('temp');
      expect(StorageService.get('temp', 'default')).toBe('default');
    });

    it('キープレフィックスが付与される', () => {
      StorageService.set('key', 'val');
      expect(localStorage.getItem('ysansu:key')).toBe('"val"');
    });
  });

  describe('isAvailable', () => {
    it('通常環境では true を返す', () => {
      expect(StorageService.isAvailable()).toBe(true);
    });

    it('localStorage が使えない場合は false を返す', () => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('disabled');
      };
      expect(StorageService.isAvailable()).toBe(false);
      Storage.prototype.setItem = orig;
    });
  });

  describe('JSON parse 失敗時のフォールバック', () => {
    it('不正な JSON ではデフォルト値を返す', () => {
      localStorage.setItem('ysansu:broken', '{invalid json}');
      expect(StorageService.get('broken', 'fallback')).toBe('fallback');
    });
  });
});
