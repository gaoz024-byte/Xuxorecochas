const SUPABASE_URL = "https://mwuvzqejuanmkyvknnkl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9FKaGJcxroQ-jHXaBHHabQ_9_1qOo0h";

function getSupabaseClient() {
  const isConfigured =
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_ANON_KEY.length > 40 &&
    window.supabase;

  if (!isConfigured) return null;

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
