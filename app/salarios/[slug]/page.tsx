import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectorBar } from "@/components/SectorBar";
import { dadosProfissao } from "@/lib/consultas";
import { formatKz, MINIMO_RESPOSTAS } from "@/lib/format";
import { utilizadorAtual, supabaseServer } from "@/lib/supabase/server";
import { h2, pillPrimary } from "@/lib/ui";

type Params = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

const nomeSubsidio: Record<string, string> = {
  alimentacao: "Subsídio de alimentação", transporte: "Subsídio de transporte", renda: "Renda / habitação", isolamento: "Isolamento / zona",
  risco: "Subsídio de risco", turno: "Turno / nocturno", comunicacoes: "Comunicações", complemento_fixo: "Complemento fixo",
  representacao: "Representação", premio_anual: "Prémio anual", comissoes: "Comissões", outro: "Outro",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const d = await dadosProfissao(slug);
  return { title: d ? `Salário de ${d.cargo}` : "Profissão" };
}

export default async function ProfissaoPage({ params }: Params) {
  const { slug } = await params;
  const d = await dadosProfissao(slug);
  if (!d) notFound();

  // Desbloqueado: quem tem pelo menos uma partilha aprovada.
  const u = await utilizadorAtual();
  let desbloqueado = false;
  if (u) {
    const supabase = await supabaseServer();
    const { count } = await supabase.from("partilhas").select("id", { count: "exact", head: true }).eq("estado", "aprovada");
    desbloqueado = (count ?? 0) > 0;
  }

  const p = d.principal;
  const temIntervalo = p && p.minimo != null && p.maximo != null && p.p25 != null && p.p75 != null && p.mediana != null && p.maximo > p.minimo;
  const pos = (v: number) => (temIntervalo ? ((v - p!.minimo!) / (p!.maximo! - p!.minimo!)) * 100 : 0);
  const max = Math.max(d.publico ?? 0, d.privado ?? 0, d.referencia?.maximo ?? 0) || null;

  return (
    <div className="mx-auto flex max-w-[1184px] flex-col gap-6 px-4 pt-8 pb-16 md:px-8">
      <nav aria-label="Caminho" className="text-sm text-muted">
        <Link href="/">Início</Link> / <Link href="/salarios">Salários</Link> / {d.cargo}
      </nav>
      <h1 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px] md:text-[40px] md:leading-[46px]">Salário de {d.cargo} em Angola</h1>

      <section className="flex flex-wrap gap-8 rounded-tile bg-surface p-6 md:p-7">
        <div className="flex flex-[1_1_260px] flex-col gap-1">
          <span className="text-sm text-muted">Mediana do salário base mensal bruto{p ? ` · ${p.sector === "publico" ? "público" : "privado"}` : ""}</span>
          <span className="num text-[40px] leading-[44px] font-semibold tracking-[-0.8px] md:text-5xl md:leading-[52px]">{formatKz(p?.mediana)}</span>
        </div>
        <div className="flex flex-[2_1_320px] flex-col justify-center gap-2.5">
          <div aria-hidden className="relative h-3.5 rounded-full bg-surface-2">
            {temIntervalo && (
              <>
                <div className="absolute inset-y-0 rounded-full bg-primary/35" style={{ left: `${pos(p!.p25!)}%`, width: `${pos(p!.p75!) - pos(p!.p25!)}%` }} />
                <div className="absolute -top-0.5 size-[18px] -translate-x-1/2 rounded-full border-[3px] border-surface bg-primary" style={{ left: `${pos(p!.mediana!)}%` }} />
              </>
            )}
          </div>
          <div className="num flex justify-between gap-2 text-[13px] leading-[18px] text-muted">
            <span>{formatKz(p?.minimo)}</span>
            <span className="text-center">Metade ganha entre {formatKz(p?.p25)} e {formatKz(p?.p75)}</span>
            <span>{formatKz(p?.maximo)}</span>
          </div>
        </div>
        <p className="m-0 basis-full border-t border-line pt-4 text-[13px] leading-[18px] text-muted">
          {d.n >= MINIMO_RESPOSTAS
            ? `Baseado em ${d.n} partilhas aprovadas. Mínimo e máximo são os percentis 10 e 90.`
            : `Ainda ${d.n === 0 ? "sem partilhas" : `só ${d.n} partilha(s)`}. Os valores aparecem a partir de ${MINIMO_RESPOSTAS}.`}
        </p>
      </section>

      <div className="flex flex-wrap gap-6">
        <section className="flex min-w-0 flex-[1_1_280px] flex-col gap-4 rounded-tile bg-surface p-6">
          <h2 className={h2}>Público vs privado</h2>
          {d.referencia && (
            <div className="flex flex-col gap-1 rounded-[14px] bg-bg p-4 text-[15px]">
              <span className="text-sm text-muted">Tabela oficial da função pública ({d.referencia.tabelas})</span>
              <span className="num font-semibold">{formatKz(d.referencia.minimo)} a {formatKz(d.referencia.maximo)}</span>
              <span className="text-xs text-muted">Vencimento base, da categoria inicial ao topo da carreira.</span>
            </div>
          )}
          <SectorBar label="Sector público (partilhas)" valor={d.publico} max={max} sector="publico" />
          <SectorBar label="Sector privado (partilhas)" valor={d.privado} max={max} sector="privado" />
        </section>
        <section className="flex min-w-0 flex-[1_1_280px] flex-col gap-1 rounded-tile bg-surface p-6">
          <h2 className={`${h2} mb-2`}>Por experiência</h2>
          {["0 a 2 anos", "3 a 5 anos", "6 a 10 anos", "Mais de 10 anos"].map((f) => {
            const e = d.experiencia.find((x) => x.experiencia === f);
            return (
              <div key={f} className="num flex justify-between border-b border-line py-2 last:border-b-0">
                <span>{f}</span><span className="font-semibold">{formatKz(e?.mediana)}</span>
              </div>
            );
          })}
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Por província</h2>
        {d.provincias.length === 0 ? (
          <p className="m-0 rounded-tile bg-surface p-5 text-[15px] text-muted">Ainda sem partilhas por província.</p>
        ) : (
          <div className="overflow-x-auto rounded-tile bg-surface">
            <table className="num w-full min-w-[480px] border-collapse text-[15px]">
              <thead><tr className="text-left text-[13px] text-muted">
                <th scope="col" className="border-b border-line px-5 py-3 font-medium">Província</th>
                <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">Mediana</th>
                <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">Respostas</th>
              </tr></thead>
              <tbody>
                {d.provincias.map((r) => (
                  <tr key={r.provincia}>
                    <td className="border-b border-line px-5 py-3">
                      {r.provincia}
                      {r.n < MINIMO_RESPOSTAS && <span className="ml-2 rounded-md border border-warning px-2 py-0.5 text-xs font-medium text-warning">Poucos dados</span>}
                    </td>
                    <td className="border-b border-line px-5 py-3 text-right font-semibold">{formatKz(r.mediana)}</td>
                    <td className="border-b border-line px-5 py-3 text-right text-muted">{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Subsídios e benefícios</h2>
        {desbloqueado ? (
          d.componentes.length + d.beneficios.length === 0 ? (
            <p className="m-0 rounded-tile bg-surface p-5 text-[15px] text-muted">Ainda não há respostas suficientes sobre subsídios para este cargo.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-12 gap-y-3 rounded-tile bg-surface p-6 sm:grid-cols-2">
              {d.componentes.map((c) => (
                <div key={c.tipo} className="num flex justify-between"><span>{nomeSubsidio[c.tipo] ?? c.tipo} <span className="text-sm text-muted">({c.pct_recebe}% recebe)</span></span><strong className="font-semibold">{formatKz(c.mediana)}</strong></div>
              ))}
              {d.beneficios.map((b) => (
                <div key={b.beneficio} className="num flex justify-between"><span>{b.beneficio}</span><strong className="font-semibold">{b.pct}%</strong></div>
              ))}
            </div>
          )
        ) : (
          <div className="relative overflow-hidden rounded-tile bg-surface">
            <div aria-hidden className="grid grid-cols-1 gap-x-12 gap-y-4 p-6 opacity-70 blur-[5px] sm:grid-cols-2">
              {["Subsídio de alimentação", "Seguro de saúde", "Subsídio de transporte", "13.º mês", "Subsídio de turno", "Viatura"].map((s) => (
                <div key={s} className="flex justify-between"><span>{s}</span><span>000 000</span></div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-6 bg-surface/55 p-6 text-center">
              <div className="flex flex-col">
                <strong className="text-lg font-semibold">Subsídios e benefícios</strong>
                <span className="text-sm text-muted">{u?.tipo === "estudante" ? "Disponível para quem partilha o salário." : "Partilhe o seu salário para desbloquear."}</span>
              </div>
              {u?.tipo !== "estudante" && <Link href="/partilhar" className={pillPrimary}>Partilhar o meu salário</Link>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
