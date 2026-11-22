// Cálculos das ferramentas de comparação. Só usam agregados públicos (percentis com 5+ respostas).

export type Quantis = { n: number; p10: number; p25: number; p50: number; p75: number; p90: number };

// Posição aproximada de um salário (0–100) por interpolação entre os percentis conhecidos.
export function percentil(v: number, q: Quantis): number {
  const pts: [number, number][] = [[q.p10, 10], [q.p25, 25], [q.p50, 50], [q.p75, 75], [q.p90, 90]];
  if (v <= pts[0][0]) return Math.max(1, Math.round(10 * (v / Math.max(1, pts[0][0]))));
  if (v >= pts[4][0]) return 95;
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, pa] = pts[i], [b, pb] = pts[i + 1];
    if (v >= a && v <= b) return Math.round(b === a ? pb : pa + ((v - a) / (b - a)) * (pb - pa));
  }
  return 50;
}

export type Veredicto = { nivel: "muito_abaixo" | "abaixo" | "media" | "acima" | "muito_acima"; titulo: string; texto: string; cor: string };

export function veredicto(v: number, q: Quantis): Veredicto {
  if (v < q.p10) return { nivel: "muito_abaixo", titulo: "Muito abaixo do mercado", texto: "Ganha menos do que 9 em cada 10 pessoas neste cargo.", cor: "text-error" };
  if (v < q.p25) return { nivel: "abaixo", titulo: "Abaixo do mercado", texto: "Está no quarto mais baixo. Há margem para pedir mais.", cor: "text-warning" };
  if (v <= q.p75) return { nivel: "media", titulo: "Na média do mercado", texto: "Está no meio: metade das pessoas neste cargo ganha entre estes valores.", cor: "text-primary" };
  if (v <= q.p90) return { nivel: "acima", titulo: "Acima do mercado", texto: "Ganha mais do que 3 em cada 4 pessoas neste cargo.", cor: "text-success" };
  return { nivel: "muito_acima", titulo: "Muito acima do mercado", texto: "Está entre os 10% mais bem pagos neste cargo.", cor: "text-success" };
}

// Inflação acumulada entre dois meses (ex.: 0.18 = preços 18% mais altos).
export function inflacaoEntre(indiceInicio: number, indiceFim: number) {
  return indiceFim / indiceInicio - 1;
}

// Variação real do salário descontando a inflação.
export function variacaoReal(salarioAntes: number, salarioAgora: number, inflacao: number) {
  return salarioAgora / salarioAntes / (1 + inflacao) - 1;
}

export const pct = (x: number, casas = 1) => `${x > 0 ? "+" : ""}${(x * 100).toFixed(casas).replace(".", ",")}%`;

export const nomeMes = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("pt-AO", { month: "long", year: "numeric" });
