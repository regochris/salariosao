// Cálculo do salário líquido.
// Segurança Social (INSS): contribuição do trabalhador de 3% sobre a remuneração.
// IRT: TODO — carregar a tabela de IRT em vigor (Grupo A) antes do lançamento.
// Enquanto a tabela não estiver configurada, o IRT devolve null e o líquido não é mostrado.

export const TAXA_SEGURANCA_SOCIAL = 0.03;

type Escalao = { ate: number | null; taxa: number; parcelaFixa: number; excessoDe: number };

// Preencher com a tabela oficial: [{ ate, taxa, parcelaFixa, excessoDe }, ...]
export const TABELA_IRT: Escalao[] = [];

export function calcularIRT(materiaColectavel: number): number | null {
  if (TABELA_IRT.length === 0) return null;
  const e = TABELA_IRT.find((x) => x.ate == null || materiaColectavel <= x.ate)!;
  return Math.max(0, e.parcelaFixa + (materiaColectavel - e.excessoDe) * e.taxa);
}

export function calcularLiquido(base: number, subsidios: number) {
  const bruto = base + subsidios;
  const ss = Math.round(bruto * TAXA_SEGURANCA_SOCIAL);
  const irt = calcularIRT(bruto - ss);
  const liquido = irt == null ? null : Math.round(bruto - ss - irt);
  return { bruto, ss, irt: irt == null ? null : Math.round(irt), liquido };
}
