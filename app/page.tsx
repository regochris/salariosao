import Link from "next/link";
import { Hero } from "@/components/Hero";
import { RankingGrafico } from "@/components/RankingGrafico";
import { maisPesquisados, sectorLabel } from "@/lib/dados";
import { formatKz } from "@/lib/format";
import { pillOutline, pillPrimary } from "@/lib/ui";


export default function Inicio() {

  return (
    <>
      <Hero />

      {/* Público vs privado (bloco escuro) */}
      <section className="ink flex flex-col items-center gap-2 bg-bg px-5 py-16 text-center text-ink md:gap-3 md:py-22">
        <h2 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px] md:text-5xl md:leading-[52px] md:tracking-[-1px]">
          Público vs privado.
        </h2>
        <p className="m-0 text-[19px] leading-[26px] text-muted md:text-2xl md:leading-8">As profissões mais bem pagas, lado a lado.</p>
        <div className="mt-8 flex w-full justify-center md:mt-12">
          <RankingGrafico />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:mt-10">
          <Link href="/salarios" className={pillPrimary}>Ver todas as profissões</Link>
          <Link href="/metodologia" className={pillOutline}>Saiba mais</Link>
        </div>
      </section>

      {/* Tiles */}
      <section className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-2">
        <Link href="/calculadora" className="card flex min-h-[440px] flex-col items-center gap-2 rounded-tile bg-surface px-5 pt-11 pb-6 text-center text-ink no-underline md:min-h-[520px] md:px-8 md:pt-14">
          <h3 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">Calculadora</h3>
          <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">Do bruto ao líquido, em segundos.</p>
          <span className="text-primary">Calcular ›</span>
          <div className="mt-auto flex w-full max-w-[320px] flex-col gap-3 rounded-tile bg-bg p-6 text-left text-[15px]">
            <div className="num flex justify-between"><span className="text-muted">Salário bruto</span><span className="font-semibold">— Kz</span></div>
            <div className="num flex justify-between"><span className="text-muted">IRT</span><span>— Kz</span></div>
            <div className="num flex justify-between"><span className="text-muted">Segurança Social (3%)</span><span>— Kz</span></div>
            <div className="num flex justify-between border-t border-line pt-3 text-[19px]"><span className="font-semibold">Líquido</span><span className="font-bold">— Kz</span></div>
          </div>
        </Link>

        <Link href="/funcao-publica" className="card ink flex min-h-[440px] flex-col items-center gap-2 rounded-tile bg-surface px-5 pt-11 pb-6 text-center text-ink no-underline md:min-h-[520px] md:px-8 md:pt-14">
          <h3 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">Função pública</h3>
          <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">Tabelas oficiais por carreira e escalão.</p>
          <span className="text-primary">Ver tabelas ›</span>
        </Link>

        <Link href="/partilhar" className="card flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-tile bg-primary-soft px-5 py-11 text-center text-ink no-underline md:min-h-[440px] md:px-8">
          <h3 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">Partilhe. Desbloqueie.</h3>
          <p className="m-0 max-w-[26ch] text-[17px] text-muted md:text-[21px] md:leading-7">
            Diga quanto ganha e veja subsídios, benefícios e intervalos de cada cargo.
          </p>
          <span className={`${pillPrimary} mt-4`}>Partilhar o meu salário</span>
          <span className="mt-2 text-sm text-muted">Anónimo. Cerca de 3 minutos.</span>
        </Link>

        <Link href="/registo?perfil=estudante" className="card flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-tile bg-surface px-5 py-11 text-center text-ink no-underline md:min-h-[440px] md:px-8">
          <h3 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">Para estudantes.</h3>
          <p className="m-0 max-w-[26ch] text-[17px] text-muted md:text-[21px] md:leading-7">
            Veja quanto ganha cada profissão antes de escolher o curso.
          </p>
          <span className="text-primary">Criar conta de estudante ›</span>
        </Link>
      </section>

      {/* Mais pesquisados */}
      <section className="mx-auto flex max-w-[1024px] flex-col gap-6 px-5 py-12 md:px-[22px] md:py-20">
        <h2 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">
          Mais pesquisados.
        </h2>
        <ul className="m-0 list-none p-0">
          {maisPesquisados.map((d) => (
            <li key={d.slug} className="border-b border-line last:border-b-0">
              <Link href={`/salarios/${d.slug}`} className="row num flex flex-wrap justify-between gap-2 py-4 text-ink no-underline md:py-5 md:text-[19px]">
                <span className="font-semibold">{d.cargo}</span>
                <span>
                  <span className="mr-4 text-[15px] text-muted">{sectorLabel[d.sector]}</span>
                  {formatKz(d.mediana)} ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
