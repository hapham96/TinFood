import { Preferences } from '@capacitor/preferences';

export class StorageService {
  async set(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch (err) {
      console.error(`Error saving key: ${key}`, err);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key });
      return result.value ?? null;
    } catch (err) {
      console.error(`Error getting key: ${key}`, err);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (err) {
      console.error(`Error removing key: ${key}`, err);
    }
  }

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (err) {
      console.error(`Error clearing storage`, err);
    }
  }
}
