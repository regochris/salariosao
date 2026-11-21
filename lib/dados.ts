// Dados provisórios da página inicial.
// TODO (fase 4): substituir por consultas ao Supabase. Os valores ficam a null até haver dados reais.

export type Sector = "publico" | "privado";

export type Destaque = {
  slug: string;
  cargo: string;
  sector: Sector;
  mediana: number | null;
  respostas: number | null;
};

export const maisPesquisados: Destaque[] = [
  { slug: "enfermeiro", cargo: "Enfermeiro(a)", sector: "publico", mediana: null, respostas: null },
  { slug: "contabilista", cargo: "Contabilista", sector: "privado", mediana: null, respostas: null },
  { slug: "professor-ensino-secundario", cargo: "Professor(a) do ensino secundário", sector: "publico", mediana: null, respostas: null },
  { slug: "engenheiro-petroleo", cargo: "Engenheiro(a) de petróleo", sector: "privado", mediana: null, respostas: null },
];

export const comparacaoDestaque = {
  cargo: "Enfermeiro(a)",
  publico: null as number | null,
  privado: null as number | null,
  respostas: null as number | null,
};

export const sectorLabel: Record<Sector, string> = { publico: "Público", privado: "Privado" };
