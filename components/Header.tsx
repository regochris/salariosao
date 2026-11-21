import Link from "next/link";
import { SearchIcon } from "./Icons";

const links = [
  { href: "/salarios", label: "Salários" },
  { href: "/funcao-publica", label: "Função pública" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/estudantes", label: "Estudantes" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/entrar", label: "Entrar" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-surface/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex min-h-12 max-w-[1024px] items-center justify-between gap-6 px-4 md:px-[22px]">
        <Link href="/" className="text-[17px] font-semibold text-ink no-underline">
          Salários<span className="text-primary">AO</span>
        </Link>
        <nav aria-label="Principal" className="hidden gap-7 text-xs md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-ink/85 no-underline hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/salarios" aria-label="Pesquisar salários" className="flex size-11 items-center justify-center text-ink">
          <SearchIcon size={16} />
        </Link>
      </div>
    </header>
  );
}
