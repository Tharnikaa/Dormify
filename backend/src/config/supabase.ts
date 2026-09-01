import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://lqyisyqrnmfwqwkycfol.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ABSCn59c4t1NNIiQgVq2UQ_v0EWq1v7';

export const supabase = createClient(supabaseUrl, supabaseKey);
