"use client";

import Link from "next/link";
import { useState } from "react";
import { carreirasPublicas, provinciasAngola } from "@/lib/dados";
import { ShieldIcon } from "@/components/Icons";
import { field, label, pillPrimary, pillQuiet } from "@/lib/ui";

const TOTAL = 6;

const titulos: Record<number, [string, string]> = {
  1: ["Qual é o seu cargo?", "Use o nome que aparece no seu contrato."],
  2: ["Onde trabalha?", "Para comparar com quem está no mesmo sector."],
  3: ["O seu perfil", "Onde trabalha e a sua experiência."],
  4: ["O seu contrato", "O tipo de vínculo e o regime de trabalho."],
  5: ["Quanto ganha?", "O salário base mensal, antes de impostos. O líquido calculamos nós."],
  6: ["Extras e benefícios", "Tudo opcional, mas ajuda muito."],
};

function Campo({ id, nome, children, opcional }: { id: string; nome: string; children: React.ReactNode; opcional?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={label}>
        {nome} {opcional && <span className="font-normal text-muted">(opcional)</span>}
      </label>
      {children}
    </div>
  );
}

function Opcoes({ id, opcoes }: { id: string; opcoes: string[] }) {
  return (
    <select id={id} name={id} className={field}>
      {opcoes.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

const dinheiro = (id: string, ph = "Kz") => (
  <input id={id} name={id} inputMode="numeric" placeholder={ph} className={field} />
);

export function Formulario() {
  const [passo, setPasso] = useState(1);
  const [sector, setSector] = useState<"publico" | "privado">("publico");

  // TODO (fase 4): gravar a partilha no Supabase no último passo (com regras RLS).
  const seguinte = () => setPasso((p) => Math.min(TOTAL + 1, p + 1));
  const anterior = () => setPasso((p) => Math.max(1, p - 1));

  if (passo > TOTAL) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16 text-center">
        <div className="flex size-[72px] items-center justify-center rounded-full bg-primary-soft text-primary">
          <svg aria-hidden width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
        </div>
        <h1 className="m-0 mt-2 text-[32px] leading-9 font-bold tracking-[-0.6px]">Obrigado.</h1>
        <p className="m-0 max-w-[30ch] text-[17px] text-muted">
          A sua partilha ajuda milhares de pessoas a negociar melhor. Os dados completos estão desbloqueados.
        </p>
        <Link href="/salarios" className={`${pillPrimary} mt-4 h-12 px-7`}>Ver salários</Link>
        <Link href="/" className="flex min-h-11 items-center no-underline">Voltar ao início ›</Link>
      </div>
    );
  }

  const [titulo, sub] = titulos[passo];
  const botaoSector = (v: "publico" | "privado", nome: string) => (
    <button
      type="button"
      aria-pressed={sector === v}
      onClick={() => setSector(v)}
      className={`min-h-12 rounded-pill ${sector === v ? "border-2 border-primary bg-primary-soft font-semibold" : "border border-line bg-bg"} text-ink`}
    >
      {nome}
    </button>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); seguinte(); }} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-medium text-muted">
          <span>Partilhar salário</span>
          <span className="num">Passo {passo} de {TOTAL}</span>
        </div>
        <div aria-hidden className="grid grid-cols-6 gap-1">
          {Array.from({ length: TOTAL }, (_, n) => (
            <div key={n} className={`h-1 rounded-full ${n < passo ? "bg-primary" : "bg-surface-2"}`} />
          ))}
        </div>
      </div>

      <div>
        <h1 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px]">{titulo}</h1>
        <p className="m-0 mt-1.5 text-[15px] leading-[22px] text-muted">{sub}</p>
      </div>

      {passo === 1 && (
        <div className="flex flex-col gap-5">
          <Campo id="cargo" nome="Cargo ou função"><input id="cargo" name="cargo" required placeholder="Ex.: Enfermeiro geral" className={field} /></Campo>
          <Campo id="area" nome="Área"><Opcoes id="area" opcoes={["Saúde", "Finanças e contabilidade", "Tecnologia", "Educação", "Engenharia", "Administração", "Comercial e vendas", "Direito"]} /></Campo>
          <Campo id="nivel" nome="Nível"><Opcoes id="nivel" opcoes={["Estagiário", "Técnico", "Técnico sénior", "Chefe de secção", "Chefe de departamento", "Director"]} /></Campo>
        </div>
      )}

      {passo === 2 && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Sector">
            {botaoSector("publico", "Público")}
            {botaoSector("privado", "Privado")}
          </div>
          {sector === "publico" ? (
            <>
              <Campo id="orgao" nome="Órgão"><Opcoes id="orgao" opcoes={["Ministério", "Governo provincial", "Administração municipal", "Empresa pública", "Instituto público"]} /></Campo>
              <Campo id="carreira" nome="Carreira"><Opcoes id="carreira" opcoes={carreirasPublicas.map((c) => c.nome)} /></Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo id="categoria" nome="Categoria"><input id="categoria" name="categoria" className={field} /></Campo>
                <Campo id="escalao" nome="Escalão"><Opcoes id="escalao" opcoes={["1.º", "2.º", "3.º", "4.º", "5.º"]} /></Campo>
              </div>
            </>
          ) : (
            <>
              <Campo id="ramo" nome="Ramo de actividade"><Opcoes id="ramo" opcoes={["Petróleo e gás", "Banca e seguros", "Telecomunicações", "Saúde privada", "Ensino privado", "Comércio", "Construção", "ONG e cooperação", "Outro"]} /></Campo>
              <Campo id="dimensao" nome="Dimensão da empresa"><Opcoes id="dimensao" opcoes={["Até 10 trabalhadores", "11 a 50", "51 a 250", "Mais de 250"]} /></Campo>
            </>
          )}
          <Campo id="empresa" nome="Nome da empresa ou organismo" opcional>
            <input id="empresa" name="empresa" className={field} />
            <span className="text-xs text-muted">Só aparece com pelo menos 5 partilhas da mesma entidade.</span>
          </Campo>
        </div>
      )}

      {passo === 3 && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Campo id="provincia" nome="Província"><Opcoes id="provincia" opcoes={provinciasAngola} /></Campo>
            <Campo id="municipio" nome="Município"><input id="municipio" name="municipio" className={field} /></Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="exp" nome="Experiência total"><Opcoes id="exp" opcoes={["0 a 2 anos", "3 a 5 anos", "6 a 10 anos", "Mais de 10"]} /></Campo>
            <Campo id="expc" nome="No cargo actual"><Opcoes id="expc" opcoes={["Menos de 1 ano", "1 a 3 anos", "Mais de 3"]} /></Campo>
          </div>
          <Campo id="formacao" nome="Formação"><Opcoes id="formacao" opcoes={["Ensino médio", "Bacharelato", "Licenciatura", "Mestrado", "Doutoramento"]} /></Campo>
          <Campo id="cert" nome="Certificações" opcional><input id="cert" name="cert" placeholder="Ex.: ACCA, PMP, CCNA" className={field} /></Campo>
        </div>
      )}

      {passo === 4 && (
        <div className="flex flex-col gap-5">
          <Campo id="tipo" nome="Tipo de contrato"><Opcoes id="tipo" opcoes={["Efectivo (tempo indeterminado)", "A prazo", "Prestação de serviços"]} /></Campo>
          <Campo id="horario" nome="Horário"><Opcoes id="horario" opcoes={["Tempo inteiro", "Tempo parcial"]} /></Campo>
          <Campo id="regime" nome="Regime"><Opcoes id="regime" opcoes={["Normal", "Por turnos", "Onshore com rotação", "Offshore com rotação"]} /></Campo>
        </div>
      )}

      {passo === 5 && (
        <div className="flex flex-col gap-5">
          <Campo id="base" nome="Salário base mensal bruto">
            <div className="flex gap-2">
              <input id="base" name="base" required inputMode="numeric" placeholder="0" className={`${field} num flex-1 text-[22px] font-semibold`} />
              <select aria-label="Moeda" name="moeda" className={`${field} w-28`}><option>Kz</option><option>USD</option><option>Kz indexado ao USD</option></select>
            </div>
          </Campo>
          <Campo id="ano" nome="Ano a que se refere"><Opcoes id="ano" opcoes={["2026", "2025"]} /></Campo>
          <p className="m-0 text-[15px] font-semibold">Subsídios mensais <span className="font-normal text-muted">(os que recebe)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="sb-al" nome="Alimentação">{dinheiro("sb-al")}</Campo>
            <Campo id="sb-tr" nome="Transporte">{dinheiro("sb-tr")}</Campo>
            <Campo id="sb-re" nome="Renda / habitação">{dinheiro("sb-re")}</Campo>
            <Campo id="sb-is" nome="Isolamento / zona">{dinheiro("sb-is")}</Campo>
            <Campo id="sb-ri" nome="Risco">{dinheiro("sb-ri")}</Campo>
            <Campo id="sb-tu" nome="Turno / nocturno">{dinheiro("sb-tu")}</Campo>
          </div>
          <label className="flex min-h-11 items-center gap-2.5"><input type="checkbox" name="ferias" className="size-5" /> Recebo subsídio de férias</label>
          <label className="flex min-h-11 items-center gap-2.5"><input type="checkbox" name="decimo" className="size-5" /> Recebo 13.º mês (subsídio de Natal)</label>
        </div>
      )}

      {passo === 6 && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Campo id="premio" nome="Prémio anual">{dinheiro("premio", "Kz por ano")}</Campo>
            <Campo id="comissoes" nome="Comissões">{dinheiro("comissoes", "Kz por mês")}</Campo>
          </div>
          <p className="m-0 text-[15px] font-semibold">Benefícios</p>
          <div className="flex flex-wrap gap-2">
            {["Seguro de saúde", "Seguro com família", "Viatura", "Combustível", "Formação paga", "Plano de pensões"].map((b) => (
              <label key={b} className="flex min-h-11 items-center gap-2 rounded-pill bg-surface px-3.5">
                <input type="checkbox" name="beneficios" value={b} className="size-[18px]" /> {b}
              </label>
            ))}
          </div>
          <p className="m-0 text-[15px] font-semibold">Para estatística <span className="font-normal text-muted">(opcional, só em agregados)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <Campo id="genero" nome="Género"><Opcoes id="genero" opcoes={["Prefiro não dizer", "Feminino", "Masculino"]} /></Campo>
            <Campo id="contratacao" nome="Contratação"><Opcoes id="contratacao" opcoes={["Prefiro não dizer", "Nacional", "Expatriado"]} /></Campo>
          </div>
        </div>
      )}

      <p className="m-0 flex gap-2 rounded-[14px] bg-surface px-3.5 py-3 text-[13px] leading-[18px] text-muted">
        <ShieldIcon size={18} className="shrink-0 text-primary" />
        Partilha anónima. Nunca mostramos respostas individuais.
      </p>

      <div className="sticky bottom-[76px] grid grid-cols-[1fr_2fr] gap-2 bg-bg py-3 md:bottom-0">
        <button type="button" onClick={anterior} disabled={passo === 1} className={`${pillQuiet} h-12 disabled:opacity-40`}>Voltar</button>
        <button type="submit" className={`${pillPrimary} h-12`}>{passo === TOTAL ? "Enviar partilha" : "Continuar"}</button>
      </div>
    </form>
  );
}
