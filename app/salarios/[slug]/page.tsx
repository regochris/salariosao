import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectorBar } from "@/components/SectorBar";
import { getProfissao, profissoes, provinciasAngola } from "@/lib/dados";
import { formatKz, MINIMO_RESPOSTAS } from "@/lib/format";
import { field, h2, label, pillPrimary, pillQuiet } from "@/lib/ui";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return profissoes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProfissao(slug);
  return { title: p ? `Salário de ${p.cargo}` : "Profissão" };
}

export default async function ProfissaoPage({ params }: Params) {
  const { slug } = await params;
  const p = getProfissao(slug);
  if (!p) notFound();

  const max = Math.max(p.publico ?? 0, p.privado ?? 0) || null;
  const temIntervalo = p.minimo != null && p.maximo != null && p.p25 != null && p.p75 != null && p.mediana != null;
  const pos = (v: number) => (temIntervalo ? ((v - p.minimo!) / (p.maximo! - p.minimo!)) * 100 : 0);
  // TODO (fase 4): saber se o utilizador já partilhou (sessão Supabase).
  const desbloqueado = false;

  return (
    <div className="mx-auto flex max-w-[1184px] flex-col gap-6 px-4 pt-8 pb-16 md:px-8">
      <nav aria-label="Caminho" className="text-sm text-muted">
        <Link href="/">Início</Link> / <Link href={`/salarios?q=${encodeURIComponent(p.area)}`}>{p.area}</Link> / {p.cargo}
      </nav>
      <h1 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px] md:text-[40px] md:leading-[46px]">
        Salário de {p.cargo} em Angola
      </h1>

      <div className="flex flex-wrap items-start gap-8">
        {/* Filtros */}
        <form className="flex min-w-0 flex-[1_1_240px] flex-col gap-4 rounded-tile bg-surface p-5">
          <strong className="font-semibold">Filtros</strong>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-prov" className={label}>Província</label>
            <select id="f-prov" name="provincia" className={field} defaultValue="">
              <option value="">Todas</option>
              {provinciasAngola.map((pr) => <option key={pr}>{pr}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-sector" className={label}>Sector</label>
            <select id="f-sector" name="sector" className={field}>
              <option value="">Público e privado</option>
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-exp" className={label}>Experiência</label>
            <select id="f-exp" name="experiencia" className={field}>
              <option value="">Qualquer</option>
              {p.porExperiencia.map((e) => <option key={e.faixa}>{e.faixa}</option>)}
            </select>
          </div>
          <button type="submit" className={pillQuiet}>Aplicar filtros</button>
        </form>

        <div className="flex min-w-0 flex-[999_1_640px] flex-col gap-6">
          {/* Cartão principal */}
          <section className="flex flex-wrap gap-8 rounded-tile bg-surface p-6 md:p-7">
            <div className="flex flex-[1_1_260px] flex-col gap-1">
              <span className="text-sm text-muted">Mediana do salário base mensal bruto</span>
              <span className="num text-[40px] leading-[44px] font-semibold tracking-[-0.8px] md:text-5xl md:leading-[52px]">
                {formatKz(p.mediana)}
              </span>
              <span className="num text-[15px] text-muted">Líquido estimado: {formatKz(p.liquido)}</span>
            </div>
            <div className="flex flex-[2_1_320px] flex-col justify-center gap-2.5">
              <div aria-hidden className="relative h-3.5 rounded-full bg-surface-2">
                {temIntervalo && (
                  <>
                    <div className="absolute inset-y-0 rounded-full bg-primary/35" style={{ left: `${pos(p.p25!)}%`, width: `${pos(p.p75!) - pos(p.p25!)}%` }} />
                    <div className="absolute -top-0.5 size-[18px] -translate-x-1/2 rounded-full border-[3px] border-surface bg-primary" style={{ left: `${pos(p.mediana!)}%` }} />
                  </>
                )}
              </div>
              <div className="num flex justify-between gap-2 text-[13px] leading-[18px] text-muted">
                <span>Mín. {formatKz(p.minimo)}</span>
                <span className="text-center">Metade ganha entre {formatKz(p.p25)} e {formatKz(p.p75)}</span>
                <span>Máx. {formatKz(p.maximo)}</span>
              </div>
            </div>
            <p className="m-0 basis-full border-t border-line pt-4 text-[13px] leading-[18px] text-muted">
              {p.respostas == null
                ? "Ainda sem respostas suficientes. Os valores aparecem a partir de 5 partilhas."
                : `Baseado em ${p.respostas} respostas · Partilhas + tabela oficial`}
            </p>
          </section>

          <div className="flex flex-wrap gap-6">
            <section className="flex min-w-0 flex-[1_1_280px] flex-col gap-4 rounded-tile bg-surface p-6">
              <h2 className={h2}>Público vs privado</h2>
              <SectorBar label="Sector público" valor={p.publico} max={max} sector="publico" />
              <SectorBar label="Sector privado" valor={p.privado} max={max} sector="privado" />
            </section>
            <section className="flex min-w-0 flex-[1_1_280px] flex-col gap-1 rounded-tile bg-surface p-6">
              <h2 className={`${h2} mb-2`}>Por experiência</h2>
              {p.porExperiencia.map((e) => (
                <div key={e.faixa} className="num flex justify-between border-b border-line py-2 last:border-b-0">
                  <span>{e.faixa}</span>
                  <span className="font-semibold">{formatKz(e.mediana)}</span>
                </div>
              ))}
            </section>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className={h2}>Por província</h2>
            <div className="overflow-x-auto rounded-tile bg-surface">
              <table className="num w-full min-w-[480px] border-collapse text-[15px]">
                <thead>
                  <tr className="text-left text-[13px] text-muted">
                    <th scope="col" className="border-b border-line px-5 py-3 font-medium">Província</th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">Mediana</th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">Respostas</th>
                  </tr>
                </thead>
                <tbody>
                  {p.porProvincia.map((r) => (
                    <tr key={r.provincia}>
                      <td className="border-b border-line px-5 py-3">
                        {r.provincia}
                        {r.respostas != null && r.respostas < MINIMO_RESPOSTAS && (
                          <span className="ml-2 rounded-md border border-warning px-2 py-0.5 text-xs font-medium text-warning">Poucos dados</span>
                        )}
                      </td>
                      <td className="border-b border-line px-5 py-3 text-right font-semibold">{formatKz(r.mediana)}</td>
                      <td className="border-b border-line px-5 py-3 text-right text-muted">{r.respostas ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Subsídios: bloqueados até partilhar */}
          {!desbloqueado && (
            <section className="relative overflow-hidden rounded-tile bg-surface">
              <div aria-hidden className="grid grid-cols-1 gap-x-12 gap-y-4 p-6 opacity-70 blur-[5px] sm:grid-cols-2">
                {["Subsídio de alimentação", "Seguro de saúde", "Subsídio de transporte", "13.º mês", "Subsídio de turno", "Viatura"].map((s) => (
                  <div key={s} className="flex justify-between"><span>{s}</span><span>000 000</span></div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-6 bg-surface/55 p-6 text-center">
                <div className="flex flex-col">
                  <strong className="text-lg font-semibold">Subsídios e benefícios</strong>
                  <span className="text-sm text-muted">Partilhe o seu salário para desbloquear.</span>
                </div>
                <Link href="/partilhar" className={pillPrimary}>Partilhar o meu salário</Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
