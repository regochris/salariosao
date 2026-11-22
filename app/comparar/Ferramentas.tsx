"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CampoDinheiro } from "@/components/CampoDinheiro";
import { inflacaoEntre, nomeMes, pct, percentil, variacaoReal, veredicto, type Quantis } from "@/lib/comparar";
import type { PontoIpc, SalarioMinimo } from "@/lib/consultas";
import { formatKz, MINIMO_RESPOSTAS } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/client";
import { field, label, pillPrimary, pillQuiet } from "@/lib/ui";

export type Aba = "mercado" | "proposta" | "poder";
type Cargo = { slug: string; nome: string; n: number };
type Provincia = { id: number; nome: string };
export type MinhaPartilha = { id: string; cargo: string; slug: string | null; sector: "publico" | "privado"; provinciaId: number; provincia: string; salario: number; ano: number; estado: string; criado_em: string };
type Props = { abaInicial: Aba; minhas: MinhaPartilha[]; cargos: Cargo[]; provincias: Provincia[]; ipc: PontoIpc[]; minimos: SalarioMinimo[] };

const ABAS: { id: Aba; nome: string }[] = [
  { id: "mercado", nome: "O meu salário" },
  { id: "proposta", nome: "Avaliar proposta" },
  { id: "poder", nome: "Poder de compra" },
];

