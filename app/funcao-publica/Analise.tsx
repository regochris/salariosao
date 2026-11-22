"use client";

import { useMemo, useState } from "react";
import type { LinhaTabela } from "@/lib/consultas";
import { formatKz } from "@/lib/format";
import { field, label } from "@/lib/ui";
import { Tabelas } from "./Tabelas";

export type AbaFP = "simulador" | "comparar" | "ranking" | "tabelas";
type Municipio = { id: number; nome: string; provincia_id: number; classe: string | null };
type Incentivos = { isolamento: number; renda: number; diploma: string | null };
type Props = { abaInicial: AbaFP; linhas: LinhaTabela[]; provincias: { id: number; nome: string }[]; municipios: Municipio[]; incentivos: Incentivos };

type Carreira = {
  id: number;
  nome: string;      // nome para mostrar (com a tabela quando o nome se repete)
  tabela: string;
  degraus: LinhaTabela[]; // do mais baixo ao mais alto
  entrada: number;
  topo: number;
  crescimento: number; // topo / entrada - 1
};

const ABAS: { id: AbaFP; nome: string }[] = [
  { id: "tabelas", nome: "Tabelas" },
  { id: "simulador", nome: "Simulador" },
  { id: "comparar", nome: "Comparar" },
  { id: "ranking", nome: "Ranking" },
];

const pct = (x: number) => `${(x * 100).toLocaleString("pt-AO", { maximumFractionDigits: 0 })}%`;
const nomeDegrau = (l: LinhaTabela) => (l.variante && l.variante !== "única" ? `${l.categoria} · ${l.variante}` : l.categoria);

function agruparCarreiras(linhas: LinhaTabela[]): Carreira[] {
  const m = new Map<number, LinhaTabela[]>();
  for (const l of linhas) {
    if (!m.has(l.carreira_id)) m.set(l.carreira_id, []);
    m.get(l.carreira_id)!.push(l);
  }
  const repetidos = new Set<string>();
  const vistos = new Set<string>();
  for (const ls of m.values()) {
    if (vistos.has(ls[0].carreira)) repetidos.add(ls[0].carreira);
    vistos.add(ls[0].carreira);
  }
  return [...m.entries()].map(([id, ls]) => {
    const degraus = [...ls].sort((a, b) => a.vencimento_base - b.vencimento_base);
    const entrada = degraus[0].vencimento_base, topo = degraus[degraus.length - 1].vencimento_base;
    return {
      id, tabela: ls[0].tabela, degraus, entrada, topo, crescimento: entrada ? topo / entrada - 1 : 0,
      nome: repetidos.has(ls[0].carreira) ? `${ls[0].carreira} (${ls[0].tabela})` : ls[0].carreira,
    };
  }).sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}

export function Analise({ abaInicial, linhas, provincias, municipios, incentivos }: Props) {
  const [aba, setAba] = useState<AbaFP>(abaInicial);
  const carreiras = useMemo(() => agruparCarreiras(linhas), [linhas]);
  const mudar = (a: AbaFP) => {
    setAba(a);
    window.history.replaceState(null, "", a === "tabelas" ? "/funcao-publica" : `/funcao-publica?t=${a}`);
  };

  if (carreiras.length === 0) return <p className="m-0 rounded-tile bg-surface p-6 text-center text-muted">Tabelas oficiais ainda não disponíveis.</p>;

  return (
    <>
      <div role="tablist" aria-label="Secções" className="mx-auto flex w-full max-w-[560px] gap-1 rounded-pill bg-surface p-1">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} onClick={() => mudar(a.id)}
            className={`h-10 flex-1 rounded-pill px-2 text-[14px] font-medium transition-colors sm:text-[15px] ${aba === a.id ? "bg-bg text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "text-muted hover:text-ink"}`}>
            {a.nome}
          </button>
        ))}
      </div>
      {aba === "simulador" && <Simulador carreiras={carreiras} provincias={provincias} municipios={municipios} incentivos={incentivos} />}
      {aba === "comparar" && <Comparar carreiras={carreiras} />}
      {aba === "ranking" && <Ranking carreiras={carreiras} />}
      {aba === "tabelas" && <Tabelas linhas={linhas} />}
      <p className="m-0 px-2 text-xs text-muted">
        Vencimento base mensal ilíquido, das tabelas oficiais. Não inclui subsídios de chefia, risco ou turno, que dependem do órgão.
      </p>
    </>
  );
}

