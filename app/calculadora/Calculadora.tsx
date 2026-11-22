"use client";

import Link from "next/link";
import { useState } from "react";
import { calcularLiquido } from "@/lib/impostos";
import { formatKz } from "@/lib/format";
import { field, label } from "@/lib/ui";

const num = (s: string) => Number(s.replace(/\D/g, "")) || 0;

export function Calculadora() {
  const [base, setBase] = useState("");
  const [alim, setAlim] = useState("");
  const [trans, setTrans] = useState("");
  const [outros, setOutros] = useState("");

  const r = calcularLiquido(num(base), num(alim) + num(trans) + num(outros));
  const tem = r.bruto > 0;

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 rounded-tile bg-surface p-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-base" className={label}>Salário base mensal bruto (Kz)</label>
          <input id="c-base" inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value)} placeholder="0" className={`${field} num h-14 text-2xl font-semibold`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-al" className={label}>Sub. alimentação</label>
            <input id="c-al" inputMode="numeric" value={alim} onChange={(e) => setAlim(e.target.value)} placeholder="Kz" className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-tr" className={label}>Sub. transporte</label>
            <input id="c-tr" inputMode="numeric" value={trans} onChange={(e) => setTrans(e.target.value)} placeholder="Kz" className={field} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="c-out" className={label}>Outros subsídios</label>
          <input id="c-out" inputMode="numeric" value={outros} onChange={(e) => setOutros(e.target.value)} placeholder="Kz" className={field} />
        </div>
      </form>

      <section aria-live="polite" className="ink flex flex-col gap-3.5 rounded-tile bg-surface px-6 py-7 text-ink">
        <span className="text-center text-sm text-muted">Recebe por mês</span>
        <span className="num text-center text-[44px] leading-[48px] font-bold tracking-[-1px]">
          {tem ? formatKz(r.liquido) : "— Kz"}
        </span>
        <div className="mt-2 flex flex-col text-[15px]">
          <div className="num flex justify-between border-b border-line py-2.5"><span className="text-muted">Total bruto</span><span>{formatKz(tem ? r.bruto : null)}</span></div>
          <div className="num flex justify-between border-b border-line py-2.5"><span className="text-muted">Segurança Social (3%)</span><span>{tem ? `− ${formatKz(r.ss)}` : "— Kz"}</span></div>
          <div className="num flex justify-between py-2.5"><span className="text-muted">IRT</span><span>{tem && r.irt != null ? `− ${formatKz(r.irt)}` : "— Kz"}</span></div>
        </div>
        {tem && r.irt == null && (
          <p className="m-0 text-center text-xs text-muted">A tabela de IRT ainda está a ser configurada.</p>
        )}
      </section>

      <Link href="/salarios" className="flex items-center justify-between rounded-tile bg-primary-soft p-5 text-ink no-underline">
        <span className="flex flex-col">
          <strong className="font-semibold">O seu salário está na média?</strong>
          <span className="text-sm text-muted">Compare com o seu cargo</span>
        </span>
        <span className="text-primary">›</span>
      </Link>
      <p className="m-0 px-2 text-xs text-muted">Cálculo indicativo. Não substitui o recibo de vencimento.</p>
    </>
  );
}
