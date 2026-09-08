import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || '';
    }
  } catch {
    // fallback
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || '';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('tu-proyecto') &&
    !supabaseAnonKey.includes('tu-anon-key')
  );
};

// Cliente Supabase seguro con fallback condicional
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

if (!isSupabaseConfigured()) {
  console.info(
    '%c⚡ FIRME STUDIO: Supabase en Modo Local / Fallback activo.',
    'color: #B5654A; font-weight: bold;',
    'Para persistencia en la nube y Realtime, agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env'
  );
} else {
  console.info(
    '%c✨ FIRME STUDIO: Conectado exitosamente a Supabase Cloud (PostgreSQL & Realtime).',
    'color: #2E7D46; font-weight: bold;'
  );
}

export interface SupabaseStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
}

export const getSupabaseStatus = (): SupabaseStatus => ({
  isConfigured: isSupabaseConfigured(),
  url: supabaseUrl ? `${supabaseUrl.slice(0, 18)}...` : 'No configurada',
  hasAnonKey: Boolean(supabaseAnonKey),
});
