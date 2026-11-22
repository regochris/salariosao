import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { dataCurta } from "@/lib/admin";
import { Bloco, Cabecalho } from "./ui";

export const metadata: Metadata = { title: "Visão geral" };

type Resumo = {
  utilizadores: number; utilizadores_7d: number; confirmados: number;
  partilhas: number; aprovadas: number; pendentes: number; rejeitadas: number; partilhas_7d: number;
  publico: number; privado: number; sugestoes: number; mensagens: number; cargos_com_dados: number;
  por_provincia: { nome: string; n: number }[]; por_dia: { dia: string; n: number }[];
};

export default async function VisaoGeral() {
  const supabase = await supabaseServer();
  const [{ data, error }, { data: recentes }] = await Promise.all([
    supabase.rpc("admin_resumo"),
    supabase.from("partilhas").select("id, cargo_texto, sector, estado, criado_em, provincias(nome)").order("criado_em", { ascending: false }).limit(6),
  ]);
  if (error || !data) return <p className="text-error">Não foi possível carregar o resumo: {error?.message}</p>;
  const r = data as Resumo;

  // Últimos 30 dias, com os dias sem partilhas a zero.
  const dias = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10);
    return { dia: d, n: r.por_dia.find((x) => x.dia === d)?.n ?? 0 };
  });
  const maxDia = Math.max(1, ...dias.map((d) => d.n));
  const maxProv = Math.max(1, ...r.por_provincia.map((p) => p.n));

  const kpis = [
    { nome: "Partilhas", valor: r.partilhas, nota: `+${r.partilhas_7d} nos últimos 7 dias` },
    { nome: "Por moderar", valor: r.pendentes, nota: "Partilhas pendentes", href: "/admin/moderacao", alerta: r.pendentes > 0 },
    { nome: "Utilizadores", valor: r.utilizadores, nota: `${r.confirmados} com email confirmado` },
    { nome: "Cargos com dados", valor: r.cargos_com_dados, nota: "5 ou mais partilhas aprovadas" },
  ];

  return (
    <>
      <Cabecalho titulo="Visão geral" sub="O estado da plataforma hoje." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const corpo = (
            <>
              <span className="text-sm text-muted">{k.nome}</span>
              <span className={`num text-[32px] leading-9 font-semibold tracking-[-0.6px] ${k.alerta ? "text-warning" : ""}`}>{k.valor.toLocaleString("pt-AO")}</span>
              <span className="text-xs text-muted">{k.nota}</span>
            </>
          );
          return k.href ? (
            <Link key={k.nome} href={k.href} className="card flex flex-col gap-1 rounded-tile bg-surface p-5 text-ink no-underline">{corpo}</Link>
          ) : (
            <div key={k.nome} className="flex flex-col gap-1 rounded-tile bg-surface p-5">{corpo}</div>
          );
        })}
      </div>

      {(r.sugestoes > 0 || r.mensagens > 0) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {r.sugestoes > 0 && <Link href="/admin/catalogo?t=sugestoes" className="card rounded-[14px] bg-warning/10 px-4 py-3 text-ink no-underline">{r.sugestoes} sugestão(ões) de catálogo por rever ›</Link>}
          {r.mensagens > 0 && <Link href="/admin/mensagens" className="card rounded-[14px] bg-primary-soft px-4 py-3 text-ink no-underline">{r.mensagens} mensagem(ns) por ler ›</Link>}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[3fr_2fr]">
        <Bloco titulo="Partilhas nos últimos 30 dias">
          <div className="flex h-40 items-end gap-[3px]" role="img" aria-label="Partilhas por dia nos últimos 30 dias">
            {dias.map((d) => (
              <div key={d.dia} title={`${d.dia}: ${d.n}`} className="flex-1 rounded-t-[3px] bg-primary" style={{ height: `${Math.max(2, (d.n / maxDia) * 100)}%`, opacity: d.n ? 1 : 0.2 }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted"><span>{dataCurta(dias[0].dia)}</span><span>Hoje</span></div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
            <div><span className="block text-muted">Aprovadas</span><strong className="num text-lg">{r.aprovadas}</strong></div>
            <div><span className="block text-muted">Público</span><strong className="num text-lg text-accent">{r.publico}</strong></div>
            <div><span className="block text-muted">Privado</span><strong className="num text-lg text-primary">{r.privado}</strong></div>
          </div>
        </Bloco>

        <Bloco titulo="Por província">
          {r.por_provincia.length === 0 ? (
            <p className="m-0 text-muted">Ainda sem partilhas.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {r.por_provincia.slice(0, 10).map((p) => (
                <li key={p.nome} className="flex flex-col gap-1 text-sm">
                  <span className="flex justify-between"><span>{p.nome}</span><span className="num text-muted">{p.n}</span></span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-primary" style={{ width: `${(p.n / maxProv) * 100}%` }} /></span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      </div>

      <div className="mt-4">
        <Bloco titulo="Partilhas recentes" accao={<Link href="/admin/moderacao?estado=todas" className="text-sm">Ver todas ›</Link>}>
          <ul className="m-0 list-none p-0">
            {(recentes ?? []).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2.5 text-[15px] last:border-b-0">
                <span><strong className="font-semibold">{p.cargo_texto}</strong> <span className="text-sm text-muted">· {p.sector === "publico" ? "Público" : "Privado"} · {(p.provincias as unknown as { nome: string } | null)?.nome}</span></span>
                <span className="text-sm text-muted">{dataCurta(p.criado_em)} · {p.estado}</span>
              </li>
            ))}
          </ul>
        </Bloco>
      </div>
    </>
  );
}