const nomeSubsidio: Record<string, string> = {
  alimentacao: "Subsídio de alimentação", transporte: "Subsídio de transporte", renda: "Renda de casa", isolamento: "Isolamento",
  risco: "Subsídio de risco", turno: "Turno / nocturno", comunicacoes: "Comunicações", complemento_fixo: "Complemento fixo",
  comissoes: "Comissões", premio_anual: "Prémio anual",
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function Ferramentas({ abaInicial, minhas, cargos, provincias, ipc, minimos }: Props) {
  const [partilhaId, setPartilhaId] = useState(minhas[0].id);
  const minha = minhas.find((m) => m.id === partilhaId) ?? minhas[0];
  const [aba, setAba] = useState<Aba>(abaInicial);
  const mudar = (a: Aba) => {
    setAba(a);
    window.history.replaceState(null, "", a === "mercado" ? "/comparar" : `/comparar?t=${a}`);
  };
  const minimoActual = minimos.find((m) => !m.valido_ate) ?? minimos[minimos.length - 1];

  return (
    <>
      <div role="tablist" aria-label="Ferramentas" className="mx-auto flex w-full max-w-[520px] gap-1 rounded-pill bg-surface p-1">
        {ABAS.map((a) => (
          <button key={a.id} role="tab" type="button" aria-selected={aba === a.id} onClick={() => mudar(a.id)}
            className={`h-10 flex-1 rounded-pill px-2 text-[14px] font-medium transition-colors sm:text-[15px] ${aba === a.id ? "bg-bg text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12)]" : "text-muted hover:text-ink"}`}>
            {a.nome}
          </button>
        ))}
      </div>
      {minhas.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cmp-minha" className={label}>Partilha a usar</label>
          <select id="cmp-minha" value={partilhaId} onChange={(e) => setPartilhaId(e.target.value)} className={field}>
            {minhas.map((m) => <option key={m.id} value={m.id}>{m.cargo} · {m.ano} · {formatKz(m.salario)}</option>)}
          </select>
        </div>
      )}
      {aba === "mercado" && <Mercado key={minha.id} minha={minha} minimo={minimoActual} irProposta={() => { mudar("proposta"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
      {aba === "proposta" && <Proposta key={minha.id} minha={minha} cargos={cargos} provincias={provincias} />}
      {aba === "poder" && <Poder key={minha.id} minha={minha} minhas={minhas} ipc={ipc} minimos={minimos} />}
    </>
  );
}

// ---------------------------------------------------------------- partes comuns

function Cartao({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col gap-4 rounded-tile bg-surface p-5 md:p-6">{children}</section>;
}

function CampoCargo({ cargos, valor, onValor }: { cargos: Cargo[]; valor: string; onValor: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="cmp-cargo" className={label}>Cargo ou função</label>
      <input id="cmp-cargo" list="cmp-cargos" required value={valor} onChange={(e) => onValor(e.target.value)} placeholder="Comece a escrever, ex.: contabilista" className={field} />
      <datalist id="cmp-cargos">{cargos.map((c) => <option key={c.slug} value={c.nome} />)}</datalist>
    </div>
  );
}

function CampoProvincia({ provincias, valor, onValor }: { provincias: Provincia[]; valor: string; onValor: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="cmp-prov" className={label}>Província <span className="font-normal text-muted">(opcional)</span></label>
      <select id="cmp-prov" value={valor} onChange={(e) => onValor(e.target.value)} className={field}>
        <option value="">Todo o país</option>
        {provincias.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
      </select>
    </div>
  );
}

function CampoSector({ valor, onValor }: { valor: string; onValor: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="cmp-sector" className={label}>Sector</label>
      <select id="cmp-sector" value={valor} onChange={(e) => onValor(e.target.value)} className={field}>
        <option value="privado">Privado</option>
        <option value="publico">Público</option>
      </select>
    </div>
  );
}

type Estatisticas = { q: Quantis | null; nTotal: number; local: boolean; referencia: { minimo: number; maximo: number } | null };

// Lê os percentis públicos (só existem com 5+ partilhas aprovadas). Tenta primeiro a província e, sem dados, o país.
async function obterEstatisticas(slug: string, sector: string, provincia: string): Promise<Estatisticas> {
  const supabase = supabaseBrowser();
  const pedir = async (prov: number | null) => {
    const { data } = await supabase.rpc("stats_cargo", { p_slug: slug, p_sector: sector, p_provincia_id: prov });
    const r = (data ?? [])[0] as { n: number; minimo: number | null; p25: number | null; mediana: number | null; p75: number | null; maximo: number | null } | undefined;
    if (!r) return { n: 0, q: null };
    const n = Number(r.n);
    if (n < MINIMO_RESPOSTAS || r.mediana == null) return { n, q: null };
    return { n, q: { n, p10: Number(r.minimo), p25: Number(r.p25), p50: Number(r.mediana), p75: Number(r.p75), p90: Number(r.maximo) } };
  };
  const [local, nacional, ref] = await Promise.all([
    provincia ? pedir(Number(provincia)) : Promise.resolve(null),
    pedir(null),
    supabase.from("referencia_publica").select("minimo, maximo").eq("slug", slug).maybeSingle(),
  ]);
  const usar = local?.q ? local : nacional;
  return {
    q: usar.q,
    nTotal: nacional.n,
    local: Boolean(local?.q),
    referencia: ref.data ? { minimo: Number(ref.data.minimo), maximo: Number(ref.data.maximo) } : null,
  };
}

// Barra com o intervalo do mercado: P10–P90 (claro), P25–P75 (escuro) e a marca do valor.
function Regua({ q, valor, rotuloValor }: { q: Quantis; valor: number; rotuloValor: string }) {
  const min = Math.min(q.p10, valor) * 0.92, max = Math.max(q.p90, valor) * 1.05;
  const x = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2 pt-7">
      <div className="relative h-4 rounded-full bg-surface-2">
        <div className="absolute inset-y-0 rounded-full bg-primary/20" style={{ left: `${x(q.p10)}%`, width: `${x(q.p90) - x(q.p10)}%` }} />
        <div className="absolute inset-y-0 rounded-full bg-primary/45" style={{ left: `${x(q.p25)}%`, width: `${x(q.p75) - x(q.p25)}%` }} />
        <div className="absolute inset-y-[-3px] w-0.5 bg-primary" style={{ left: `${x(q.p50)}%` }} aria-hidden />
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x(valor)}%` }}>
          <span className="block size-5 rounded-full border-[3px] border-surface bg-ink" />
          <span className="num absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-ink px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-bg">{rotuloValor}</span>
        </div>
      </div>
      <div className="num grid grid-cols-3 text-xs text-muted">
        <span>10%: {formatKz(q.p10)}</span>
        <span className="text-center">Mediana: <strong className="text-ink">{formatKz(q.p50)}</strong></span>
        <span className="text-right">90%: {formatKz(q.p90)}</span>
      </div>
      <p className="m-0 text-xs text-muted">A faixa escura é onde está a metade do meio ({formatKz(q.p25)} a {formatKz(q.p75)}).</p>
    </div>
  );
}

function SemDados({ cargo, n, referencia }: { cargo: string; n: number; referencia: Estatisticas["referencia"] }) {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] bg-bg p-4">
      <p className="m-0 font-semibold">Ainda não há dados suficientes para «{cargo}».</p>
      <p className="m-0 text-[15px] text-muted">
        Mostramos o mercado a partir de {MINIMO_RESPOSTAS} partilhas aprovadas{n > 0 ? ` (há ${n} até agora)` : ""}. Assim ninguém pode ser identificado.
      </p>
      {referencia && (
        <p className="num m-0 text-[15px]">Na <strong>tabela oficial da função pública</strong>, o vencimento base deste cargo vai de <strong>{formatKz(referencia.minimo)}</strong> a <strong>{formatKz(referencia.maximo)}</strong>.</p>
      )}
      <Link href="/partilhar" className={`${pillPrimary} self-start`}>Partilhar o meu salário</Link>
    </div>
  );
}

function useCargo(cargos: Cargo[], inicial = "") {
  const [texto, setTexto] = useState(inicial);
  const cargo = useMemo(() => cargos.find((c) => norm(c.nome) === norm(texto)) ?? null, [cargos, texto]);
  return { texto, setTexto, cargo };
}

// ---------------------------------------------------------------- A. O meu salário

function Mercado({ minha, minimo, irProposta }: { minha: MinhaPartilha; minimo?: SalarioMinimo; irProposta: () => void }) {
  const [ambito, setAmbito] = useState<"provincia" | "pais">("provincia");
  const [res, setRes] = useState<Estatisticas | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!minha.slug) return;
    let activo = true;
    setRes(null);
    setErro("");
    obterEstatisticas(minha.slug, minha.sector, ambito === "provincia" ? String(minha.provinciaId) : "")
      .then((r) => activo && setRes(r))
      .catch(() => activo && setErro("Não foi possível obter os dados. Verifique a ligação."));
    return () => { activo = false; };
  }, [minha, ambito]);

  const v = res?.q ? veredicto(minha.salario, res.q) : null;
  const p = res?.q ? percentil(minha.salario, res.q) : null;

  return (
    <Cartao>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm text-muted">A sua partilha</span>
          <strong className="text-[17px]">{minha.cargo}</strong>
          <span className="num text-sm text-muted">{minha.sector === "publico" ? "Sector público" : "Sector privado"} · {minha.provincia} · {formatKz(minha.salario)}</span>
        </div>
        <div className="flex gap-1 rounded-pill bg-bg p-1 text-sm" role="group" aria-label="Comparar com">
          {(["provincia", "pais"] as const).map((a) => (
            <button key={a} type="button" aria-pressed={ambito === a} onClick={() => setAmbito(a)}
              className={`h-8 rounded-pill px-3 font-medium ${ambito === a ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}>
              {a === "provincia" ? minha.provincia || "Província" : "Todo o país"}
            </button>
          ))}
        </div>
      </div>

      {!minha.slug ? (
        <p className="m-0 rounded-[14px] bg-bg p-4 text-[15px]">O cargo que escreveu ainda está a ser associado ao catálogo pela nossa equipa. Assim que estiver, a comparação aparece aqui.</p>
      ) : erro ? (
        <p role="alert" className="m-0 text-[15px] text-error">{erro}</p>
      ) : !res ? (
        <p className="m-0 text-[15px] text-muted">A comparar…</p>
      ) : res.q && v && p != null ? (
        <>
          <div className="flex flex-col gap-1 border-t border-line pt-4">
            <strong className={`text-[28px] leading-8 font-bold tracking-[-0.5px] ${v.cor}`}>{v.titulo}</strong>
            <p className="m-0 text-[15px]">{v.texto} Estimamos que ganha mais do que <strong>{p}%</strong> das pessoas neste cargo{res.local ? ` em ${minha.provincia}` : " no país"}.</p>
          </div>
          <Regua q={res.q} valor={minha.salario} rotuloValor={`Você: ${formatKz(minha.salario)}`} />
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            <div><span className="block text-muted">Diferença para a mediana</span><strong className="num text-lg">{minha.salario >= res.q.p50 ? "+" : "−"}{formatKz(Math.abs(minha.salario - res.q.p50))}</strong></div>
            <div><span className="block text-muted">Baseado em</span><strong className="num text-lg">{res.q.n} partilhas</strong></div>
          </div>
          {ambito === "provincia" && !res.local && <p className="m-0 text-xs text-muted">Ainda há poucos dados para {minha.provincia}; comparámos com todo o país.</p>}
          {res.referencia && <p className="num m-0 text-sm text-muted">Tabela oficial da função pública para este cargo: {formatKz(res.referencia.minimo)} a {formatKz(res.referencia.maximo)}.</p>}
          {(v.nivel === "muito_abaixo" || v.nivel === "abaixo") && (
            <button type="button" onClick={irProposta} className={`${pillQuiet} self-start`}>Prepare a negociação ›</button>
          )}
        </>
      ) : (
        <SemDados cargo={minha.cargo} n={res.nTotal} referencia={res.referencia} />
      )}

      {minimo && (
        <p className="num m-0 rounded-[12px] bg-bg px-4 py-3 text-sm">
          O seu salário equivale a <strong>{(minha.salario / minimo.valor).toLocaleString("pt-AO", { maximumFractionDigits: 1 })}×</strong> o salário mínimo nacional ({formatKz(minimo.valor)}).
        </p>
      )}
    </Cartao>
  );
}

// ---------------------------------------------------------------- B. Avaliar proposta

const SUBSIDIOS_PROPOSTA = ["alimentacao", "transporte", "renda", "comunicacoes", "turno", "risco", "premio_anual"];
const BENEFICIOS_PROPOSTA = ["Seguro de saúde", "Viatura da empresa", "Telemóvel", "Formação paga"];

function Proposta({ minha, cargos, provincias }: { minha: MinhaPartilha; cargos: Cargo[]; provincias: Provincia[] }) {
  const { texto, setTexto, cargo } = useCargo(cargos, minha.slug ? minha.cargo : "");
  const [sector, setSector] = useState<string>(minha.sector);
  const [provincia, setProvincia] = useState(String(minha.provinciaId ?? ""));
  const [proposta, setProposta] = useState(0);
  const actual = minha.salario;
  const [incluidos, setIncluidos] = useState<string[]>([]);
  const [aCarregar, setACarregar] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  type Comp = { tipo: string; pct_recebe: number; mediana: number };
  type Ben = { beneficio: string; pct: number };
  const [res, setRes] = useState<(Estatisticas & { proposta: number; actual: number; cargo: string; comps: Comp[]; bens: Ben[]; incluidos: string[] }) | null>(null);

  const alternar = (k: string) => setIncluidos((l) => (l.includes(k) ? l.filter((x) => x !== k) : [...l, k]));

  async function avaliar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCopiado(false);
    if (!cargo) return setErro("Escolha o cargo da proposta a partir da lista.");
    if (!proposta) return setErro("Escreva o salário base proposto.");
    setACarregar(true);
    try {
      const supabase = supabaseBrowser();
      const [est, comps, bens] = await Promise.all([
        obterEstatisticas(cargo.slug, sector, provincia),
        supabase.rpc("stats_componentes", { p_slug: cargo.slug, p_sector: sector }),
        supabase.rpc("stats_beneficios", { p_slug: cargo.slug }),
      ]);
      setRes({
        ...est, proposta, actual, cargo: cargo.nome, incluidos,
        comps: ((comps.data ?? []) as Comp[]).map((c) => ({ ...c, pct_recebe: Number(c.pct_recebe), mediana: Number(c.mediana) })),
        bens: ((bens.data ?? []) as Ben[]).map((b) => ({ ...b, pct: Number(b.pct) })),
      });
    } catch {
      setErro("Não foi possível obter os dados. Verifique a ligação.");
    }
    setACarregar(false);
  }

  // Valor a pedir: nunca abaixo da proposta; pelo menos a mediana, e o quartil de cima quando a proposta já é boa.
  const alvo = res?.q ? Math.round(Math.max(res.proposta, res.proposta < res.q.p50 ? res.q.p50 : res.q.p75) / 1000) * 1000 : null;
  const v = res?.q ? veredicto(res.proposta, res.q) : null;
  const subidaActual = res && res.actual ? res.proposta / res.actual - 1 : null;
  const emFalta = res ? res.comps.filter((c) => c.pct_recebe >= 40 && !res.incluidos.includes(c.tipo)) : [];

  const guiao = res?.q && alvo
    ? [
        `Obrigado pela proposta para ${res.cargo}. Tenho muito interesse na função.`,
        `Pesquisei os salários de mercado: a mediana para este cargo em Angola é de ${formatKz(res.q.p50)} e metade dos profissionais ganha entre ${formatKz(res.q.p25)} e ${formatKz(res.q.p75)}.`,
        res.proposta < alvo ? `Com a minha experiência, proponho um salário base de ${formatKz(alvo)}.` : `A proposta está alinhada com o mercado e gostaria de confirmar os restantes elementos do pacote.`,
        emFalta.length ? `Gostaria também de confirmar ${emFalta.map((c) => (nomeSubsidio[c.tipo] ?? c.tipo).toLowerCase()).join(", ")}, que são habituais nesta função.` : "",
        `Pode também confirmar o pagamento do subsídio de férias e do 13.º mês?`,
      ].filter(Boolean).join(" ")
    : "";

  return (
    <>
      <Cartao>
        <form onSubmit={avaliar} noValidate className="flex flex-col gap-4">
          <CampoCargo cargos={cargos} valor={texto} onValor={setTexto} />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSector valor={sector} onValor={setSector} />
            <CampoProvincia provincias={provincias} valor={provincia} onValor={setProvincia} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prop-valor" className={label}>Salário base proposto</label>
              <CampoDinheiro id="prop-valor" valor={proposta} onValor={setProposta} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={label}>O seu salário actual</span>
              <span className="num flex h-11 items-center rounded-[10px] bg-bg px-3 text-muted">{formatKz(actual)}</span>
            </div>
          </div>
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className={`${label} mb-1.5`}>O que a proposta inclui</legend>
            <div className="flex flex-wrap gap-2">
              {[...SUBSIDIOS_PROPOSTA.map((k) => [k, nomeSubsidio[k]] as const), ...BENEFICIOS_PROPOSTA.map((b) => [b, b] as const)].map(([k, n]) => (
                <label key={k} className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-pill border px-3.5 text-sm transition-colors ${incluidos.includes(k) ? "border-primary bg-primary-soft text-primary" : "border-input bg-bg hover:border-ink"}`}>
                  <input type="checkbox" className="sr-only" checked={incluidos.includes(k)} onChange={() => alternar(k)} />
                  {incluidos.includes(k) ? "✓ " : ""}{n}
                </label>
              ))}
            </div>
          </fieldset>
          {erro && <p role="alert" className="m-0 text-[15px] text-error">{erro}</p>}
          <button disabled={aCarregar} className={`${pillPrimary} disabled:opacity-60`}>{aCarregar ? "A avaliar…" : "Avaliar proposta"}</button>
        </form>
      </Cartao>

      {res && (
        <Cartao>
          {res.q && v && alvo ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted">Proposta para {res.cargo}</span>
                <strong className={`text-[28px] leading-8 font-bold tracking-[-0.5px] ${v.cor}`}>{v.nivel === "media" ? "Proposta justa" : v.nivel.includes("abaixo") ? "Proposta abaixo do mercado" : "Boa proposta"}</strong>
                <p className="m-0 text-[15px]">
                  {res.proposta < res.q.p50
                    ? `Está ${formatKz(res.q.p50 - res.proposta)} abaixo da mediana. Tem argumentos para negociar.`
                    : `Está ${formatKz(res.proposta - res.q.p50)} acima da mediana.`}
                  {subidaActual != null && ` Em relação ao seu salário actual, é uma subida de ${pct(subidaActual)}.`}
                </p>
              </div>
              <Regua q={res.q} valor={res.proposta} rotuloValor={`Proposta: ${formatKz(res.proposta)}`} />
              <div className="flex flex-col gap-1 rounded-[14px] bg-bg p-4">
                <span className="text-sm text-muted">{res.proposta < alvo ? "Valor a pedir" : "Pode aceitar este valor"}</span>
                <strong className="num text-2xl">{formatKz(alvo)}</strong>
                {res.proposta < alvo && <span className="num text-sm text-muted">Mais {formatKz(alvo - res.proposta)} por mês, cerca de {formatKz((alvo - res.proposta) * 14)} por ano (com 13.º mês e subsídio de férias).</span>}
              </div>

              {(res.comps.length > 0 || res.bens.length > 0) && (
                <div className="flex flex-col gap-2">
                  <strong className="text-[15px]">O que costuma vir com este cargo</strong>
                  <ul className="m-0 flex list-none flex-col p-0 text-sm">
                    {res.comps.map((c) => (
                      <li key={c.tipo} className="num flex justify-between gap-2 border-b border-line py-2 last:border-b-0">
                        <span>{res.incluidos.includes(c.tipo) ? "✓" : c.pct_recebe >= 40 ? "⚠" : "·"} {nomeSubsidio[c.tipo] ?? c.tipo} <span className="text-muted">({c.pct_recebe}% recebe)</span></span>
                        <span>{formatKz(c.mediana)}</span>
                      </li>
                    ))}
                    {res.bens.map((b) => (
                      <li key={b.beneficio} className="flex justify-between gap-2 border-b border-line py-2 last:border-b-0">
                        <span>{res.incluidos.includes(b.beneficio) ? "✓" : b.pct >= 40 ? "⚠" : "·"} {b.beneficio}</span><span className="num text-muted">{b.pct}% recebe</span>
                      </li>
                    ))}
                  </ul>
                  {emFalta.length > 0 && <p className="m-0 text-xs text-warning">⚠ Habitual neste cargo, mas não está na proposta.</p>}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <strong className="text-[15px]">Texto para responder à empresa</strong>
                <p className="m-0 rounded-[14px] bg-bg p-4 text-[15px] leading-6">{guiao}</p>
                <button type="button" className={`${pillQuiet} self-start`}
                  onClick={() => navigator.clipboard?.writeText(guiao).then(() => setCopiado(true), () => setCopiado(false))}>
                  {copiado ? "Copiado ✓" : "Copiar texto"}
                </button>
              </div>
            </>
          ) : (
            <SemDados cargo={res.cargo} n={res.nTotal} referencia={res.referencia} />
          )}
        </Cartao>
      )}
    </>
  );
}

// ---------------------------------------------------------------- D. Poder de compra

function Poder({ minha, minhas, ipc, minimos }: { minha: MinhaPartilha; minhas: MinhaPartilha[]; ipc: PontoIpc[]; minimos: SalarioMinimo[] }) {
  const ultimo = ipc[ipc.length - 1];
  const meses = useMemo(() => [...ipc].reverse().slice(1), [ipc]);
  const agora = minha.salario;
  // Se tem uma partilha mais antiga, usa-a como ponto de partida.
  const anterior = minhas.find((m) => m.id !== minha.id && m.criado_em < minha.criado_em);
  const mesDe = (iso: string) => {
    const m = iso.slice(0, 7) + "-01";
    return ipc.some((p) => p.mes === m) ? m : ipc[Math.max(0, ipc.length - 13)]?.mes ?? "";
  };
  const [antes, setAntes] = useState(anterior?.salario ?? 0);
  const [mesAntes, setMesAntes] = useState(() => (anterior ? mesDe(anterior.criado_em) : ipc[Math.max(0, ipc.length - 13)]?.mes ?? ""));

  if (!ultimo) return <Cartao><p className="m-0 text-muted">Dados de inflação ainda não disponíveis.</p></Cartao>;

  const minimo = minimos.find((m) => !m.valido_ate) ?? minimos[minimos.length - 1];
  const pontoAntes = ipc.find((p) => p.mes === mesAntes);
  const inflacao = pontoAntes ? inflacaoEntre(pontoAntes.indice, ultimo.indice) : null;
  const real = antes && agora && inflacao != null ? variacaoReal(antes, agora, inflacao) : null;
  const equivalente = antes && inflacao != null ? Math.round(antes * (1 + inflacao)) : null;
  const minimoAntes = pontoAntes ? minimos.find((m) => m.valido_desde <= pontoAntes.mes && (!m.valido_ate || m.valido_ate > pontoAntes.mes)) : undefined;
  const ultimos = ipc.slice(-24).filter((p) => p.var_homologa != null);
  const maxH = Math.max(...ultimos.map((p) => p.var_homologa ?? 0), 1);

  return (
    <>
      <Cartao>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted">O seu salário base hoje</span>
            <strong className="num text-[22px]">{formatKz(agora)}</strong>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pc-antes" className={label}>Quanto ganhava antes <span className="font-normal text-muted">(opcional)</span></label>
              <CampoDinheiro id="pc-antes" valor={antes} onValor={setAntes} placeholder="Ex.: o salário do ano passado" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pc-mes" className={label}>Em que mês</label>
              <select id="pc-mes" value={mesAntes} onChange={(e) => setMesAntes(e.target.value)} className={field}>
                {meses.map((m) => <option key={m.mes} value={m.mes}>{nomeMes(m.mes)}</option>)}
              </select>
            </div>
          </div>
          {anterior && <p className="m-0 text-xs text-muted">Preenchido com a sua partilha anterior ({anterior.cargo}, {anterior.ano}).</p>}
        </div>
      </Cartao>

      {agora > 0 && (
        <Cartao>
          {minimo && (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted">Comparado com o salário mínimo nacional ({formatKz(minimo.valor)})</span>
              <strong className="num text-[28px] leading-8 font-bold">{(agora / minimo.valor).toLocaleString("pt-AO", { maximumFractionDigits: 1 })}× o salário mínimo</strong>
            </div>
          )}

          {antes > 0 && inflacao != null && real != null && equivalente != null && pontoAntes ? (
            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <strong className={`text-[22px] leading-7 font-bold ${real >= 0 ? "text-success" : "text-error"}`}>
                {real >= 0 ? `Ganhou poder de compra: ${pct(real)}` : `Perdeu poder de compra: ${pct(real)}`}
              </strong>
              <p className="m-0 text-[15px]">
                Desde {nomeMes(pontoAntes.mes)}, os preços subiram <strong>{pct(inflacao)}</strong>. Para comprar o mesmo que comprava com {formatKz(antes)}, hoje precisa de <strong className="num">{formatKz(equivalente)}</strong>.
                {agora < equivalente ? ` Faltam-lhe ${formatKz(equivalente - agora)} por mês.` : ` Está ${formatKz(agora - equivalente)} acima disso.`}
              </p>
              <div className="num grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-[12px] bg-bg p-3"><span className="block text-xs text-muted">Aumento recebido</span><strong>{pct(agora / antes - 1)}</strong></div>
                <div className="rounded-[12px] bg-bg p-3"><span className="block text-xs text-muted">Inflação</span><strong>{pct(inflacao)}</strong></div>
                <div className="rounded-[12px] bg-bg p-3"><span className="block text-xs text-muted">Ganho real</span><strong className={real >= 0 ? "text-success" : "text-error"}>{pct(real)}</strong></div>
              </div>
              {minimoAntes && minimo && minimoAntes.valor !== minimo.valor && (
                <p className="num m-0 text-sm text-muted">
                  Nesse mês, ganhava {(antes / minimoAntes.valor).toLocaleString("pt-AO", { maximumFractionDigits: 1 })}× o salário mínimo da altura ({formatKz(minimoAntes.valor)}); hoje ganha {(agora / minimo.valor).toLocaleString("pt-AO", { maximumFractionDigits: 1 })}×.
                </p>
              )}
            </div>
          ) : (
            ultimo.var_homologa != null && (
              <p className="num m-0 border-t border-line pt-4 text-[15px]">
                Nos últimos 12 meses os preços subiram <strong>{ultimo.var_homologa.toLocaleString("pt-AO")}%</strong>. Há um ano, {formatKz(Math.round(agora / (1 + ultimo.var_homologa / 100)))} compravam o mesmo que {formatKz(agora)} hoje. Indique o salário anterior para ver se o seu aumento compensou.
              </p>
            )
          )}
        </Cartao>
      )}

      <Cartao>
        <div className="flex flex-col gap-1">
          <strong className="text-[17px]">Inflação nos últimos 24 meses</strong>
          <span className="text-sm text-muted">Variação dos preços face ao mesmo mês do ano anterior (INE)</span>
        </div>
        <div className="flex h-32 items-end gap-[3px]" role="img" aria-label={`Inflação homóloga: ${ultimo.var_homologa}% em ${nomeMes(ultimo.mes)}`}>
          {ultimos.map((p) => (
            <div key={p.mes} title={`${nomeMes(p.mes)}: ${p.var_homologa}%`} className="flex-1 rounded-t-[3px] bg-accent" style={{ height: `${((p.var_homologa ?? 0) / maxH) * 100}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted"><span>{ultimos[0] && nomeMes(ultimos[0].mes)}</span><span>{nomeMes(ultimo.mes)}: <strong className="text-ink">{ultimo.var_homologa}%</strong></span></div>
        <p className="m-0 text-xs text-muted">
          Fonte: INE, Índice de Preços no Consumidor Nacional. {ultimo.calculado ? "Os índices de 2026 foram calculados a partir das variações publicadas pelo INE." : ""} Salário mínimo: {minimo?.diploma ?? "—"}.
        </p>
      </Cartao>
    </>
  );
}
