
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("Supabase URL exists:", !!supabaseUrl);
console.log("Service key exists:", !!serviceKey);
console.log("Service key type:", serviceKey.startsWith("sb_secret_") ? "New secret key" : serviceKey.startsWith("eyJ") ? "JWT key" : "Unknown");

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
