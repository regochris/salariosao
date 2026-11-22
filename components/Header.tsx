import Link from "next/link";
import { SearchIcon } from "./Icons";

const links = [
  { href: "/salarios", label: "Salários" },
  { href: "/funcao-publica", label: "Função pública" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/registo?perfil=estudante", label: "Estudantes" },
  { href: "/metodologia", label: "Metodologia" },
  { href: "/registo", label: "Entrar" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-surface/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex min-h-12 max-w-[1120px] items-center justify-between gap-6 px-4 md:px-[22px]">
        <Link href="/" className="plain text-[19px] font-semibold text-ink">
          Salários<span className="text-primary">AO</span>
        </Link>
        <nav aria-label="Principal" className="hidden gap-6 text-[15px] md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="plain flex min-h-11 items-center text-ink/80 transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/salarios" aria-label="Pesquisar salários" className="plain flex size-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2">
          <SearchIcon size={18} />
        </Link>
      </div>
    </header>
  );
}
