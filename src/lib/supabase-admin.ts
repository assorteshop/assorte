import { createClient } from "@supabase/supabase-js";

// Server-only client with the service role key. It bypasses Row Level Security,
// so it is used only in the signed payment callbacks (LiqPay and monobank).
export function createSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Service role key is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
