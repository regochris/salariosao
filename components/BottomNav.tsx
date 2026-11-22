"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusCircleIcon, SearchIcon, UserIcon } from "./Icons";

const items = [
  { href: "/", label: "Início", Icon: HomeIcon },
  { href: "/salarios", label: "Pesquisar", Icon: SearchIcon },
  { href: "/partilhar", label: "Partilhar", Icon: PlusCircleIcon },
  { href: "/entrar", label: "Conta", Icon: UserIcon },
];

// Navegação inferior: só no telemóvel.
export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface/90 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur-xl md:hidden"
    >
      {items.map(({ href, label, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center gap-0.5 plain text-xs leading-4 transition-colors hover:text-primary ${
              active ? "font-semibold text-primary" : "font-medium text-muted"
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
