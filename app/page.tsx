import Link from "next/link";
import { SearchIcon } from "@/components/Icons";
import { SectorBar } from "@/components/SectorBar";
import { comparacaoDestaque, maisPesquisados, sectorLabel } from "@/lib/dados";
import { formatKz } from "@/lib/format";

const pill =
  "inline-flex h-11 items-center justify-center rounded-pill px-[22px] text-[15px] font-medium no-underline";

export default function Inicio() {
  const c = comparacaoDestaque;
  const max = Math.max(c.publico ?? 0, c.privado ?? 0) || null;

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center gap-2.5 px-5 pt-16 pb-14 text-center md:gap-3 md:pt-24 md:pb-22">
        <p className="m-0 text-[17px] font-semibold text-primary md:text-[21px]">SaláriosAO</p>
        <h1 className="m-0 max-w-[16ch] text-[40px] leading-[44px] font-bold tracking-[-1px] md:text-[64px] md:leading-[68px] md:tracking-[-1.4px]">
          Saiba quanto vale o seu trabalho.
        </h1>
        <p className="m-0 mt-1 max-w-[34ch] text-[19px] leading-[26px] text-muted md:text-2xl md:leading-8">
          Salários reais de Angola. Público e privado. Partilhados de forma anónima.
        </p>

        <form id="busca" action="/salarios" className="mt-6 flex h-[52px] w-full max-w-[560px] items-center gap-2 rounded-pill bg-surface pr-2 pl-5 md:mt-7 md:h-14">
          <label htmlFor="q" className="sr-only">Cargo ou profissão</label>
          <SearchIcon className="shrink-0 text-muted" />
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Procure um cargo, ex.: enfermeiro"
            className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
          />
          <button type="submit" className={`${pill} hidden bg-primary text-on-primary md:inline-flex`}>
            Pesquisar
          </button>
        </form>
        <button type="submit" form="busca" className={`${pill} mt-3 bg-primary text-on-primary md:hidden`}>
          Pesquisar
        </button>

        <div className="mt-3 flex flex-wrap justify-center gap-x-8 gap-y-1 md:mt-4">
          <Link href="/partilhar" className="flex min-h-11 items-center no-underline">Partilhar o meu salário ›</Link>
          <Link href="/metodologia" className="flex min-h-11 items-center no-underline">Como funciona ›</Link>
        </div>
      </section>

      {/* Público vs privado (bloco escuro) */}
      <section className="ink flex flex-col items-center gap-2 bg-bg px-5 py-16 text-center text-ink md:gap-3 md:py-22">
        <h2 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px] md:text-5xl md:leading-[52px] md:tracking-[-1px]">
          Público vs privado.
        </h2>
        <p className="m-0 text-[19px] leading-[26px] text-muted md:text-2xl md:leading-8">O mesmo cargo, lado a lado.</p>
        <div className="mt-7 flex w-full max-w-[640px] flex-col gap-5 text-left md:mt-10">
          <SectorBar label={`${c.cargo} · Público`} valor={c.publico} max={max} sector="publico" />
          <SectorBar label={`${c.cargo} · Privado`} valor={c.privado} max={max} sector="privado" />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-8">
          <Link href="/salarios/enfermeiro" className={`${pill} bg-primary text-on-primary hover:text-on-primary`}>Ver comparação</Link>
          <Link href="/metodologia" className={`${pill} border border-primary text-primary`}>Saiba mais</Link>
        </div>
        <p className="num m-0 mt-4 text-xs leading-4 text-muted md:mt-6">
          Mediana do salário base · {c.respostas ?? "—"} respostas
        </p>
      </section>

      {/* Tiles */}
      <section className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-2">
        <Link href="/calculadora" className="flex min-h-[440px] flex-col items-center gap-2 rounded-tile bg-surface px-5 pt-11 pb-6 text-center text-ink no-underline md:min-h-[520px] md:px-8 md:pt-14">
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

        <Link href="/funcao-publica" className="ink flex min-h-[440px] flex-col items-center gap-2 rounded-tile bg-surface px-5 pt-11 pb-6 text-center text-ink no-underline md:min-h-[520px] md:px-8 md:pt-14">
          <h3 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">Função pública</h3>
          <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">Tabelas oficiais por carreira e escalão.</p>
          <span className="text-primary">Ver tabelas ›</span>
        </Link>

        <Link href="/partilhar" className="flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-tile bg-primary-soft px-5 py-11 text-center text-ink no-underline md:min-h-[440px] md:px-8">
          <h3 className="m-0 text-[28px] leading-8 font-bold tracking-[-0.5px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]">Partilhe. Desbloqueie.</h3>
          <p className="m-0 max-w-[26ch] text-[17px] text-muted md:text-[21px] md:leading-7">
            Diga quanto ganha e veja subsídios, benefícios e intervalos de cada cargo.
          </p>
          <span className={`${pill} mt-4 bg-primary text-on-primary`}>Partilhar o meu salário</span>
          <span className="mt-2 text-sm text-muted">Anónimo. Cerca de 3 minutos.</span>
        </Link>

        <Link href="/estudantes" className="flex min-h-[360px] flex-col items-center justify-center gap-2 rounded-tile bg-surface px-5 py-11 text-center text-ink no-underline md:min-h-[440px] md:px-8">
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
              <Link href={`/salarios/${d.slug}`} className="num flex flex-wrap justify-between gap-2 py-4 text-ink no-underline md:py-5 md:text-[19px]">
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
