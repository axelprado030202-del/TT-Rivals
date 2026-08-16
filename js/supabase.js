import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://yfwuwrpfpzhpddgkjvty.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LIAzc0Fv_xPYlD7Ym4Gzkw_LqTv0Kwf';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
