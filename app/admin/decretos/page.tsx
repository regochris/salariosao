import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { dataCurta } from "@/lib/admin";
import { formatKz } from "@/lib/format";
import { guardarComponente, guardarIpc, guardarSalarioMinimo, guardarTaxa, novoAjuste } from "../accoes";
import { Aviso, Bloco, Cabecalho, Selo, btnPrimario, btnQuieto, campo, rotulo } from "../ui";
import { AjusteForm } from "./AjusteForm";

export const metadata: Metadata = { title: "Decretos e tabelas" };

export default async function Decretos({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await supabaseServer();
  const [{ data: diplomas }, { data: grupos }, { data: valores }, { data: comps }, { data: taxas }, { count: nPos }] = await Promise.all([
    supabase.from("diplomas").select("id, tipo, numero, titulo, data_efeitos, url, notas").order("data_efeitos", { ascending: false }),
    supabase.from("grupos_pessoal").select("id, nome").order("id"),
    supabase.from("valores_indice_100").select("grupo_id, diploma_id, valor, valido_desde, valido_ate").order("valido_desde", { ascending: false }),
    supabase.from("componentes").select("id, nome, tipo, valor, condicao, diploma_id, valido_desde, valido_ate, tabelas_salariais(nome), carreiras(nome), categorias(nome)").order("id"),
    supabase.from("taxas_cambio").select("mes, usd_kz, fonte").order("mes", { ascending: false }).limit(12),
    supabase.from("posicoes").select("id", { count: "exact", head: true }),
  ]);
  const [{ data: ipc }, { data: minimos }] = await Promise.all([
    supabase.from("ipc").select("mes, indice, var_homologa, calculado").order("mes", { ascending: false }).limit(6),
    supabase.from("salario_minimo").select("valor, valido_desde, valido_ate, diploma").order("valido_desde", { ascending: false }),
  ]);

  const hoje = new Date().toISOString().slice(0, 10);

  // Meses para escolher: começa no mês anterior ao actual (o INE publica cada mês no início do seguinte)
  // e recua 15 meses. A lista é calculada em cada visita, por isso avança sozinha. Os já registados podem ser corrigidos.
  const registados = new Set((ipc ?? []).map((p) => String(p.mes).slice(0, 7)));
  const { data: todosIpc } = await supabase.from("ipc").select("mes").gte("mes", `${Number(hoje.slice(0, 4)) - 2}-01-01`);
  for (const p of todosIpc ?? []) registados.add(String(p.mes).slice(0, 7));
  const mesesIpc = Array.from({ length: 15 }, (_, k) => {
    const d = new Date(Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)) - 2 - k, 1);
    const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { valor, nome: d.toLocaleDateString("pt-AO", { month: "long", year: "numeric" }), registado: registados.has(valor) };
  });
  const emVigor = (g: number) => valores?.find((v) => v.grupo_id === g && v.valido_desde <= hoje && (!v.valido_ate || v.valido_ate > hoje));
  const nome = (x: unknown) => (x as { nome: string } | null)?.nome;

  return (
    <>
      <Cabecalho titulo="Decretos e tabelas" sub={`Função pública: ${nPos ?? 0} posições salariais calculadas a partir do valor do índice 100.`} />
      <Aviso ok={sp.ok} erro={sp.erro} />

      <div className="flex flex-col gap-4">
        <Bloco titulo="Valor do índice 100 em vigor">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {(grupos ?? []).map((g) => {
              const v = emVigor(g.id);
              const d = diplomas?.find((x) => x.id === v?.diploma_id);
              return (
                <div key={g.id} className="flex flex-col gap-0.5 rounded-[14px] bg-bg p-4">
                  <span className="text-sm text-muted">{g.nome}</span>
                  <span className="num text-xl font-semibold">{v ? formatKz(Number(v.valor)) : "Sem valor"}</span>
                  {d && <span className="text-xs text-muted">{d.numero} · desde {dataCurta(v!.valido_desde)}</span>}
                </div>
              );
            })}
          </div>
          <p className="m-0 mt-3 text-xs text-muted">Vencimento base = índice da categoria ÷ 100 × valor do índice 100 do grupo.</p>
        </Bloco>

        <Bloco titulo="Registar novo ajuste geral">
          <AjusteForm accao={novoAjuste} grupos={(grupos ?? []).map((g) => ({ id: g.id, nome: g.nome, actual: emVigor(g.id) ? Number(emVigor(g.id)!.valor) : null }))} />
          <p className="m-0 mt-4 rounded-[12px] bg-bg px-4 py-3 text-sm text-muted">
            Um decreto que crie carreiras ou categorias novas, ou mude os índices, precisa de carregar a tabela completa. Envie o link do decreto ao Claude para a carregar.
          </p>
        </Bloco>

        <Bloco titulo="Diplomas registados">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {(diplomas ?? []).map((d) => {
              const cs = (comps ?? []).filter((c) => c.diploma_id === d.id);
              return (
                <li key={d.id} className="rounded-[14px] bg-bg p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="font-semibold">{d.numero}</strong>
                    <Selo texto={d.tipo === "ajuste_geral" ? "Ajuste geral" : d.tipo === "ajuste_sectorial" ? "Ajuste sectorial" : d.tipo === "estrutura" ? "Estrutura" : "Outro"} cor="bg-accent-soft text-accent" />
                    <span className="text-sm text-muted">Efeitos: {dataCurta(d.data_efeitos)}</span>
                    {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-sm">Texto ↗</a>}
                  </div>
                  <p className="m-0 mt-1 text-sm">{d.titulo}</p>
                  {d.notas && <p className="m-0 mt-1 text-xs text-muted">{d.notas}</p>}
                  {cs.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-primary">{cs.length} subsídio(s) e suplemento(s) ›</summary>
                      <ul className="m-0 mt-2 list-none p-0">
                        {cs.map((c) => (
                          <li key={c.id} className="border-t border-line py-2.5">
                            <form action={guardarComponente} className="grid gap-2 md:grid-cols-[2.5fr_110px_2.5fr_150px_auto] md:items-end">
                              <input type="hidden" name="voltar" value="/admin/decretos" />
                              <input type="hidden" name="id" value={c.id} />
                              <div className="text-sm">
                                <strong className="font-semibold">{c.nome}</strong>
                                <span className="block text-xs text-muted">{[nome(c.tabelas_salariais), nome(c.carreiras), nome(c.categorias)].filter(Boolean).join(" · ") || "Geral"}</span>
                              </div>
                              <label className="flex flex-col gap-1"><span className={rotulo}>{c.tipo === "percentagem" ? "%" : "Kz"}</span><input name="valor" defaultValue={Number(c.valor)} inputMode="decimal" className={campo} /></label>
                              <label className="flex flex-col gap-1"><span className={rotulo}>Condição</span><input name="condicao" defaultValue={c.condicao ?? ""} className={campo} /></label>
                              <label className="flex flex-col gap-1"><span className={rotulo}>Válido até</span><input name="valido_ate" type="date" defaultValue={c.valido_ate ?? ""} className={campo} /></label>
                              <button className={btnQuieto}>Guardar</button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              );
            })}
          </ul>
        </Bloco>

        <Bloco titulo="Inflação (INE)">
          <p className="m-0 mb-3 text-sm text-muted">Usada na ferramenta «Poder de compra». Actualize todos os meses quando o INE publicar o IPCN.</p>
          <form action={guardarIpc} className="mb-4 flex flex-wrap items-end gap-2">
            <input type="hidden" name="voltar" value="/admin/decretos" />
            <label className="flex flex-col gap-1"><span className={rotulo}>Mês</span>
              <select name="mes" required defaultValue={mesesIpc.find((m) => !m.registado)?.valor ?? mesesIpc[0]?.valor} className={campo}>
                {mesesIpc.map((m) => <option key={m.valor} value={m.valor}>{m.nome}{m.registado ? " (já registado — substituir)" : ""}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1"><span className={rotulo}>Variação homóloga (%)</span><input name="var_homologa" required inputMode="decimal" placeholder="Ex.: 8,16" className={campo} /></label>
            <label className="flex flex-col gap-1"><span className={rotulo}>Índice (opcional)</span><input name="indice" inputMode="decimal" placeholder="Calculado se vazio" className={campo} /></label>
            <button className={btnPrimario}>Guardar mês</button>
          </form>
          <ul className="num m-0 list-none p-0 text-sm">
            {(ipc ?? []).map((p) => (
              <li key={p.mes} className="flex justify-between border-b border-line py-2 last:border-b-0">
                <span>{p.mes.slice(0, 7)}{p.calculado && <span className="ml-2 text-xs text-muted">(índice calculado)</span>}</span>
                <span>{Number(p.var_homologa).toLocaleString("pt-AO")}% · índice {Number(p.indice).toLocaleString("pt-AO")}</span>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Salário mínimo nacional">
          <form action={guardarSalarioMinimo} className="mb-4 grid gap-2 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
            <input type="hidden" name="voltar" value="/admin/decretos" />
            <label className="flex flex-col gap-1"><span className={rotulo}>Novo valor (Kz)</span><input name="valor" required inputMode="numeric" className={campo} /></label>
            <label className="flex flex-col gap-1"><span className={rotulo}>Em vigor desde</span><input name="valido_desde" type="date" required className={campo} /></label>
            <label className="flex flex-col gap-1"><span className={rotulo}>Diploma</span><input name="diploma" placeholder="Ex.: Decreto Presidencial n.º …" className={campo} /></label>
            <button className={btnPrimario}>Guardar</button>
          </form>
          <ul className="num m-0 list-none p-0 text-sm">
            {(minimos ?? []).map((m) => (
              <li key={m.valido_desde} className="flex flex-wrap justify-between gap-2 border-b border-line py-2 last:border-b-0">
                <span>{formatKz(Number(m.valor))} {!m.valido_ate && <Selo texto="Em vigor" cor="bg-success/15 text-success" />}</span>
                <span className="text-muted">{dataCurta(m.valido_desde)}{m.valido_ate ? ` – ${dataCurta(m.valido_ate)}` : ""}{m.diploma ? ` · ${m.diploma}` : ""}</span>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Taxa de câmbio (USD → Kz)">
          <p className="m-0 mb-3 text-sm text-muted">Usada para converter salários em dólares. Sem taxa do mês, as partilhas em USD ficam pendentes.</p>
          <form action={guardarTaxa} className="mb-4 flex flex-wrap items-end gap-2">
            <input type="hidden" name="voltar" value="/admin/decretos" />
            <label className="flex flex-col gap-1"><span className={rotulo}>Mês</span><input name="mes" type="month" required defaultValue={hoje.slice(0, 7)} className={campo} /></label>
            <label className="flex flex-col gap-1"><span className={rotulo}>1 USD = Kz</span><input name="usd_kz" required inputMode="decimal" placeholder="Ex.: 912,50" className={campo} /></label>
            <button className={btnPrimario}>Guardar taxa</button>
          </form>
          {(taxas ?? []).length > 0 ? (
            <ul className="num m-0 list-none p-0 text-sm">
              {taxas!.map((t) => <li key={t.mes} className="flex justify-between border-b border-line py-2 last:border-b-0"><span>{t.mes.slice(0, 7)}</span><span>{Number(t.usd_kz).toLocaleString("pt-AO")} Kz</span></li>)}
            </ul>
          ) : (
            <p className="m-0 text-sm text-warning">Ainda não há nenhuma taxa registada.</p>
          )}
        </Bloco>
      </div>
    </>
  );
}