function Cartao({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-tile bg-surface p-5 md:p-6">
      <div>
        <h2 className="m-0 text-[21px] leading-7 font-bold">{titulo}</h2>
        {sub && <p className="m-0 mt-0.5 text-[15px] text-muted">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function EscolherCarreira({ id, carreiras, valor, onValor, vazio = "Escolher carreira…" }: { id: string; carreiras: Carreira[]; valor: number | null; onValor: (v: number | null) => void; vazio?: string }) {
  const porTabela = useMemo(() => {
    const m = new Map<string, Carreira[]>();
    for (const c of carreiras) {
      if (!m.has(c.tabela)) m.set(c.tabela, []);
      m.get(c.tabela)!.push(c);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt"));
  }, [carreiras]);
  return (
    <select id={id} value={valor ?? ""} onChange={(e) => onValor(e.target.value ? Number(e.target.value) : null)} className={field}>
      <option value="">{vazio}</option>
      {porTabela.map(([t, cs]) => (
        <optgroup key={t} label={t}>{cs.map((c) => <option key={c.id} value={c.id}>{c.nome.replace(` (${t})`, "")}</option>)}</optgroup>
      ))}
    </select>
  );
}

// ---------------------------------------------------------------- Simulador de carreira + incentivos

function Simulador({ carreiras, provincias, municipios, incentivos }: { carreiras: Carreira[]; provincias: Props["provincias"]; municipios: Municipio[]; incentivos: Incentivos }) {
  const [carreiraId, setCarreiraId] = useState<number | null>(null);
  const [posicao, setPosicao] = useState<number | null>(null);
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [municipioId, setMunicipioId] = useState<number | null>(null);
  const [renda, setRenda] = useState(false);

  const c = carreiras.find((x) => x.id === carreiraId);
  const i = c && posicao != null ? c.degraus.findIndex((d) => d.posicao_id === posicao) : -1;
  const actual = c && i >= 0 ? c.degraus[i] : null;
  const seguinte = c && i >= 0 && i < c.degraus.length - 1 ? c.degraus[i + 1] : null;
  const mun = municipios.find((m) => m.id === municipioId);
  const comIncentivos = mun?.classe === "C" || mun?.classe === "D";
  const extraIsol = actual && comIncentivos ? (actual.vencimento_base * incentivos.isolamento) / 100 : 0;
  const extraRenda = actual && comIncentivos && renda ? (actual.vencimento_base * incentivos.renda) / 100 : 0;

  return (
    <Cartao titulo="Simulador de carreira" sub="Veja quanto ganha hoje, quanto passa a ganhar ao subir e o efeito do município onde trabalha.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sim-carreira" className={label}>Carreira</label>
          <EscolherCarreira id="sim-carreira" carreiras={carreiras} valor={carreiraId} onValor={(v) => { setCarreiraId(v); setPosicao(null); }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sim-cat" className={label}>A sua categoria</label>
          <select id="sim-cat" value={posicao ?? ""} disabled={!c} onChange={(e) => setPosicao(e.target.value ? Number(e.target.value) : null)} className={`${field} disabled:opacity-50`}>
            <option value="">{c ? "Escolher categoria…" : "Escolha a carreira"}</option>
            {c && [...c.degraus].reverse().map((d) => <option key={d.posicao_id} value={d.posicao_id}>{nomeDegrau(d)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sim-prov" className={label}>Província <span className="font-normal text-muted">(opcional)</span></label>
          <select id="sim-prov" value={provinciaId ?? ""} onChange={(e) => { setProvinciaId(e.target.value ? Number(e.target.value) : null); setMunicipioId(null); }} className={field}>
            <option value="">—</option>
            {provincias.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sim-mun" className={label}>Município onde trabalha</label>
          <select id="sim-mun" value={municipioId ?? ""} disabled={!provinciaId} onChange={(e) => setMunicipioId(e.target.value ? Number(e.target.value) : null)} className={`${field} disabled:opacity-50`}>
            <option value="">{provinciaId ? "Escolher…" : "Escolha a província"}</option>
            {municipios.filter((m) => m.provincia_id === provinciaId).map((m) => <option key={m.id} value={m.id}>{m.nome}{m.classe ? ` (tipo ${m.classe})` : ""}</option>)}
          </select>
        </div>
      </div>

      {c && (
        <div className="flex flex-col gap-4 border-t border-line pt-4">
          {actual && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[14px] bg-bg p-4">
                <span className="block text-sm text-muted">Hoje ganha</span>
                <strong className="num text-[22px]">{formatKz(actual.vencimento_base)}</strong>
              </div>
              <div className="rounded-[14px] bg-bg p-4">
                <span className="block text-sm text-muted">Na próxima categoria</span>
                {seguinte ? (
                  <>
                    <strong className="num text-[22px] text-success">+{formatKz(seguinte.vencimento_base - actual.vencimento_base)}</strong>
                    <span className="block text-xs text-muted">{nomeDegrau(seguinte)} · +{pct(seguinte.vencimento_base / actual.vencimento_base - 1)}</span>
                  </>
                ) : <strong className="text-[17px]">Já está no topo</strong>}
              </div>
              <div className="rounded-[14px] bg-bg p-4">
                <span className="block text-sm text-muted">No topo da carreira</span>
                <strong className="num text-[22px]">{formatKz(c.topo)}</strong>
                {c.topo > actual.vencimento_base && <span className="block text-xs text-muted">+{pct(c.topo / actual.vencimento_base - 1)} face a hoje · faltam {c.degraus.length - 1 - i} degrau(s)</span>}
              </div>
            </div>
          )}

          {actual && mun && (
            comIncentivos ? (
              <div className="flex flex-col gap-2 rounded-[14px] bg-accent-soft p-4">
                <strong className="text-[15px]">{mun.nome} é um município do tipo {mun.classe}: tem direito a incentivos</strong>
                <div className="num flex justify-between text-[15px]"><span>Subsídio de isolamento ({incentivos.isolamento}%)</span><span>+{formatKz(extraIsol)}</span></div>
                <label className="flex items-center justify-between gap-3 text-[15px]">
                  <span className="flex items-center gap-2"><input type="checkbox" className="size-5" checked={renda} onChange={(e) => setRenda(e.target.checked)} /> Subsídio de renda de casa ({incentivos.renda}%)</span>
                  <span className="num">{renda ? `+${formatKz(extraRenda)}` : "—"}</span>
                </label>
                <span className="text-xs text-muted">A renda de casa é para quem não vivia na localidade antes de ser colocado.</span>
                <div className="num flex justify-between border-t border-ink/10 pt-2 text-[17px] font-semibold"><span>Total mensal estimado</span><span>{formatKz(actual.vencimento_base + extraIsol + extraRenda)}</span></div>
                {incentivos.diploma && <span className="text-xs text-muted">{incentivos.diploma}. A lista de municípios elegíveis é aprovada todos os anos.</span>}
              </div>
            ) : (
              <p className="m-0 rounded-[14px] bg-bg px-4 py-3 text-sm text-muted">{mun.nome} é do tipo {mun.classe ?? "—"}. Os incentivos de isolamento e renda de casa aplicam-se só aos municípios dos tipos C e D.</p>
            )
          )}

          <div className="flex flex-col gap-1.5">
            <strong className="text-[15px]">Todos os degraus da carreira</strong>
            <ol className="m-0 flex list-none flex-col-reverse gap-1 p-0">
              {c.degraus.map((d) => {
                const eu = d.posicao_id === actual?.posicao_id;
                return (
                  <li key={d.posicao_id}>
                    <button type="button" onClick={() => setPosicao(d.posicao_id)} className={`flex w-full flex-col gap-1 rounded-[10px] px-3 py-2 text-left transition-colors ${eu ? "bg-primary-soft" : "hover:bg-bg"}`}>
                      <span className="flex justify-between gap-3 text-sm">
                        <span className={eu ? "font-semibold text-primary" : ""}>{eu ? "● " : ""}{nomeDegrau(d)}</span>
                        <span className="num shrink-0 font-semibold">{formatKz(d.vencimento_base)}</span>
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-surface-2"><span className={`block h-full rounded-full ${eu ? "bg-primary" : "bg-accent/60"}`} style={{ width: `${(d.vencimento_base / c.topo) * 100}%` }} /></span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </Cartao>
  );
}

// ---------------------------------------------------------------- Comparar carreiras

function Comparar({ carreiras }: { carreiras: Carreira[] }) {
  const sugestao = (re: RegExp) => carreiras.find((c) => re.test(c.nome))?.id ?? null;
  const [ids, setIds] = useState<(number | null)[]>(() => [sugestao(/^Enfermagem/), sugestao(/^Professor do Ensino/), sugestao(/^Carreira Médica/)]);
  const escolhidas = ids.map((id) => carreiras.find((c) => c.id === id)).filter((c): c is Carreira => Boolean(c));
  const maximo = Math.max(1, ...escolhidas.map((c) => c.topo));
  const cores = ["bg-primary", "bg-accent", "bg-ink"];

  return (
    <Cartao titulo="Comparar carreiras" sub="Do salário de entrada ao topo de cada carreira, lado a lado.">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((k) => (
          <div key={k} className="flex flex-col gap-1.5">
            <label htmlFor={`cmp-c${k}`} className={label}>Carreira {k + 1}</label>
            <EscolherCarreira id={`cmp-c${k}`} carreiras={carreiras} valor={ids[k]} vazio="—" onValor={(v) => setIds((l) => l.map((x, j) => (j === k ? v : x)))} />
          </div>
        ))}
      </div>

      {escolhidas.length > 0 && (
        <>
          <div className="flex flex-col gap-4">
            {escolhidas.map((c, k) => (
              <div key={c.id} className="flex flex-col gap-1.5">
                <span className="flex justify-between gap-2 text-sm"><strong>{c.nome}</strong><span className="text-muted">{c.degraus.length} categorias</span></span>
                <div className="relative h-3 rounded-full bg-surface-2" role="img" aria-label={`${c.nome}: de ${formatKz(c.entrada)} a ${formatKz(c.topo)}`}>
                  <div className={`absolute inset-y-0 rounded-full ${cores[k]}`} style={{ left: `${(c.entrada / maximo) * 100}%`, width: `${Math.max(1, ((c.topo - c.entrada) / maximo) * 100)}%` }} />
                </div>
                <span className="num flex justify-between text-xs text-muted"><span>{formatKz(c.entrada)}</span><span>{formatKz(c.topo)}</span></span>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-[14px] bg-bg">
            <table className="num w-full min-w-[480px] border-collapse text-sm">
              <thead><tr className="text-left text-xs text-muted">
                <th scope="col" className="border-b border-line px-4 py-2.5 font-semibold">Carreira</th>
                <th scope="col" className="border-b border-line px-4 py-2.5 text-right font-semibold">Entrada</th>
                <th scope="col" className="border-b border-line px-4 py-2.5 text-right font-semibold">Topo</th>
                <th scope="col" className="border-b border-line px-4 py-2.5 text-right font-semibold">Crescimento</th>
              </tr></thead>
              <tbody>
                {escolhidas.map((c) => (
                  <tr key={c.id}>
                    <td className="border-b border-line px-4 py-2.5">{c.nome}</td>
                    <td className="border-b border-line px-4 py-2.5 text-right">{formatKz(c.entrada)}</td>
                    <td className="border-b border-line px-4 py-2.5 text-right font-semibold">{formatKz(c.topo)}</td>
                    <td className="border-b border-line px-4 py-2.5 text-right">+{pct(c.crescimento)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="m-0 text-xs text-muted">Entrada é a categoria mais baixa da carreira e topo a mais alta. Algumas carreiras juntam níveis de formação diferentes (ex.: técnico médio e licenciado).</p>
        </>
      )}
    </Cartao>
  );
}

// ---------------------------------------------------------------- Ranking

const CRITERIOS = [
  { id: "topo", nome: "Topo da carreira", valor: (c: Carreira) => c.topo, mostrar: (c: Carreira) => formatKz(c.topo) },
  { id: "entrada", nome: "Salário de entrada", valor: (c: Carreira) => c.entrada, mostrar: (c: Carreira) => formatKz(c.entrada) },
  { id: "crescimento", nome: "Quem mais cresce", valor: (c: Carreira) => c.crescimento, mostrar: (c: Carreira) => `+${pct(c.crescimento)}` },
] as const;

function Ranking({ carreiras }: { carreiras: Carreira[] }) {
  const [criterio, setCriterio] = useState<(typeof CRITERIOS)[number]["id"]>("topo");
  const [todas, setTodas] = useState(false);
  const [busca, setBusca] = useState("");
  const cr = CRITERIOS.find((x) => x.id === criterio)!;
  // Carreiras de uma só categoria não têm progressão: ficam fora do ranking de crescimento.
  const lista = [...carreiras].filter((c) => criterio !== "crescimento" || c.degraus.length > 1).sort((a, b) => cr.valor(b) - cr.valor(a) || a.nome.localeCompare(b.nome, "pt"));
  // A posição é sempre a do ranking completo, mesmo quando se procura uma carreira.
  // Desempate por ordem alfabética: cada carreira tem a sua posição.
  const comPosicao = lista.map((c, k) => ({ c, pos: k + 1 }));
  const q = busca.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const encontradas = q ? comPosicao.filter(({ c }) => `${c.nome} ${c.tabela}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(q)) : null;
  const mostrar = encontradas ?? (todas ? comPosicao : comPosicao.slice(0, 10));
  const max = cr.valor(lista[0]) || 1;

  return (
    <Cartao titulo="Ranking das carreiras" sub={`As ${carreiras.length} carreiras das tabelas oficiais, ordenadas.`}>
      <div className="flex flex-wrap gap-2">
        {CRITERIOS.map((x) => (
          <button key={x.id} type="button" aria-pressed={criterio === x.id} onClick={() => setCriterio(x.id)}
            className={`h-9 rounded-pill px-4 text-sm font-medium transition-colors ${criterio === x.id ? "bg-ink text-bg" : "border border-input bg-bg hover:border-ink"}`}>
            {x.nome}
          </button>
        ))}
      </div>
      <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Procurar uma carreira, ex.: professor" aria-label="Procurar carreira no ranking" className={field} />
      {encontradas && encontradas.length === 0 && <p className="m-0 text-sm text-muted">Nenhuma carreira com esse nome.</p>}
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {mostrar.map(({ c, pos }) => (
          <li key={c.id} className="flex flex-col gap-1">
            <span className="flex justify-between gap-3 text-sm">
              <span><span className="num mr-2 inline-block w-9 text-muted">{pos}.º</span>{c.nome}</span>
              <strong className="num shrink-0">{cr.mostrar(c)}</strong>
            </span>
            <span className="ml-11 h-1.5 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-accent" style={{ width: `${(cr.valor(c) / max) * 100}%` }} /></span>
          </li>
        ))}
      </ol>
      <p className="m-0 text-xs text-muted">Carreiras com o mesmo valor aparecem por ordem alfabética.</p>
      {!encontradas && lista.length > 10 && (
        <button type="button" onClick={() => setTodas((v) => !v)} className="self-start text-sm font-medium text-primary hover:text-primary-hover">
          {todas ? "Mostrar só as 10 primeiras" : `Ver todas (${lista.length})`}
        </button>
      )}
    </Cartao>
  );
}
