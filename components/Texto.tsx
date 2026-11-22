// Moldura das páginas de texto (Metodologia, Privacidade, Termos, Contacto).
export function PaginaTexto({ etiqueta, titulo, intro, actualizado, children }: {
  etiqueta?: string;
  titulo: string;
  intro?: string;
  actualizado?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-[720px] px-5 pt-10 pb-20 md:pt-16">
      <header className="mb-10 flex flex-col gap-2">
        {etiqueta && <p className="m-0 text-[15px] font-semibold text-primary">{etiqueta}</p>}
        <h1 className="m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px] md:tracking-[-1px]">{titulo}</h1>
        {intro && <p className="m-0 text-[19px] leading-[28px] text-muted md:text-[21px] md:leading-[30px]">{intro}</p>}
        {actualizado && <p className="m-0 text-xs text-muted">Última actualização: {actualizado}</p>}
      </header>
      <div className="flex flex-col gap-8 [&_h2]:m-0 [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:leading-7 [&_h2]:font-bold [&_li]:mb-1.5 [&_p]:m-0 [&_p]:mb-3 [&_ul]:m-0 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

export function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[14px] border border-warning/40 bg-surface px-4 py-3 text-[15px] text-ink">{children}</p>;
}
