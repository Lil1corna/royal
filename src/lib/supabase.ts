import { getSupabaseClient } from './supabase-client-singleton'

export { getSupabaseClient }

/** Один экземпляр с `getSupabaseClient()`; оставлено для совместимости импортов. */
export function createClient() {
  return getSupabaseClient()
}
