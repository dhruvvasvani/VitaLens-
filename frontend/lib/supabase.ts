import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Ensure we always pass a valid URL structure to createClient to avoid crashing
const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl || 'dummy'}.supabase.co`;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(url, key);
