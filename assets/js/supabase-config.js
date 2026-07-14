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
  SUPABASE_ANON_KEY: "PASTE_YOUR_SUPABASE_PUBLISHABLE_ANON_KEY"
};
