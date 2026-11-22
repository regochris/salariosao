// Peças partilhadas pelas páginas do painel.
export function Cabecalho({ titulo, sub, children }: { titulo: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 text-[26px] leading-8 font-bold tracking-[-0.5px] md:text-[30px] md:leading-9">{titulo}</h1>
        {sub && <p className="m-0 mt-1 text-muted">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function Aviso({ ok, erro }: { ok?: string; erro?: string }) {
  if (!ok && !erro) return null;
  return (
    <p role={erro ? "alert" : "status"} className={`m-0 mb-5 rounded-[12px] px-4 py-3 text-[15px] ${erro ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>
      {erro ?? ok}
    </p>
  );
}

export function Selo({ texto, cor }: { texto: string; cor: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs leading-[18px] font-semibold whitespace-nowrap ${cor}`}>{texto}</span>;
}

export function Bloco({ titulo, children, accao }: { titulo?: string; children: React.ReactNode; accao?: React.ReactNode }) {
  return (
    <section className="rounded-tile bg-surface p-5 md:p-6">
      {(titulo || accao) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {titulo && <h2 className="m-0 text-[19px] leading-6 font-bold">{titulo}</h2>}
          {accao}
        </div>
      )}
      {children}
    </section>
  );
}

export const btn = "btn inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium whitespace-nowrap";
export const btnPrimario = `${btn} bg-button text-on-button hover:bg-button-hover`;
export const btnQuieto = `${btn} border border-input bg-bg text-ink hover:bg-surface`;
export const btnPerigo = `${btn} border border-error bg-bg text-error hover:bg-error/10`;
export const campo = "h-10 w-full rounded-[10px] border border-input bg-bg px-3 text-[15px] text-ink outline-none transition-colors hover:border-ink focus:border-primary focus:ring-2 focus:ring-primary/25";
export const rotulo = "text-[13px] font-semibold";
