import { createClient } from '@supabase/supabase-js';

export function createServerSupabaseClient(authToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    },
  });
}

export const createServerClient = createServerSupabaseClient;
