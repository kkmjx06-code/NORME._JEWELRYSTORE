// NORME. Supabase connection
// Publishable key is intended for browser use. Never put a service_role/secret key here.
const SUPABASE_URL = "https://iuogweytypqpsnzbkhwl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VVqr9thV8pCW4rApdbCjxA_uh7tStaf";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Make the same client available to script.js and other page scripts.
window.db = db;

// Connection check: count rows visible under the current Supabase RLS policies.
(async function checkSupabaseConnection() {
  const { count, error } = await db
    .from("shop_products")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(error.message);
    return;
  }

  console.log(`연결 성공: 상품 ${count ?? 0}개`);
})();
