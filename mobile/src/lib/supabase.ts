// Clientul Supabase al aplicației: login direct la Supabase, apoi tokenul merge la serverul ProfPlus ca `Authorization: Bearer`.
// Sesiunea rămâne pe telefon criptată: cheia AES stă în Keystore/Keychain (SecureStore), iar datele criptate în AsyncStorage,
// fiindcă SecureStore nu primește valori peste 2048 de octeți (rețeta din ghidul Supabase pentru Expo).
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import { CryptoDigestAlgorithm, digest, getRandomBytes, getRandomValues } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import { log } from './log';

// Hermes nu are WebCrypto. Fără el, Supabase ar genera verificatorul PKCE cu Math.random și l-ar trimite necriptat
// („plain”); îi dăm generatorul sigur și SHA-256 ale sistemului (expo-crypto).
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
// În Node (la exportul de release) `crypto` există deja și nu poate fi rescris.
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
      // O sesiune care nu se mai poate citi înseamnă delogare; jurnalul spune de ce.
      log('error', 'session_read_failed', undefined, error);
      return null;
    }
  }

  async setItem(key: string, value: string) {
    // Cheie nouă la fiecare scriere, deci contorul CTR nu se refolosește cu aceeași cheie.
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

// Adresa și cheia publică (publishable) a proiectului, din mobile/.env.local. Cheia publică nu este un secret.
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

// Reîmprospătează tokenul doar cât timp aplicația este deschisă.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
