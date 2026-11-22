"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LinhaTabela } from "@/lib/consultas";
import { formatKz } from "@/lib/format";
import { field, label } from "@/lib/ui";

export function Tabelas({ linhas }: { linhas: LinhaTabela[] }) {
  // Agrupa: tabela → carreira → linhas
  const tabelas = useMemo(() => {
    const m = new Map<number, { id: number; nome: string; anexo: string; carreiras: Map<string, LinhaTabela[]> }>();
    for (const l of linhas) {
      if (!m.has(l.tabela_id)) m.set(l.tabela_id, { id: l.tabela_id, nome: l.tabela, anexo: l.anexo, carreiras: new Map() });
      const t = m.get(l.tabela_id)!;
      if (!t.carreiras.has(l.carreira)) t.carreiras.set(l.carreira, []);
      t.carreiras.get(l.carreira)!.push(l);
    }
    return [...m.values()];
  }, [linhas]);

  const [id, setId] = useState<number | null>(tabelas[0]?.id ?? null);
  const [busca, setBusca] = useState("");
  const t = tabelas.find((x) => x.id === id) ?? tabelas[0];

  if (!t) {
    return <p className="m-0 rounded-tile bg-surface p-6 text-center text-muted">Tabelas oficiais ainda não disponíveis.</p>;
  }

  const q = busca.trim().toLowerCase();
  const carreiras = [...t.carreiras.entries()]
    .map(([nome, ls]) => [nome, q ? ls.filter((l) => `${nome} ${l.categoria}`.toLowerCase().includes(q)) : ls] as const)
    .filter(([, ls]) => ls.length > 0);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-tile bg-surface p-5 sm:flex-row">
        <div className="flex flex-[2] flex-col gap-1.5">
          <label htmlFor="fp-tabela" className={label}>Tabela</label>
          <select id="fp-tabela" value={t.id} onChange={(e) => setId(Number(e.target.value))} className={field}>
            {tabelas.map((x) => (
              <option key={x.id} value={x.id}>{x.anexo} · {x.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="fp-busca" className={label}>Procurar categoria</label>
          <input id="fp-busca" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="ex.: técnico superior" className={field} />
        </div>
      </div>

      {carreiras.length === 0 && <p className="m-0 px-2 text-[15px] text-muted">Nada encontrado nesta tabela.</p>}

      {carreiras.map(([nome, ls]) => (
        <section key={nome} className="flex flex-col rounded-tile bg-surface p-5">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h2 className="m-0 text-[19px] leading-6 font-bold md:text-[22px] md:leading-7">{nome}</h2>
            <span className="shrink-0 text-xs text-muted">Base mensal</span>
          </div>
          {ls.map((l, i) => (
            <div key={`${l.categoria}-${l.variante}-${i}`} className="num flex items-baseline justify-between gap-3 border-b border-line py-3 text-[15px] last:border-b-0">
              <span>
                <span className="font-semibold">{l.categoria}</span>
                {l.variante && l.variante !== "única" && <span className="ml-2 text-sm text-muted">{l.variante}</span>}
              </span>
              <span className="flex shrink-0 items-baseline gap-3">
                {l.indice != null && <span className="text-xs text-muted">índ. {l.indice}</span>}
                <span className="font-semibold">{formatKz(l.vencimento_base)}</span>
              </span>
            </div>
          ))}
        </section>
      ))}

      <Link href="/salarios" className="card flex items-center justify-between rounded-tile bg-accent-soft p-5 text-ink">
        <span className="flex flex-col">
          <strong className="font-semibold">E no sector privado?</strong>
          <span className="text-sm text-muted">Compare o mesmo cargo</span>
        </span>
        <span className="text-accent">›</span>
      </Link>
    </>
  );
}
