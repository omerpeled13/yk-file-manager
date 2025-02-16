import { createClient } from '@supabase/supabase-js'
import { Database } from '@/src/types/supabase'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/src/environment";

const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default supabaseAdmin