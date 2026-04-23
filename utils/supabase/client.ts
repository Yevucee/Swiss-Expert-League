import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? `https://${projectId}.supabase.co`;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? publicAnonKey;

// Create a singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);