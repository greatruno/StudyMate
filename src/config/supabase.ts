import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Type definition for client-side Supabase configuration.
 */
export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * Configuration constants for Storage Buckets.
 */
export const STORAGE_BUCKETS = {
  DOCUMENTS: "documents", // For uploaded study PDFs/DOCX
  AVATARS: "avatars",     // For user profiles
  EXPORTS: "exports",     // For study plan or transcript exports
} as const;

export type StorageBucketKey = keyof typeof STORAGE_BUCKETS;

/**
 * Standard Authentication Configuration for Supabase Client.
 */
export const SUPABASE_AUTH_CONFIG = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
};

let cachedSupabaseClient: SupabaseClient | null = null;

/**
 * Validates that frontend environment variables are defined.
 * Does not throw, but logs detailed instructions if keys are missing.
 */
export function validateFrontendConfig(): { isValid: boolean; config: Partial<SupabaseConfig> } {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const errors: string[] = [];
  if (!supabaseUrl) {
    errors.push("VITE_SUPABASE_URL is missing.");
  }
  if (!supabaseAnonKey) {
    errors.push("VITE_SUPABASE_ANON_KEY is missing.");
  }

  if (errors.length > 0) {
    console.warn(
      `⚠️ Supabase Frontend configuration is incomplete:\n` +
      errors.join("\n") +
      `\nPlease define these variables in your .env or system settings to enable live database integrations.`
    );
    return {
      isValid: false,
      config: { supabaseUrl, supabaseAnonKey },
    };
  }

  return {
    isValid: true,
    config: { supabaseUrl, supabaseAnonKey },
  };
}

/**
 * Retrieves the singleton, lazily-initialized Supabase Client.
 * Fails fast with a clear descriptive error only when accessed without proper config.
 */
export function getSupabase(): SupabaseClient {
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }

  const { isValid, config } = validateFrontendConfig();

  if (!isValid || !config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      "Supabase client cannot be initialized. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Please configure these environment variables in your environment or Settings panel."
    );
  }

  cachedSupabaseClient = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    SUPABASE_AUTH_CONFIG
  );

  return cachedSupabaseClient;
}
