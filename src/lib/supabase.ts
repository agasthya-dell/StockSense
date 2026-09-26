import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ucriyxixxmhknylmhsva.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjcml5eGl4eG1oa255bG1oc3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzOTk0NjgsImV4cCI6MjEwNTk3NTQ2OH0.JFLJtYB9Xd5MWnz-reJR-gRP7j01tSGz_KaAtQCSaFI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,   // picks up tokens from URL hash automatically
    flowType: "implicit",       // matches what Supabase returns for Google OAuth
  },
});
