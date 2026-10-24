// Public client configuration for Syntix.ai.
// Only the Supabase Project URL and Publishable key belong here.
// Never put a database password, sb_secret key, or service_role key in frontend code.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://jcswybtiaxiaaghufadc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nh7XtI3JEymH__sg5aq5Kw_icGWSSeZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
