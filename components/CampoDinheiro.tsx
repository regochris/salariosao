"use client";

import { useState } from "react";
import { field } from "@/lib/ui";

// Campo de dinheiro: só algarismos, milhares separados por espaço ("250 000").
export const lerKz = (s: string) => Number(s.split(",")[0].replace(/\D/g, "")) || 0;
const agrupar = (s: string) => s.split(",")[0].replace(/\D/g, "").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function CampoDinheiro({ id, valor, onValor, placeholder = "Ex.: 250 000", required, grande }: { id: string; valor: number; onValor: (v: number) => void; placeholder?: string; required?: boolean; grande?: boolean }) {
  const [texto, setTexto] = useState(valor ? agrupar(String(valor)) : "");
  return (
    <div className="relative">
      <input
        id={id} type="text" inputMode="numeric" autoComplete="off" required={required} value={texto} placeholder={placeholder}
        onChange={(e) => { const f = agrupar(e.target.value); setTexto(f); onValor(lerKz(f)); }}
        className={`${field} num pr-12 ${grande ? "h-14 text-[22px] font-semibold" : ""}`}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">Kz</span>
    </div>
  );
}
