import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import { CryptoDigestAlgorithm, digest, getRandomBytes, getRandomValues } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import { log } from './log';

type MinimalCrypto = {
  getRandomValues?: typeof getRandomValues;
  subtle?: { digest: (algorithm: string, data: BufferSource) => Promise<ArrayBuffer> };
};
const host = globalThis as { crypto?: MinimalCrypto };
const globalCrypto: MinimalCrypto = host.crypto ?? {};
if (!globalCrypto.getRandomValues) globalCrypto.getRandomValues = getRandomValues;
if (!globalCrypto.subtle) {
  globalCrypto.subtle = {
    digest: (algorithm, data) => {
      if (algorithm !== CryptoDigestAlgorithm.SHA256) throw new Error('Only SHA-256 is available');
      return digest(CryptoDigestAlgorithm.SHA256, data);
    },
  };
}
if (!host.crypto) host.crypto = globalCrypto;

class EncryptedSessionStore {
  async getItem(key: string) {
    try {
      const encrypted = await AsyncStorage.getItem(key);
      if (!encrypted) return encrypted;
      const keyHex = await SecureStore.getItemAsync(key);
      if (!keyHex) {
        log('warn', 'session_key_missing');
        return null;
      }
      const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(keyHex), new aesjs.Counter(1));
      return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(encrypted)));
    } catch (error) {
      log('error', 'session_read_failed', undefined, error);
      return null;
    }
  }

  async setItem(key: string, value: string) {
    const encryptionKey = getRandomBytes(32);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encrypted));
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const supabaseConfigured = Boolean(url && publishableKey);

export const supabase = createClient(url || 'https://invalid.local', publishableKey || 'missing', {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: new EncryptedSessionStore() } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
