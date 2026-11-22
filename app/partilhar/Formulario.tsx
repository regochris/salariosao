"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldIcon } from "@/components/Icons";
import { supabaseBrowser } from "@/lib/supabase/client";
import { formatKz } from "@/lib/format";
import { field, label, pillPrimary, pillQuiet } from "@/lib/ui";

export type Catalogo = {
  areas: { id: number; nome: string }[];
  cargos: { id: number; nome: string; sinonimos: string[]; area_id: number | null }[];
  provincias: { id: number; nome: string }[];
  ramos: { id: number; nome: string }[];
  municipios: { id: number; nome: string; provincia_id: number; classe: string | null }[];
  posicoes: {
    anexo: string; tabela: string; tabela_id: number; carreira: string; carreira_id: number;
    categoria: string; categoria_id: number; ordem: number; posicao_id: number; variante: string; vencimento_base: number;
  }[];
};

const TOTAL = 6;
const titulos: Record<number, [string, string]> = {
  1: ["Qual é o seu cargo?", "Use o nome que aparece no seu contrato."],
  2: ["Onde trabalha?", "Para comparar com quem está no mesmo sector."],
  3: ["O seu perfil", "Onde trabalha e a sua experiência."],
  4: ["O seu contrato", "O tipo de vínculo e o regime de trabalho."],
  5: ["Quanto ganha?", "O salário base mensal, antes de impostos. O líquido calculamos nós."],
  6: ["Extras e benefícios", "Tudo opcional, mas ajuda muito."],
};
const orgaos: [string, string][] = [
  ["ministerio", "Ministério"], ["governo_provincial", "Governo provincial"], ["administracao_municipal", "Administração municipal"],
  ["empresa_publica", "Empresa pública"], ["instituto_publico", "Instituto público"], ["outro", "Outro"],
];
// DP n.º 67/23, art. 5: nos municípios dos tipos C e D, isolamento e renda de casa = 30% do salário base.
const PERCENTUAIS_PUBLICO = ["renda", "isolamento"];
const PCT_DP_67_23 = 30;
const niveis: [string, string][] = [
  ["Estagiário", "Estagiário"],
  ["Sem chefia", "Profissional, sem chefia"],
  ["Sénior", "Sénior / especialista, sem chefia"],
  ["Chefia", "Chefia (coordenador, supervisor, chefe de secção)"],
  ["Direcção", "Direcção (chefe de departamento, director)"],
];
const subsidios: [string, string][] = [
  ["alimentacao", "Alimentação"], ["transporte", "Transporte"], ["renda", "Renda / habitação"], ["isolamento", "Isolamento / zona"],
  ["risco", "Risco"], ["turno", "Turno / nocturno"], ["comunicacoes", "Comunicações"], ["complemento_fixo", "Complemento fixo"],
];
const beneficios = ["Seguro de saúde", "Seguro com família", "Viatura", "Combustível", "Formação paga", "Plano de pensões"];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
// Aceita "250 000", "250.000", "250000,50". Fica só com a parte inteira (Kz).
const valor = (v: FormDataEntryValue | string | null) => Number(String(v ?? "").split(",")[0].replace(/\D/g, "")) || 0;
const agrupar = (s: string) => {
  const d = s.split(",")[0].replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Campo de dinheiro: só aceita algarismos e mostra os milhares separados ("250 000").
function Dinheiro({ id, valorInicial = "", placeholder = "0", grande, required, onValor }: { id: string; valorInicial?: string; placeholder?: string; grande?: boolean; required?: boolean; onValor?: (v: number) => void }) {
  const [v, setV] = useState(valorInicial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onValor?.(valor(valorInicial)); }, []);
  return (
    <input
      id={id} name={id} type="text" inputMode="numeric" autoComplete="off" required={required}
      value={v} placeholder={placeholder}
      onChange={(e) => { const f = agrupar(e.target.value); setV(f); onValor?.(valor(f)); }}
      className={`${field} num ${grande ? "h-14 text-[22px] font-semibold" : ""}`}
    />
  );
}

