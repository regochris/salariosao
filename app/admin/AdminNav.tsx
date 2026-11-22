"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/admin", nome: "Visão geral", d: "M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z" },
  { href: "/admin/moderacao", nome: "Moderação", d: "M9 12l2 2 4-4M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z", chave: "pendentes" },
  { href: "/admin/catalogo", nome: "Catálogo", d: "M4 6h16M4 12h16M4 18h10", chave: "sugestoes" },
  { href: "/admin/decretos", nome: "Decretos e tabelas", d: "M7 3h8l4 4v14H7zM14 3v5h5M10 13h6M10 17h6" },
  { href: "/admin/utilizadores", nome: "Utilizadores", d: "M16 19c0-2.5-1.8-4-4-4s-4 1.5-4 4M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19c0-2-1.2-3.2-3-3.6M17 6.5a3 3 0 0 1 0 5" },
  { href: "/admin/mensagens", nome: "Mensagens", d: "M4 6h16v12H4zM4 7l8 6 8-6", chave: "mensagens" },
] as const;

export function AdminNav({ contagens }: { contagens: Record<string, number> }) {
  const caminho = usePathname();
  return (
    <nav aria-label="Painel" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {itens.map((i) => {
        const activo = i.href === "/admin" ? caminho === "/admin" : caminho.startsWith(i.href);
        const n = "chave" in i ? contagens[i.chave] ?? 0 : 0;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={activo ? "page" : undefined}
            className={`plain flex min-h-10 shrink-0 items-center gap-2.5 rounded-[10px] px-3 text-[15px] text-ink no-underline transition-colors ${activo ? "bg-bg font-semibold shadow-[0_1px_2px_rgb(0_0_0/0.06)]" : "hover:bg-surface-2"}`}
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={i.d} /></svg>
            {i.nome}
            {n > 0 && <span className="num ml-auto min-w-[22px] rounded-full bg-warning px-1.5 text-center text-xs leading-5 font-semibold text-white">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
