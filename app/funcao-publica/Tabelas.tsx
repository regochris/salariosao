"use client";

import Link from "next/link";
import { useState } from "react";
import { carreirasPublicas } from "@/lib/dados";

export function Tabelas() {
  const [i, setI] = useState(0);
  const c = carreirasPublicas[i];

  return (
    <>
      <div role="tablist" aria-label="Carreira" className="flex gap-2 overflow-x-auto px-2 pb-1">
        {carreirasPublicas.map((x, n) => (
          <button
            key={x.nome}
            type="button"
            role="tab"
            aria-selected={n === i}
            onClick={() => setI(n)}
            className={`btn h-10 shrink-0 rounded-pill px-4 text-[15px] font-medium ${n === i ? "bg-ink text-bg" : "bg-surface text-ink hover:bg-surface-2"}`}
          >
            {x.nome}
          </button>
        ))}
      </div>

      <section role="tabpanel" className="flex flex-col rounded-tile bg-surface p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="m-0 text-[22px] leading-7 font-bold">{c.nome}</h2>
          <span className="text-xs text-muted">Salário base mensal</span>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-1 border-b border-line py-1.5 text-xs text-muted">
          <span>Categoria</span><span className="text-right">1.º esc.</span><span className="text-right">2.º esc.</span><span className="text-right">3.º esc.</span>
        </div>
        {c.categorias.map((cat) => (
          <div key={cat} className="num grid grid-cols-[2fr_1fr_1fr_1fr] gap-1 border-b border-line py-3 text-sm last:border-b-0">
            <span className="font-semibold">{cat}</span>
            <span className="text-right">—</span><span className="text-right">—</span><span className="text-right">—</span>
          </div>
        ))}
        <p className="m-0 mt-2 text-xs text-muted">Valores em Kz · Tabela oficial a carregar.</p>
      </section>

      <Link href="/salarios" className="card flex items-center justify-between rounded-tile bg-accent-soft p-5 text-ink">
        <span className="flex flex-col">
          <strong className="font-semibold">E no sector privado?</strong>
          <span className="text-sm text-muted">Compare o mesmo cargo</span>
        </span>
        <span className="text-accent">›</span>
      </Link>
      <p className="m-0 px-2 text-xs text-muted">
        Os subsídios do Estado (isolamento, risco, turno) variam por órgão e não estão incluídos no salário base.
      </p>
    </>
  );
}
