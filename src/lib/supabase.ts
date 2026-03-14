import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Paste your values from Supabase Settings → API
const SUPABASE_URL  = 'https://qjbvyrcfwbofduzupyyt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqYnZ5cmNmd2JvZmR1enVweXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTkyODUsImV4cCI6MjA4OTA3NTI4NX0.QEefPIcEkFFbN9sUwE8PcVTcxrRul40plq_8cfDVnDY'

// SecureStore adapter — stores tokens securely on device
const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:          ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});