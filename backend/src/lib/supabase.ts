import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return null;
  }
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  return supabaseClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminClient) return supabaseAdminClient;
  if (!env.SUPABASE_URL) return null;

  // If service role key is provided and distinct from anon key, use it
  if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY !== env.SUPABASE_ANON_KEY) {
    supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    return supabaseAdminClient;
  }

  // Fallback to anon client if service role key is absent or same as anon key
  return getSupabase();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY));
}

export async function checkSupabaseStatus(): Promise<{ connected: boolean; message: string; tablesFound: boolean }> {
  if (!isSupabaseConfigured()) {
    return { connected: false, message: 'Supabase credentials not set in environment.', tablesFound: false };
  }
  const client = getSupabaseAdmin() || getSupabase();
  if (!client) {
    return { connected: false, message: 'Failed to initialize Supabase client.', tablesFound: false };
  }

  try {
    const { data, error } = await client.from('research_projects').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return {
          connected: true,
          message: 'Connected to Supabase endpoint, but SQL schema/tables not yet created. Run supabase-schema.sql to apply tables.',
          tablesFound: false
        };
      }
      return { connected: false, message: `Supabase error: ${error.message}`, tablesFound: false };
    }
    return { connected: true, message: `Connected to Supabase successfully. Found ${data?.length || 0} projects.`, tablesFound: true };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Unknown network error connecting to Supabase.', tablesFound: false };
  }
}
