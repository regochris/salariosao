"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon } from "./Icons";

const links = [
  { href: "/salarios", label: "Salários" },
  { href: "/funcao-publica", label: "Função pública" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/metodologia", label: "Metodologia" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto grid min-h-16 max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">
        <Link href="/" className="plain justify-self-start text-[20px] font-semibold tracking-[-0.4px] text-ink">
          Salários<span className="text-primary">AO</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-0.5 rounded-pill border border-line bg-bg p-1 md:flex">
          {links.map((l) => {
            const activo = path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={activo ? "page" : undefined}
                className={`plain flex h-9 items-center rounded-pill px-4 text-[15px] text-ink transition-colors hover:bg-surface ${activo ? "bg-surface font-medium" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="col-start-3 flex items-center gap-2 justify-self-end">
          <Link href="/salarios" aria-label="Pesquisar salários" className="plain flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface">
            <SearchIcon size={18} />
          </Link>
          <Link href="/entrar" className="plain hidden h-10 items-center px-3 text-[15px] text-ink hover:text-primary md:flex">
            Entrar
          </Link>
          <Link href="/partilhar" className="btn hidden h-10 items-center gap-1.5 rounded-pill bg-ink px-4 text-[15px] font-medium text-bg hover:bg-ink/85 hover:text-bg sm:inline-flex">
            Partilhar salário
            <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
