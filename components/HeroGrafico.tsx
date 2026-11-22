// Gráfico decorativo do topo: uma distribuição salarial estilizada (histograma) que "respira".
// A faixa do meio (onde está metade das pessoas) fica azul-clara, a mediana a azul.
// É só ilustração: não mostra dados, fica por baixo do texto e não o tapa.

const alturas = [14, 20, 28, 38, 50, 62, 74, 86, 96, 100, 94, 84, 72, 60, 48, 38, 30, 23, 17, 13, 10, 8, 6, 5];
const MEDIANA = 9;
const FAIXA = [6, 13];

export function HeroGrafico({ className = "mt-12 md:mt-16", legenda = true }: { className?: string; legenda?: boolean }) {
  return (
    <div aria-hidden className={`hero-grafico relative mx-auto w-full max-w-[720px] select-none ${className}`}>
      <div className="flex h-[120px] items-end gap-[3px] md:h-[160px] md:gap-1.5">
        {alturas.map((h, i) => {
          const naFaixa = i >= FAIXA[0] && i <= FAIXA[1];
          const cor = i === MEDIANA ? "bg-primary" : naFaixa ? "bg-primary/30" : "bg-surface-2";
          return (
            <div
              key={i}
              className={`hero-barra flex-1 rounded-t-[4px] ${cor}`}
              style={{ height: `${h}%`, animationDelay: `${i * 70}ms, ${1200 + ((i * 37) % 9) * 180}ms` }}
            />
          );
        })}
      </div>
      <div
        className="hero-marca absolute -top-7 flex -translate-x-1/2 flex-col items-center"
        style={{ left: `${((MEDIANA + 0.5) / alturas.length) * 100}%` }}
      >
        <span className="rounded-pill bg-ink px-2.5 py-0.5 text-[11px] leading-4 font-medium text-bg">Mediana</span>
        <span className="h-2 w-px bg-ink" />
      </div>
      <div className="h-px w-full bg-line" />
      {legenda && (
        <div className="mt-2 flex justify-between text-[11px] leading-4 text-muted">
          <span>Ganha menos</span>
          <span>Metade das pessoas</span>
          <span>Ganha mais</span>
        </div>
      )}
    </div>
  );
}
