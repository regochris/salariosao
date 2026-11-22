import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { dataCurta, estados } from "@/lib/admin";
import { formatKz } from "@/lib/format";
import { moderar } from "../accoes";
import { Aviso, Cabecalho, Selo, btnPerigo, btnPrimario, btnQuieto, campo, rotulo } from "../ui";

export const metadata: Metadata = { title: "Moderação" };

type Filtros = { estado?: string; sector?: string; q?: string; ok?: string; erro?: string };
const ESTADOS = ["pendente", "aprovada", "rejeitada", "todas"] as const;

const nomeComp: Record<string, string> = {
  alimentacao: "Alimentação", transporte: "Transporte", renda: "Renda", isolamento: "Isolamento", risco: "Risco", turno: "Turno",
  comunicacoes: "Comunicações", complemento_fixo: "Complemento fixo", comissoes: "Comissões", premio_anual: "Prémio anual",
};

export default async function Moderacao({ searchParams }: { searchParams: Promise<Filtros> }) {
  const sp = await searchParams;
  const estado = (ESTADOS as readonly string[]).includes(sp.estado ?? "") ? sp.estado! : "pendente";
  const supabase = await supabaseServer();

  let consulta = supabase
    .from("partilhas")
    .select(`id, sector, cargo_id, cargo_texto, nivel, area_texto, ramo_texto, empresa_texto, orgao_tipo, exp_total, formacao, tipo_contrato, regime,
      moeda, salario_base, salario_base_kz, base_tabela_kz, ano, estado, motivo_revisao, criado_em, municipio_texto,
      cargos(nome), areas(nome), ramos(nome), provincias(nome), partilha_componentes(tipo, valor_mensal_kz, percentagem)`)
    .order("criado_em", { ascending: estado === "pendente" })
    .limit(50);
  if (estado !== "todas") consulta = consulta.eq("estado", estado);
  if (sp.sector === "publico" || sp.sector === "privado") consulta = consulta.eq("sector", sp.sector);
  if (sp.q) consulta = consulta.ilike("cargo_texto", `%${sp.q}%`);

  const [{ data: partilhas, error }, { data: cargos }] = await Promise.all([
    consulta,
    supabase.from("cargos").select("id, nome").eq("activo", true).order("nome"),
  ]);

  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ estado, ...(sp.sector ? { sector: sp.sector } : {}), ...(sp.q ? { q: sp.q } : {}), ...extra });
    return `/admin/moderacao?${p}`;
  };
  const voltar = qs({});

  return (
    <>
      <Cabecalho titulo="Moderação" sub="Partilhas marcadas automaticamente como suspeitas ou com cargo fora do catálogo." />
      <Aviso ok={sp.ok} erro={sp.erro} />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {ESTADOS.map((e) => (
          <Link key={e} href={qs({ estado: e })} aria-current={e === estado ? "page" : undefined}
            className={`plain ${e === estado ? `${btnPrimario}` : btnQuieto}`}>
            {e === "todas" ? "Todas" : estados[e].nome}
          </Link>
        ))}
        <form action="/admin/moderacao" className="ml-auto flex gap-2">
          <input type="hidden" name="estado" value={estado} />
          <select name="sector" defaultValue={sp.sector ?? ""} aria-label="Sector" className={`${campo} w-auto`}>
            <option value="">Ambos os sectores</option><option value="publico">Público</option><option value="privado">Privado</option>
          </select>
          <input name="q" defaultValue={sp.q} placeholder="Procurar cargo" aria-label="Procurar cargo" className={`${campo} w-44`} />
          <button className={btnQuieto}>Filtrar</button>
        </form>
      </div>

      {error && <p className="text-error">Erro ao carregar: {error.message}</p>}
      {partilhas && partilhas.length === 0 && (
        <div className="rounded-tile bg-surface p-8 text-center">
          <p className="m-0 font-semibold">Nada por aqui.</p>
          <p className="m-0 mt-1 text-sm text-muted">{estado === "pendente" ? "Não há partilhas à espera de moderação." : "Nenhuma partilha com estes filtros."}</p>
        </div>
      )}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {(partilhas ?? []).map((p) => {
          const rel = <T,>(x: unknown) => x as T | null;
          const cargo = rel<{ nome: string }>(p.cargos);
          const dif = p.base_tabela_kz && p.salario_base_kz ? ((Number(p.salario_base_kz) - Number(p.base_tabela_kz)) / Number(p.base_tabela_kz)) * 100 : null;
          const st = estados[p.estado as keyof typeof estados];
          return (
            <li key={p.id} className="rounded-tile bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-[17px] font-semibold">{p.cargo_texto}</strong>
                    <Selo texto={p.sector === "publico" ? "Público" : "Privado"} cor={p.sector === "publico" ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"} />
                    <Selo texto={st.nome} cor={st.cor} />
                  </div>
                  <p className="m-0 mt-1 text-sm text-muted">
                    {cargo ? `Catálogo: ${cargo.nome}` : "Sem cargo no catálogo"} · {rel<{ nome: string }>(p.areas)?.nome ?? p.area_texto ?? "sem área"}
                    {p.nivel && ` · ${p.nivel}`} · {rel<{ nome: string }>(p.provincias)?.nome}{p.municipio_texto && `, ${p.municipio_texto}`} · {dataCurta(p.criado_em)}
                  </p>
                </div>
                <div className="num text-right">
                  <div className="text-[22px] leading-7 font-semibold">{p.moeda === "AOA" ? formatKz(Number(p.salario_base)) : `${Number(p.salario_base).toLocaleString("pt-AO")} ${p.moeda === "USD" ? "USD" : "Kz (USD)"}`}</div>
                  {p.moeda !== "AOA" && <div className="text-xs text-muted">{p.salario_base_kz ? `≈ ${formatKz(Number(p.salario_base_kz))}` : "sem taxa de câmbio"}</div>}
                  {p.base_tabela_kz && (
                    <div className={`text-xs ${dif !== null && Math.abs(dif) > 15 ? "font-semibold text-warning" : "text-muted"}`}>
                      Tabela oficial {formatKz(Number(p.base_tabela_kz))}{dif !== null && ` (${dif > 0 ? "+" : ""}${dif.toFixed(0)}%)`}
                    </div>
                  )}
                </div>
              </div>

              {p.motivo_revisao && <p className="m-0 mt-3 rounded-[10px] bg-warning/10 px-3 py-2 text-sm text-warning">⚠ {p.motivo_revisao}</p>}

              <dl className="m-0 mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                {[
                  ["Entidade", p.empresa_texto ?? (p.orgao_tipo ? String(p.orgao_tipo).replace(/_/g, " ") : null)],
                  ["Ramo", rel<{ nome: string }>(p.ramos)?.nome ?? p.ramo_texto],
                  ["Experiência", p.exp_total], ["Formação", p.formacao], ["Contrato", p.tipo_contrato], ["Regime", p.regime], ["Ano", p.ano],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={String(k)} className="flex gap-1.5"><dt className="text-muted">{k}:</dt><dd className="m-0">{String(v)}</dd></div>
                ))}
              </dl>
              {p.partilha_componentes?.length > 0 && (
                <p className="num m-0 mt-2 text-sm text-muted">
                  Subsídios: {p.partilha_componentes.map((c) => `${nomeComp[c.tipo] ?? c.tipo} ${formatKz(Number(c.valor_mensal_kz))}${c.percentagem ? ` (${Number(c.percentagem)}%)` : ""}`).join(" · ")}
                </p>
              )}

              <form action={moderar} className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="voltar" value={voltar} />
                {!p.cargo_id && (
                  <label className="flex min-w-[220px] flex-1 flex-col gap-1">
                    <span className={rotulo}>Associar ao cargo do catálogo</span>
                    <select name="cargo_id" defaultValue="" className={campo}>
                      <option value="">— manter sem cargo —</option>
                      {(cargos ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </label>
                )}
                <label className="flex min-w-[200px] flex-1 flex-col gap-1">
                  <span className={rotulo}>Nota (opcional)</span>
                  <input name="motivo" placeholder="Ex.: valor confirmado pela tabela" className={campo} />
                </label>
                <div className="flex gap-2">
                  {p.estado !== "aprovada" && <button name="estado" value="aprovada" className={btnPrimario}>Aprovar</button>}
                  {p.estado !== "rejeitada" && <button name="estado" value="rejeitada" className={btnPerigo}>Rejeitar</button>}
                  {p.estado !== "pendente" && <button name="estado" value="pendente" className={btnQuieto}>Voltar a pendente</button>}
                </div>
              </form>
            </li>
          );
        })}
      </ul>
      {partilhas?.length === 50 && <p className="mt-4 text-sm text-muted">A mostrar as primeiras 50. Use os filtros para afinar.</p>}
    </>
  );
}
