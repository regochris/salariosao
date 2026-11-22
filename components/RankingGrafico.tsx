"use client";

import { useEffect, useRef, useState } from "react";
import { rankingExemplo } from "@/lib/dados";
import type { Ranking } from "@/lib/consultas";
import { formatKz } from "@/lib/format";

type Vista = "privado" | "publico" | "ambos";

// Gráfico de barras horizontais animado: profissões mais bem pagas, público vs privado.
// As barras crescem quando o gráfico entra no ecrã (uma vez), uma a seguir à outra.
export function RankingGrafico({ dados = [] }: { dados?: Ranking[] }) {
  const rankingPagas = dados;
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);
  const [vista, setVista] = useState<Vista>("ambos");

  const real = rankingPagas.length > 0;
  const maxReal = Math.max(1, ...rankingPagas.flatMap((r) => [r.publico ?? 0, r.privado ?? 0]));
  const linhas = real
    ? rankingPagas.map((r) => ({
        cargo: r.cargo,
        pub: ((r.publico ?? 0) / maxReal) * 100,
        priv: ((r.privado ?? 0) / maxReal) * 100,
        vPub: r.publico,
        vPriv: r.privado,
      }))
    : rankingExemplo.map((r) => ({ cargo: r.cargo, pub: r.publico, priv: r.privado, vPub: null, vPriv: null }));

  const ordenadas = [...linhas].sort((a, b) =>
    vista === "publico" ? b.pub - a.pub : vista === "privado" ? b.priv - a.priv : Math.max(b.pub, b.priv) - Math.max(a.pub, a.priv),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const opcoes: { v: Vista; nome: string }[] = [
    { v: "ambos", nome: "Ambos" },
    { v: "privado", nome: "Privado" },
    { v: "publico", nome: "Público" },
  ];

  return (
    <div ref={ref} className="w-full max-w-[720px] text-left">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Mostrar sector" className="inline-flex rounded-pill bg-surface p-1">
          {opcoes.map((o) => (
            <button
              key={o.v}
              type="button"
              aria-pressed={vista === o.v}
              onClick={() => setVista(o.v)}
              className={`btn h-9 rounded-pill px-4 text-sm font-medium ${vista === o.v ? "bg-ink text-bg" : "text-ink hover:bg-surface-2"}`}
            >
              {o.nome}
            </button>
          ))}
        </div>
        <div className="flex gap-4 text-[13px] text-muted" aria-hidden>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-accent" />Público</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" />Privado</span>
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-5 p-0">
        {ordenadas.map((l, i) => (
          <li key={l.cargo} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3 text-[15px]">
              <span className="flex items-baseline gap-2.5">
                <span className="num w-5 text-muted">{i + 1}</span>
                <span className="font-semibold">{l.cargo}</span>
              </span>
              <span className="num text-[13px] text-muted">
                {vista !== "publico" && <span>{formatKz(l.vPriv)}</span>}
                {vista === "ambos" && <span> · </span>}
                {vista !== "privado" && <span>{formatKz(l.vPub)}</span>}
              </span>
            </div>
            <div className="flex flex-col gap-1 pl-[30px]" aria-hidden>
              {vista !== "publico" && <Barra pct={l.priv} cor="bg-primary" visivel={visivel} atraso={i * 90} />}
              {vista !== "privado" && <Barra pct={l.pub} cor="bg-accent" visivel={visivel} atraso={i * 90 + 60} />}
            </div>
          </li>
        ))}
      </ol>

      <p className="m-0 mt-6 text-xs leading-4 text-muted">
        {real
          ? "Mediana do salário base mensal bruto · só cargos com 5 ou mais respostas."
          : "Exemplo ilustrativo. Os valores reais aparecem quando cada cargo tiver pelo menos 5 partilhas."}
      </p>
    </div>
  );
}

function Barra({ pct, cor, visivel, atraso }: { pct: number; cor: string; visivel: boolean; atraso: number }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
      <div
        className={`barra h-full rounded-full ${cor}`}
        style={{ width: visivel ? `${Math.max(3, pct)}%` : "0%", transitionDelay: `${atraso}ms` }}
      />
    </div>
  );
}
