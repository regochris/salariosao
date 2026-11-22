"use client";

import { usePathname } from "next/navigation";

// Esconde o cabeçalho e o rodapé do site público dentro do painel de administração.
export function SoSite({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  if (caminho.startsWith("/admin")) return null;
  return <>{children}</>;
}
