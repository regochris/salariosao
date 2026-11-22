import Link from "next/link";
import { HeroGrafico } from "./HeroGrafico";
import { ShieldIcon } from "./Icons";

// Hero editorial: título serifado, gráfico de salários ao centro com cartões de vidro a flutuar,
// cartões laterais ligados por linhas finas, selo a girar e notas nos cantos (só no computador).

const Estrela = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" className={className}>
    <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" fill="currentColor" />
  </svg>
);

const Seta = () => (
  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Selo() {
  return (
    <div aria-hidden className="absolute top-10 right-6 hidden size-[104px] text-ink lg:block xl:right-10">
      <svg viewBox="0 0 100 100" className="girar size-full">
        <defs>
          <path id="selo-circulo" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text fontSize="8" letterSpacing="2" fill="currentColor" style={{ textTransform: "uppercase" }}>
          <textPath href="#selo-circulo">Dados anónimos · Salários reais ·</textPath>
        </text>
      </svg>
      <Estrela className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-14 md:pt-20">
      <Selo />

      {/* Linhas finas que ligam os cartões laterais ao gráfico */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" preserveAspectRatio="none" viewBox="0 0 1200 900">
        <path d="M150 470 C 160 640, 330 700, 470 690" fill="none" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M1050 470 C 1040 640, 870 700, 730 690" fill="none" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Cartão lateral esquerdo */}
      <div className="flutuar vidro absolute top-[300px] left-[5%] hidden w-[200px] -rotate-3 rounded-[22px] p-5 text-left lg:block xl:left-[8%]">
        <span className="mb-4 flex size-8 items-center justify-center rounded-full bg-surface text-ink"><ShieldIcon size={16} /></span>
        <p className="m-0 text-[17px] leading-[22px] font-medium">Partilhe em 3 minutos.</p>
        <p className="m-0 mt-2 text-[13px] leading-[18px] text-muted">Anónimo. Nunca ligado ao seu nome.</p>
      </div>

      {/* Cartão lateral direito */}
      <div className="flutuar-2 vidro absolute top-[330px] right-[5%] hidden w-[210px] rotate-3 rounded-[22px] p-5 text-left lg:block xl:right-[8%]">
        <span className="mb-4 flex gap-1.5">
          <span className="rounded-pill bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">Público</span>
          <span className="rounded-pill bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">Privado</span>
        </span>
        <p className="m-0 text-[17px] leading-[22px] font-medium">Os dois sectores, lado a lado.</p>
        <p className="m-0 mt-2 text-[13px] leading-[18px] text-muted">Em todas as 21 províncias.</p>
      </div>

      {/* Texto central */}
      <div className="relative mx-auto flex max-w-[860px] flex-col items-center text-center">
        <h1 className="m-0 font-serif text-[52px] leading-[0.95] font-normal tracking-[-1.5px] md:text-[96px] md:tracking-[-3px]">
          Saiba quanto vale
          <br />
          <em className="italic">o seu trabalho.</em>
        </h1>
        <p className="m-0 mt-6 max-w-[42ch] text-[17px] leading-[26px] text-muted md:text-[19px] md:leading-[28px]">
          Salários reais de Angola, do sector público e privado, partilhados de forma anónima por quem trabalha.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/partilhar" className="btn inline-flex h-12 items-center gap-2 rounded-pill bg-ink px-6 text-[15px] font-medium text-bg hover:bg-ink/85 hover:text-bg">
            Partilhar o meu salário <Seta />
          </Link>
          <Link href="/metodologia" className="btn inline-flex h-12 items-center gap-2.5 rounded-pill border border-line bg-bg px-5 text-[15px] font-medium text-ink hover:bg-surface hover:text-ink">
            <span className="flex size-6 items-center justify-center rounded-full bg-ink text-bg">
              <svg aria-hidden width="10" height="10" viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z" fill="currentColor" /></svg>
            </span>
            Como funciona
          </Link>
        </div>
      </div>

      {/* Gráfico central com cartões de vidro */}
      <div className="relative mx-auto mt-14 max-w-[720px] pb-16 md:mt-20 md:pb-24">
        <HeroGrafico className="pt-10" legenda={false} />

        <div className="flutuar vidro absolute top-0 left-0 hidden w-[190px] -rotate-2 rounded-[18px] p-3.5 text-left sm:block md:-left-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary-soft text-primary">
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6" /></svg>
            </span>
            <span className="flex flex-col">
              <strong className="text-sm leading-4 font-semibold">Mediana</strong>
              <span className="text-xs text-muted">o valor do meio</span>
            </span>
          </div>
        </div>

        <div className="flutuar-2 vidro absolute top-16 right-0 hidden w-[200px] rotate-2 rounded-[18px] p-3.5 text-left sm:block md:-right-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-accent-soft text-accent">
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h10M4 17h6" /></svg>
            </span>
            <span className="flex flex-col">
              <strong className="text-sm leading-4 font-semibold">Subsídios</strong>
              <span className="text-xs text-muted">alimentação, transporte…</span>
            </span>
          </div>
        </div>

        <div className="flutuar vidro absolute bottom-2 left-1/2 hidden w-[210px] -translate-x-1/2 rounded-[18px] p-3.5 text-left sm:block md:bottom-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-surface text-ink">
              <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 12h1M14 12h1M9 16h1M14 16h1" /></svg>
            </span>
            <span className="flex flex-col">
              <strong className="text-sm leading-4 font-semibold">Bruto → líquido</strong>
              <span className="text-xs text-muted">IRT e Segurança Social</span>
            </span>
          </div>
        </div>
      </div>

      {/* Notas nos cantos inferiores */}
      <div className="absolute bottom-16 left-[5%] hidden flex-col gap-3 text-left lg:flex xl:left-[8%]">
        <span className="h-px w-8 bg-line" />
        <p className="m-0 text-[15px] leading-5 text-muted">Feito para quem trabalha<br />em Angola.</p>
      </div>
      <div className="absolute right-[5%] bottom-16 hidden flex-col items-end gap-3 text-right lg:flex xl:right-[8%]">
        <Estrela className="text-ink" />
        <p className="m-0 flex items-center gap-3 text-[15px] leading-5 text-muted">
          <span className="h-px w-8 bg-line" />
          <span>Menos segredo.<br />Mais justiça salarial.</span>
        </p>
      </div>
    </section>
  );
}
