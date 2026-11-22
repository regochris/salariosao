import { notFound } from "next/navigation";
import { utilizadorAtual } from "@/lib/supabase/server";

// Só administradores. Para os restantes, o painel "não existe" (404).
// A segurança real está nas regras RLS e nas funções admin_* da base de dados.
export async function exigirAdmin() {
  const u = await utilizadorAtual();
  if (!u || u.papel !== "admin") notFound();
  return u;
}

export const dataCurta = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const estados = {
  pendente: { nome: "Pendente", cor: "bg-warning/15 text-warning" },
  aprovada: { nome: "Aprovada", cor: "bg-success/15 text-success" },
  rejeitada: { nome: "Rejeitada", cor: "bg-error/15 text-error" },
} as const;
