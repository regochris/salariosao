import { supabaseServer } from "@/lib/supabase/server";

// Consultas públicas. Só usam funções de estatística (agregados com 5+ respostas) e dados oficiais.

export type CargoLista = { slug: string; cargo: string; area: string | null; n: number; mediana: number | null; sector_dominante: "publico" | "privado" | null };

export async function listaCargos(q?: string): Promise<CargoLista[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("lista_cargos", { p_q: q ?? null });
  return (data ?? []).map((r: CargoLista) => ({ ...r, n: Number(r.n), mediana: r.mediana == null ? null : Number(r.mediana) }));
}

export type Ranking = { cargo: string; slug: string; publico: number | null; privado: number | null };

export async function rankingCargos(limite = 6): Promise<Ranking[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("ranking_cargos", { p_limite: limite });
  return (data ?? []).map((r: { cargo: string; slug: string; mediana_publico: number | null; mediana_privado: number | null }) => ({
    cargo: r.cargo,
    slug: r.slug,
    publico: r.mediana_publico == null ? null : Number(r.mediana_publico),
    privado: r.mediana_privado == null ? null : Number(r.mediana_privado),
  }));
}

const num = (v: unknown) => (v == null ? null : Number(v));

export async function dadosProfissao(slug: string) {
  const supabase = await supabaseServer();
  const { data: cargo } = await supabase.from("cargos").select("id, nome, slug, areas(nome)").eq("slug", slug).maybeSingle();
  if (!cargo) return null;

  const [porSector, provincias, experiencia, componentes, beneficios, referencia] = await Promise.all([
    supabase.rpc("stats_cargo", { p_slug: slug }),
    supabase.rpc("stats_cargo_provincias", { p_slug: slug }),
    supabase.rpc("stats_cargo_experiencia", { p_slug: slug }),
    supabase.rpc("stats_componentes", { p_slug: slug }),
    supabase.rpc("stats_beneficios", { p_slug: slug }),
    supabase.from("referencia_publica").select("minimo, maximo, posicoes, tabelas").eq("slug", slug).maybeSingle(),
  ]);

  type S = { sector: "publico" | "privado"; n: number; minimo: number; p25: number; mediana: number; p75: number; maximo: number };
  const sectores = (porSector.data ?? []) as S[];
  const n = sectores.reduce((t, s) => t + Number(s.n), 0);
  // Mediana global: usa o sector com mais respostas (simplificação até haver função própria)
  const principal = [...sectores].sort((a, b) => Number(b.n) - Number(a.n))[0];

  return {
    cargo: cargo.nome as string,
    area: (cargo.areas as unknown as { nome: string } | null)?.nome ?? null,
    n,
    principal: principal
      ? { sector: principal.sector, n: Number(principal.n), minimo: num(principal.minimo), p25: num(principal.p25), mediana: num(principal.mediana), p75: num(principal.p75), maximo: num(principal.maximo) }
      : null,
    publico: num(sectores.find((s) => s.sector === "publico")?.mediana),
    privado: num(sectores.find((s) => s.sector === "privado")?.mediana),
    provincias: ((provincias.data ?? []) as { provincia: string; n: number; mediana: number | null }[]).map((p) => ({ ...p, n: Number(p.n), mediana: num(p.mediana) })),
    experiencia: ((experiencia.data ?? []) as { experiencia: string; n: number; mediana: number | null }[]).map((e) => ({ ...e, n: Number(e.n), mediana: num(e.mediana) })),
    componentes: ((componentes.data ?? []) as { tipo: string; pct_recebe: number; mediana: number }[]).map((c) => ({ ...c, pct_recebe: Number(c.pct_recebe), mediana: Number(c.mediana) })),
    beneficios: ((beneficios.data ?? []) as { beneficio: string; pct: number }[]).map((b) => ({ ...b, pct: Number(b.pct) })),
    referencia: referencia.data ? { minimo: Number(referencia.data.minimo), maximo: Number(referencia.data.maximo), posicoes: Number(referencia.data.posicoes), tabelas: referencia.data.tabelas as string } : null,
  };
}

export type LinhaTabela = { tabela_id: number; anexo: string; tabela: string; carreira: string; categoria: string; variante: string; indice: number | null; vencimento_base: number; diploma: string };

export async function tabelaFuncaoPublica(): Promise<LinhaTabela[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("tabela_vigente")
    .select("tabela_id, anexo, tabela, carreira, carreira_id, categoria, ordem, variante, indice, vencimento_base, diploma")
    .order("tabela_id").order("carreira_id").order("ordem")
    .limit(2000);
  return (data ?? []).map((r) => ({ ...r, indice: num(r.indice), vencimento_base: Number(r.vencimento_base) })) as LinhaTabela[];
}