function Campo({ id, nome, opcional, children }: { id: string; nome: string; opcional?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={label}>{nome} {opcional && <span className="font-normal text-muted">(opcional)</span>}</label>
      {children}
    </div>
  );
}
function Opcoes({ id, opcoes, required = true }: { id: string; opcoes: (string | [string | number, string])[]; required?: boolean }) {
  return (
    <select id={id} name={id} required={required} className={field} defaultValue="">
      <option value="" disabled>Escolher…</option>
      {opcoes.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>))}
    </select>
  );
}

export function Formulario({ catalogo, autorId }: { catalogo: Catalogo; autorId: string }) {
  const [passo, setPasso] = useState(1);
  const [sector, setSector] = useState<"publico" | "privado">("privado");
  const [tabelaId, setTabelaId] = useState<number | null>(null);
  const [carreiraId, setCarreiraId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [posicaoId, setPosicaoId] = useState<number | null>(null);
  const [provinciaId, setProvinciaId] = useState<number | null>(null);
  const [municipioId, setMunicipioId] = useState<number | null>(null);
  const [base, setBase] = useState(0);
  const [pct, setPct] = useState<Record<string, number>>({});
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState("");
  const [feito, setFeito] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const tabelas = useMemo(() => [...new Map(catalogo.posicoes.map((p) => [p.tabela_id, p])).values()], [catalogo.posicoes]);
  const carreiras = useMemo(() => [...new Map(catalogo.posicoes.filter((p) => p.tabela_id === tabelaId).map((p) => [p.carreira_id, p])).values()], [catalogo.posicoes, tabelaId]);
  const categorias = useMemo(() => [...new Map(catalogo.posicoes.filter((p) => p.carreira_id === carreiraId).map((p) => [p.categoria_id, p])).values()], [catalogo.posicoes, carreiraId]);
  const variantes = useMemo(() => catalogo.posicoes.filter((p) => p.categoria_id === categoriaId), [catalogo.posicoes, categoriaId]);
  const posicao = catalogo.posicoes.find((p) => p.posicao_id === (posicaoId ?? (variantes.length === 1 ? variantes[0].posicao_id : -1)));

  const municipioSel = catalogo.municipios.find((m) => m.id === municipioId);
  const incentivosCD = sector === "publico" && (municipioSel?.classe === "C" || municipioSel?.classe === "D");

  const passoValido = () => {
    const bloco = formRef.current?.querySelector<HTMLElement>(`[data-passo="${passo}"]`);
    const campos = bloco ? Array.from(bloco.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")) : [];
    return campos.every((c) => c.reportValidity());
  };

  const enviar = async () => {
    if (!formRef.current) return;
    setErro("");
    setAEnviar(true);
    const f = new FormData(formRef.current);
    const cargoTexto = String(f.get("cargo")).trim();
    const cargo = catalogo.cargos.find((c) => norm(c.nome) === norm(cargoTexto) || c.sinonimos.some((s) => norm(s) === norm(cargoTexto)));
    const supabase = supabaseBrowser();
    const municipio = catalogo.municipios.find((m) => m.id === Number(f.get("municipio")));

    const { data, error } = await supabase
      .from("partilhas")
      .insert({
        autor_id: autorId,
        sector,
        cargo_id: cargo?.id ?? null,
        cargo_texto: cargoTexto,
        nivel: f.get("nivel") || null,
        area_id: Number(f.get("area")) || cargo?.area_id || null,
        ramo_id: sector === "privado" ? Number(f.get("ramo")) || null : null,
        dimensao: sector === "privado" ? f.get("dimensao") || null : null,
        empresa_texto: String(f.get("empresa") ?? "").trim() || null,
        orgao_tipo: sector === "publico" ? f.get("orgao") || null : null,
        posicao_id: sector === "publico" ? posicao?.posicao_id ?? null : null,
        provincia_id: Number(f.get("provincia")),
        municipio_id: municipio?.id ?? null,
        municipio_texto: municipio?.nome ?? null,
        exp_total: f.get("exp") || null,
        exp_cargo: f.get("expc") || null,
        formacao: f.get("formacao") || null,
        certificacoes: String(f.get("cert") ?? "").trim() || null,
        tipo_contrato: f.get("tipo") || null,
        horario: f.get("horario") || null,
        regime: f.get("regime") || null,
        moeda: f.get("moeda"),
        salario_base: valor(f.get("base")),
        ano: Number(f.get("ano")),
        subsidio_ferias: f.get("ferias") === "on",
        decimo_terceiro: f.get("decimo") === "on",
        genero: f.get("genero") || null,
        contratacao: f.get("contratacao") || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      setAEnviar(false);
      setErro(error?.code === "23505" ? "Já partilhou este emprego para este ano. Pode actualizá-lo na sua conta." : "Não foi possível enviar. Verifique a ligação e tente de novo.");
      return;
    }

    const baseKz = valor(f.get("base"));
    const comps = [
      ...subsidios.map(([k]) => {
        if (incentivosCD && PERCENTUAIS_PUBLICO.includes(k)) {
          const p = pct[k] ?? 0;
          return { tipo: k, v: Math.round((baseKz * p) / 100), percentagem: p || null };
        }
        return { tipo: k, v: valor(f.get(`sb-${k}`)), percentagem: null };
      }),
      { tipo: "comissoes", v: valor(f.get("comissoes")), percentagem: null },
      { tipo: "premio_anual", v: valor(f.get("premio")), percentagem: null },
    ]
      .filter((c) => c.v > 0)
      .map((c) => ({ partilha_id: data.id, tipo: c.tipo, valor_mensal_kz: c.v, percentagem: c.percentagem }));
    const bens = f.getAll("beneficios").map((b) => ({ partilha_id: data.id, beneficio: String(b) }));
    await Promise.all([
      comps.length ? supabase.from("partilha_componentes").insert(comps) : null,
      bens.length ? supabase.from("partilha_beneficios").insert(bens) : null,
    ]);
    setAEnviar(false);
    setFeito(true);
  };

  if (feito) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16 text-center">
        <div className="flex size-[72px] items-center justify-center rounded-full bg-primary-soft text-primary">
          <svg aria-hidden width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
        </div>
        <h1 className="m-0 mt-2 text-[32px] leading-9 font-bold tracking-[-0.6px]">Obrigado.</h1>
        <p className="m-0 max-w-[32ch] text-[17px] text-muted">A sua partilha foi recebida e ajuda milhares de pessoas a negociar melhor.</p>
        <Link href="/salarios" className={`${pillPrimary} mt-4 h-12 px-7`}>Ver salários</Link>
        <Link href="/conta" className="flex min-h-11 items-center">Ver as minhas partilhas ›</Link>
      </div>
    );
  }

  const [titulo, sub] = titulos[passo];
  const botaoSector = (v: "publico" | "privado", nome: string) => (
    <button type="button" aria-pressed={sector === v} onClick={() => setSector(v)}
      className={`btn min-h-12 rounded-pill text-ink ${sector === v ? "border-2 border-primary bg-primary-soft font-semibold" : "border border-input bg-bg hover:bg-surface"}`}>
      {nome}
    </button>
  );
  const dinheiro = (id: string, ph = "Kz") => <Dinheiro id={id} placeholder={ph} />;
  const municipiosDaProvincia = catalogo.municipios.filter((m) => m.provincia_id === provinciaId);

  return (
    <form ref={formRef} noValidate onSubmit={(e) => { e.preventDefault(); if (!passoValido()) return; if (passo < TOTAL) setPasso(passo + 1); else enviar(); }} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-medium text-muted">
          <span>Partilhar salário</span>
          <span className="num">Passo {passo} de {TOTAL}</span>
        </div>
        <div aria-hidden className="grid grid-cols-6 gap-1">
          {Array.from({ length: TOTAL }, (_, n) => <div key={n} className={`h-1 rounded-full ${n < passo ? "bg-primary" : "bg-surface-2"}`} />)}
        </div>
      </div>

      <div>
        <h1 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px]">{titulo}</h1>
        <p className="m-0 mt-1.5 text-[15px] leading-[22px] text-muted">{sub}</p>
      </div>

      {/* Todos os passos ficam no formulário (escondidos) para não perder o que se escreveu. */}
      <div data-passo="1" hidden={passo !== 1} className="flex flex-col gap-5">
        <Campo id="cargo" nome="Cargo ou função">
          <input id="cargo" name="cargo" required list="lista-cargos" placeholder="Ex.: Enfermeiro geral" className={field} />
          <datalist id="lista-cargos">{catalogo.cargos.map((c) => <option key={c.id} value={c.nome} />)}</datalist>
        </Campo>
        <Campo id="area" nome="Área"><Opcoes id="area" opcoes={catalogo.areas.map((a) => [a.id, a.nome])} /></Campo>
        <Campo id="nivel" nome="Responsabilidade">
          <Opcoes id="nivel" opcoes={niveis} />
          <span className="text-xs leading-4 text-muted">Ex.: um professor ou enfermeiro sem cargo de chefia escolhe «Profissional, sem chefia». Um director de escola escolhe «Direcção».</span>
        </Campo>
      </div>

      <div data-passo="2" hidden={passo !== 2} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Sector">
          {botaoSector("privado", "Privado")}
          {botaoSector("publico", "Público")}
        </div>
        {sector === "publico" ? (
          <>
            <Campo id="orgao" nome="Tipo de órgão"><Opcoes id="orgao" opcoes={orgaos} /></Campo>
            <Campo id="tabela" nome="Tabela salarial">
              <select id="tabela" required className={field} value={tabelaId ?? ""} onChange={(e) => { setTabelaId(Number(e.target.value)); setCarreiraId(null); setCategoriaId(null); setPosicaoId(null); }}>
                <option value="" disabled>Escolher…</option>
                {tabelas.map((t) => <option key={t.tabela_id} value={t.tabela_id}>{t.tabela}</option>)}
              </select>
            </Campo>
            {tabelaId && (
              <Campo id="carreira" nome="Carreira">
                <select id="carreira" required className={field} value={carreiraId ?? ""} onChange={(e) => { setCarreiraId(Number(e.target.value)); setCategoriaId(null); setPosicaoId(null); }}>
                  <option value="" disabled>Escolher…</option>
                  {carreiras.map((c) => <option key={c.carreira_id} value={c.carreira_id}>{c.carreira}</option>)}
                </select>
              </Campo>
            )}
            {carreiraId && (
              <Campo id="categoria" nome="Categoria">
                <select id="categoria" required className={field} value={categoriaId ?? ""} onChange={(e) => { setCategoriaId(Number(e.target.value)); setPosicaoId(null); }}>
                  <option value="" disabled>Escolher…</option>
                  {categorias.map((c) => <option key={c.categoria_id} value={c.categoria_id}>{c.categoria}</option>)}
                </select>
              </Campo>
            )}
            {variantes.length > 1 && (
              <Campo id="variante" nome="Unidade / nível">
                <select id="variante" required className={field} value={posicaoId ?? ""} onChange={(e) => setPosicaoId(Number(e.target.value))}>
                  <option value="" disabled>Escolher…</option>
                  {variantes.map((v) => <option key={v.posicao_id} value={v.posicao_id}>{v.variante}</option>)}
                </select>
              </Campo>
            )}
            {posicao && (
              <p className="num m-0 rounded-[14px] bg-accent-soft px-4 py-3 text-[15px]">
                Vencimento base na tabela oficial: <strong className="font-semibold">{formatKz(posicao.vencimento_base)}</strong>
              </p>
            )}
          </>
        ) : (
          <>
            <Campo id="ramo" nome="Ramo de actividade"><Opcoes id="ramo" opcoes={catalogo.ramos.map((r) => [r.id, r.nome])} /></Campo>
            <Campo id="dimensao" nome="Dimensão da empresa"><Opcoes id="dimensao" opcoes={["Até 10 trabalhadores", "11 a 50", "51 a 250", "Mais de 250"]} /></Campo>
          </>
        )}
        <Campo id="empresa" nome="Nome da empresa ou organismo" opcional>
          <input id="empresa" name="empresa" className={field} />
          <span className="text-xs text-muted">Só aparece com pelo menos 5 partilhas da mesma entidade.</span>
        </Campo>
      </div>

      <div data-passo="3" hidden={passo !== 3} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Campo id="provincia" nome="Província">
            <select id="provincia" name="provincia" required className={field} value={provinciaId ?? ""} onChange={(e) => { setProvinciaId(Number(e.target.value)); setMunicipioId(null); }}>
              <option value="" disabled>Escolher…</option>
              {catalogo.provincias.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </Campo>
          <Campo id="municipio" nome="Município">
            <select key={provinciaId ?? 0} id="municipio" name="municipio" required disabled={!provinciaId} className={`${field} disabled:opacity-50`} value={municipioId ?? ""} onChange={(e) => setMunicipioId(Number(e.target.value))}>
              <option value="" disabled>{provinciaId ? "Escolher…" : "Escolha a província"}</option>
              {municipiosDaProvincia.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </Campo>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo id="exp" nome="Experiência total"><Opcoes id="exp" opcoes={["0 a 2 anos", "3 a 5 anos", "6 a 10 anos", "Mais de 10 anos"]} /></Campo>
          <Campo id="expc" nome="No cargo actual"><Opcoes id="expc" opcoes={["Menos de 1 ano", "1 a 3 anos", "Mais de 3 anos"]} /></Campo>
        </div>
        <Campo id="formacao" nome="Formação"><Opcoes id="formacao" opcoes={["Ensino médio", "Bacharelato", "Licenciatura", "Mestrado", "Doutoramento"]} /></Campo>
        <Campo id="cert" nome="Certificações" opcional><input id="cert" name="cert" placeholder="Ex.: ACCA, PMP, CCNA" className={field} /></Campo>
      </div>

      <div data-passo="4" hidden={passo !== 4} className="flex flex-col gap-5">
        <Campo id="tipo" nome="Tipo de contrato"><Opcoes id="tipo" opcoes={["Efectivo (tempo indeterminado)", "A prazo", "Prestação de serviços"]} /></Campo>
        <Campo id="horario" nome="Horário"><Opcoes id="horario" opcoes={["Tempo inteiro", "Tempo parcial"]} /></Campo>
        <Campo id="regime" nome="Regime"><Opcoes id="regime" opcoes={["Normal", "Por turnos", "Onshore com rotação", "Offshore com rotação"]} /></Campo>
      </div>

      <div data-passo="5" hidden={passo !== 5} className="flex flex-col gap-5">
        <Campo id="base" nome="Salário base mensal bruto">
          <Dinheiro
            key={posicao?.posicao_id ?? "livre"}
            id="base" grande required onValor={setBase}
            valorInicial={posicao ? agrupar(String(Math.round(posicao.vencimento_base))) : ""}
            placeholder="Ex.: 250 000"
          />
          {posicao && <span className="text-xs leading-4 text-muted">Preenchido com o valor da tabela oficial. Altere se o seu recibo indicar outro valor.</span>}
        </Campo>
        <Campo id="moeda" nome="Moeda">
          <select id="moeda" name="moeda" className={field} defaultValue="AOA">
            <option value="AOA">Kwanza (Kz)</option><option value="USD">Dólar (USD)</option><option value="AOA_USD">Kz indexado ao dólar</option>
          </select>
        </Campo>
        <Campo id="ano" nome="Ano a que se refere"><Opcoes id="ano" opcoes={[[2026, "2026"], [2025, "2025"]]} /></Campo>
        {incentivosCD && (
          <div className="flex flex-col gap-1 rounded-[14px] bg-accent-soft p-4">
            <p className="m-0 text-[15px] font-semibold">Incentivos do município {municipioSel?.nome} (tipo {municipioSel?.classe})</p>
            <p className="m-0 text-[13px] leading-[18px] text-muted">Decreto Presidencial n.º 67/23: {PCT_DP_67_23}% do salário base. Marque os que recebe.</p>
            {([["isolamento", "Subsídio de isolamento", ""], ["renda", "Subsídio de renda de casa", "Para quem não vivia nesta localidade antes de ser colocado."]] as const).map(([k, n, nota]) => (
              <label key={k} className="flex min-h-11 items-start gap-2.5 pt-2">
                <input type="checkbox" className="mt-0.5 size-5" checked={(pct[k] ?? 0) > 0} onChange={(e) => setPct({ ...pct, [k]: e.target.checked ? PCT_DP_67_23 : 0 })} />
                <span className="flex flex-col">
                  <span>{n} <span className="num text-muted">· ≈ {formatKz(Math.round((base * PCT_DP_67_23) / 100))}/mês</span></span>
                  {nota && <span className="text-xs text-muted">{nota}</span>}
                </span>
              </label>
            ))}
          </div>
        )}
        <p className="m-0 text-[15px] font-semibold">Subsídios mensais <span className="font-normal text-muted">(os que recebe)</span></p>
        <div className="grid grid-cols-2 gap-3">
          {subsidios.filter(([k]) => !(incentivosCD && PERCENTUAIS_PUBLICO.includes(k))).map(([k, n]) => (
            <Campo key={k} id={`sb-${k}`} nome={n}>{dinheiro(`sb-${k}`)}</Campo>
          ))}
        </div>
        <label className="flex min-h-11 items-center gap-2.5"><input type="checkbox" name="ferias" className="size-5" /> Recebo subsídio de férias</label>
        <label className="flex min-h-11 items-center gap-2.5"><input type="checkbox" name="decimo" className="size-5" /> Recebo 13.º mês (subsídio de Natal)</label>
      </div>

      <div data-passo="6" hidden={passo !== 6} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Campo id="premio" nome="Prémio anual" opcional>{dinheiro("premio", "Kz por ano")}</Campo>
          <Campo id="comissoes" nome="Comissões" opcional>{dinheiro("comissoes", "Kz por mês")}</Campo>
        </div>
        <p className="m-0 text-[15px] font-semibold">Benefícios</p>
        <div className="flex flex-wrap gap-2">
          {beneficios.map((b) => (
            <label key={b} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-input bg-bg px-3.5 transition-colors hover:bg-surface">
              <input type="checkbox" name="beneficios" value={b} className="size-[18px]" /> {b}
            </label>
          ))}
        </div>
        <p className="m-0 text-[15px] font-semibold">Para estatística <span className="font-normal text-muted">(opcional, só em agregados)</span></p>
        <div className="grid grid-cols-2 gap-3">
          <Campo id="genero" nome="Género" opcional><Opcoes id="genero" required={false} opcoes={["Prefiro não dizer", "Feminino", "Masculino"]} /></Campo>
          <Campo id="contratacao" nome="Contratação" opcional><Opcoes id="contratacao" required={false} opcoes={["Prefiro não dizer", "Nacional", "Expatriado"]} /></Campo>
        </div>
      </div>

      {erro && <p role="alert" className="m-0 rounded-[12px] bg-surface px-4 py-3 text-[15px] text-error">{erro}</p>}

      <p className="m-0 flex gap-2 rounded-[14px] bg-surface px-3.5 py-3 text-[13px] leading-[18px] text-muted">
        <ShieldIcon size={18} className="shrink-0 text-primary" />
        Partilha anónima. Nunca mostramos respostas individuais.
      </p>

      <div className="sticky bottom-[76px] grid grid-cols-[1fr_2fr] gap-2 bg-bg py-3 md:bottom-0">
        <button type="button" onClick={() => setPasso((p) => Math.max(1, p - 1))} disabled={passo === 1} className={`${pillQuiet} h-12 disabled:opacity-40`}>Voltar</button>
        <button type="submit" disabled={aEnviar} className={`${pillPrimary} h-12 disabled:opacity-50`}>
          {aEnviar ? "A enviar…" : passo === TOTAL ? "Enviar partilha" : "Continuar"}
        </button>
      </div>
    </form>
  );
}
