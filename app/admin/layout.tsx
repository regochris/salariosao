import Link from "next/link";
import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: { default: "Painel", template: "%s · Painel SaláriosAO" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirAdmin();
  const supabase = await supabaseServer();
  const [p, s, m] = await Promise.all([
    supabase.from("partilhas").select("id", { count: "exact", head: true }).eq("estado", "pendente"),
    supabase.from("sugestoes").select("id", { count: "exact", head: true }).eq("estado", "pendente"),
    supabase.from("mensagens").select("id", { count: "exact", head: true }).eq("lida", false),
  ]);
  const iniciais = u.email.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex flex-col gap-2 border-b border-line bg-surface px-3 py-3 md:sticky md:top-0 md:h-dvh md:w-[260px] md:shrink-0 md:gap-1.5 md:border-r md:border-b-0 md:px-3.5 md:py-5">
        <div className="flex items-center justify-between gap-2 px-3 md:pb-4">
          <Link href="/" className="plain flex items-center gap-2 text-ink no-underline">
            <span className="text-[19px] font-semibold">Salários<span className="text-primary">AO</span></span>
            <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold tracking-[0.4px] text-bg">ADMIN</span>
          </Link>
          <Link href="/" className="text-sm md:hidden">Ver site ›</Link>
        </div>
        <AdminNav contagens={{ pendentes: p.count ?? 0, sugestoes: s.count ?? 0, mensagens: m.count ?? 0 }} />
        <div className="mt-auto hidden flex-col gap-2 md:flex">
          <Link href="/" className="px-3 text-sm">← Voltar ao site</Link>
          <div className="flex items-center gap-2.5 rounded-xl bg-bg p-3">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{iniciais}</span>
            <span className="flex min-w-0 flex-col leading-[18px]">
              <strong className="truncate text-sm font-semibold">{u.email}</strong>
              <span className="text-xs text-muted">Administrador</span>
            </span>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 px-4 pt-6 pb-16 md:px-10 md:pt-8">{children}</div>
    </div>
  );
}
