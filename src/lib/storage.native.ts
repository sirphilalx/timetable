import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1800; // Keep safely under Android 8 Keystore 2048-byte limit

export const platformStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkCountStr) {
        const count = parseInt(chunkCountStr, 10);
        let result = "";
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk) {
            result += chunk;
          }
        }
        return result || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (value.length > CHUNK_SIZE) {
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.slice(i, i + CHUNK_SIZE));
        }
        await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          if (chunk !== undefined) {
            await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunk);
          }
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      // Storage failure fallback
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkCountStr) {
        const count = parseInt(chunkCountStr, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_chunks`);
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Deletion error fallback
    }
  },
};
