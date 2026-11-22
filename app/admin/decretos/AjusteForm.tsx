"use client";

import { useState } from "react";
import { formatKz } from "@/lib/format";
import { btnPrimario, btnQuieto, campo, rotulo } from "../ui";

type Grupo = { id: number; nome: string; actual: number | null };

// Formulário de novo ajuste geral. A percentagem preenche os novos valores; cada um pode ser corrigido à mão.
export function AjusteForm({ grupos, accao }: { grupos: Grupo[]; accao: (f: FormData) => Promise<void> }) {
  const [pct, setPct] = useState("");
  const [valores, setValores] = useState<Record<number, string>>({});
  const aplicar = () => {
    const p = Number(pct.replace(",", "."));
    if (!p) return;
    setValores(Object.fromEntries(grupos.filter((g) => g.actual).map((g) => [g.id, (Math.round(g.actual! * (1 + p / 100) * 100) / 100).toFixed(2)])));
  };

  return (
    <form action={accao} className="flex flex-col gap-4">
      <input type="hidden" name="voltar" value="/admin/decretos" />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1"><span className={rotulo}>Número do decreto</span><input name="numero" required placeholder="Ex.: Decreto Presidencial n.º 12/27" className={campo} /></label>
        <label className="flex flex-col gap-1"><span className={rotulo}>Data de efeitos</span><input name="data_efeitos" type="date" required className={campo} /></label>
        <label className="flex flex-col gap-1"><span className={rotulo}>Título</span><input name="titulo" placeholder="Ajustamento geral dos vencimentos-base" className={campo} /></label>
        <label className="flex flex-col gap-1"><span className={rotulo}>Ligação para o texto</span><input name="url" type="url" placeholder="https://" className={campo} /></label>
      </div>
      <label className="flex flex-col gap-1"><span className={rotulo}>Notas</span><input name="notas" placeholder="Ex.: aumento de 10% em todos os grupos" className={campo} /></label>

      <div className="flex flex-wrap items-end gap-2 rounded-[14px] bg-bg p-3">
        <label className="flex w-40 flex-col gap-1"><span className={rotulo}>Aumento igual para todos</span><input value={pct} onChange={(e) => setPct(e.target.value)} inputMode="decimal" placeholder="Ex.: 10" className={campo} /></label>
        <button type="button" onClick={aplicar} className={btnQuieto}>Calcular valores</button>
        <span className="text-xs text-muted">Ou escreva o valor do índice 100 de cada grupo, como vem no decreto.</span>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-line bg-bg">
        <table className="num w-full min-w-[560px] border-collapse text-sm">
          <thead><tr className="text-left text-xs text-muted">
            <th className="border-b border-line px-3 py-2 font-semibold">Grupo de pessoal</th>
            <th className="border-b border-line px-3 py-2 text-right font-semibold">Índice 100 actual</th>
            <th className="border-b border-line px-3 py-2 font-semibold">Novo valor (Kz)</th>
          </tr></thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.id}>
                <td className="border-b border-line px-3 py-2">{g.nome}</td>
                <td className="border-b border-line px-3 py-2 text-right text-muted">{g.actual ? formatKz(g.actual) : "—"}</td>
                <td className="border-b border-line px-3 py-2">
                  <input name={`grupo_${g.id}`} value={valores[g.id] ?? ""} onChange={(e) => setValores({ ...valores, [g.id]: e.target.value })} inputMode="decimal" placeholder="deixar igual" aria-label={`Novo valor para ${g.nome}`} className={campo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 text-xs text-muted">Os grupos em branco mantêm o valor actual. Os valores antigos ficam guardados no histórico.</p>
      <button className={`${btnPrimario} self-start`}>Registar decreto</button>
    </form>
  );
}
