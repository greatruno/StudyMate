import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

// Ensure environment variables are loaded
dotenv.config();

// Ensure globalThis.WebSocket is available in Node.js runtime environment
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}

/**
 * Type-safe definition for backend Supabase configuration.
 */
export interface BackendSupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}

/**
 * Server-side constants for Storage Buckets (matching client definitions).
 */
export const STORAGE_BUCKETS = {
  DOCUMENTS: "documents",
  AVATARS: "avatars",
  EXPORTS: "exports",
} as const;

let cachedAdminClient: SupabaseClient | null = null;
let cachedAnonClient: SupabaseClient | null = null;

/**
 * Validates backend Supabase environment configuration.
 * Returns status and lists missing variables instead of hard-crashing.
 */
export function validateBackendConfig(): { isValid: boolean; missing: string[]; config: Partial<BackendSupabaseConfig> } {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  return {
    isValid: missing.length === 0,
    missing,
    config: { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey }
  };
}

/**
 * Retrieves a standard backend Supabase Client (respects RLS, uses Anon Key).
 * Lazily initialized and fails with clear message if variables are missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (cachedAnonClient) {
    return cachedAnonClient;
  }

  const { isValid, missing, config } = validateBackendConfig();
  
  // URL and Anon key are strictly required for standard client
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      `Cannot initialize standard Supabase client. Missing environment configurations: ${missing.filter(m => m !== 'SUPABASE_SERVICE_ROLE_KEY').join(", ")}. ` +
      `Please check your secrets panel or .env file.`
    );
  }

  cachedAnonClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false, // Server is stateless, do not persist session in localStorage
      autoRefreshToken: false,
    }
  });

  return cachedAnonClient;
}

/**
 * Retrieves an administrative backend Supabase Client (bypasses RLS, uses Service Role Key).
 * Lazily initialized. Crucial for system/admin jobs, cron syncs, and parsing tasks.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const { isValid, missing, config } = validateBackendConfig();

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error(
      `Cannot initialize administrative Supabase client. Missing environment configurations: ${missing.filter(m => m !== 'VITE_SUPABASE_ANON_KEY').join(", ")}. ` +
      `SUPABASE_SERVICE_ROLE_KEY is required for admin backend operations.`
    );
  }

  cachedAdminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  return cachedAdminClient;
}
