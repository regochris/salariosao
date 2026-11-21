import { formatKz } from "@/lib/format";

type Props = {
  label: string;
  valor: number | null;
  max: number | null;
  sector: "publico" | "privado";
};

// Barra horizontal de comparação. Público = terracota (accent), privado = azul (primary).
export function SectorBar({ label, valor, max, sector }: Props) {
  const pct = valor != null && max ? Math.max(4, Math.round((valor / max) * 100)) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[15px]">
        <span>{label}</span>
        <span className="num font-semibold">{formatKz(valor)}</span>
      </div>
      <div aria-hidden className="h-2.5 rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full ${sector === "publico" ? "bg-accent" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
