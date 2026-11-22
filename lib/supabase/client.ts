import { createBrowserClient } from "@supabase/ssr";

// Cliente para componentes que correm no browser ("use client").
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
