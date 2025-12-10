import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'TU_SUPABASE_URL';
const supabaseKey = 'TU_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
