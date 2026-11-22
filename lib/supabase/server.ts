import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente para páginas e rotas do servidor. Lê e renova a sessão a partir dos cookies.
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Chamado a partir de um Server Component: o middleware trata da renovação.
          }
        },
      },
    },
  );
}

// Utilizador com sessão, perfil e estado do email (ou null).
export async function utilizadorAtual() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: perfil } = await supabase.from("perfis").select("tipo, papel").eq("id", data.user.id).maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    confirmado: Boolean(data.user.email_confirmed_at),
    tipo: (perfil?.tipo ?? "trabalhador") as "trabalhador" | "estudante",
    papel: (perfil?.papel ?? "utilizador") as "utilizador" | "admin",
  };
}
