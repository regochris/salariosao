// Formata valores em Kwanzas. Sem valor (ainda sem dados) mostra um traço.
const kz = new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 });

export function formatKz(valor: number | null | undefined): string {
  if (valor == null) return "— Kz";
  return `${kz.format(valor)} Kz`;
}

// Menos de 5 respostas: o valor mostra-se com a etiqueta "Poucos dados".
export const MINIMO_RESPOSTAS = 5;
