/* Supabase connection — Double MMK Management
   ------------------------------------------------------------------
   Project: double-mmk (ref ubtqikgdilmfgtvjrajz) — isolated from MAVYN.

   The publishable / anon key below is SAFE to expose in client code: it
   only permits what Row-Level Security allows (public can READ listings
   and site content; only a logged-in owner can change them). It is NOT
   the service_role key — never put that here.

   To go live, paste your project's publishable (anon) key from:
     Supabase dashboard -> Project Settings -> API -> "anon"/"publishable" key
   ------------------------------------------------------------------ */
window.DMMK = {
  SUPABASE_URL: "https://ubtqikgdilmfgtvjrajz.supabase.co",
  // anon/public key — safe to expose; write access is gated by Row-Level Security.
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidHFpa2dkaWxtZmd0dmpyYWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMzM1MTQsImV4cCI6MjA5OTYwOTUxNH0.GTqqoWqF5Z8IqTxT1ILRO5T_Gj9gJnAOYcFl_0ePVJs"
};
