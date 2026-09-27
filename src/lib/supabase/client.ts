import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vsbvnneyxyxjlvnmqmbv.supabase.co",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_FtizQURMMWQ9D4ECjRrLAQ_8DW3ZoVa",
    aiApiUrl: process.env.NEXT_PUBLIC_AI_API_URL || "",
  };
}

export function isSupabaseConfigured() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function isAiConfigured() {
  return Boolean(getPublicEnv().aiApiUrl);
}

/**
 * Browser client with the publishable key only.
 * Never initialize this with the service role key.
 */
export function getSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}