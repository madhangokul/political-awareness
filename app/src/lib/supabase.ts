import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy app/.env.example → app/.env.local and fill in your Supabase keys.'
  )
}

// NOTE: The Database type generic is intentionally omitted here.
// After running `supabase gen types typescript --local > src/lib/types.ts`,
// re-add the generic: createClient<Database>(url, anonKey)
export const supabase = createClient(url, anonKey)
