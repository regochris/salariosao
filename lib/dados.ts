// Dados provisórios.
// TODO (fase 4): substituir por consultas ao Supabase. Os valores ficam a null até haver dados reais.

export type Sector = "publico" | "privado";

export type Destaque = {
  slug: string;
  cargo: string;
  sector: Sector;
  mediana: number | null;
  respostas: number | null;
};

export type Profissao = {
  slug: string;
  cargo: string;
  area: string;
  mediana: number | null;
  liquido: number | null;
  minimo: number | null;
  p25: number | null;
  p75: number | null;
  maximo: number | null;
  respostas: number | null;
  publico: number | null;
  privado: number | null;
  porExperiencia: { faixa: string; mediana: number | null }[];
  porProvincia: { provincia: string; mediana: number | null; respostas: number | null }[];
};

const faixas = ["0 a 2 anos", "3 a 5 anos", "6 a 10 anos", "Mais de 10 anos"];
const provincias = ["Luanda", "Benguela", "Huíla", "Huambo", "Cabinda"];

function vazio(slug: string, cargo: string, area: string): Profissao {
  return {
    slug,
    cargo,
    area,
    mediana: null,
    liquido: null,
    minimo: null,
    p25: null,
    p75: null,
    maximo: null,
    respostas: null,
    publico: null,
    privado: null,
    porExperiencia: faixas.map((faixa) => ({ faixa, mediana: null })),
    porProvincia: provincias.map((provincia) => ({ provincia, mediana: null, respostas: null })),
  };
}

export const profissoes: Profissao[] = [
  vazio("enfermeiro", "Enfermeiro(a)", "Saúde"),
  vazio("contabilista", "Contabilista", "Finanças e contabilidade"),
  vazio("professor-ensino-secundario", "Professor(a) do ensino secundário", "Educação"),
  vazio("engenheiro-petroleo", "Engenheiro(a) de petróleo", "Engenharia"),
  vazio("medico", "Médico(a)", "Saúde"),
  vazio("tecnico-informatica", "Técnico(a) de informática", "Tecnologia"),
  vazio("jurista", "Jurista", "Direito"),
  vazio("gestor-comercial", "Gestor(a) comercial", "Comercial e vendas"),
];

export function getProfissao(slug: string): Profissao | undefined {
  return profissoes.find((p) => p.slug === slug);
}

export function pesquisar(q: string): Profissao[] {
  const termo = normalizar(q);
  if (!termo) return profissoes;
  return profissoes.filter((p) => normalizar(`${p.cargo} ${p.area}`).includes(termo));
}

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

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

// Função pública. TODO: carregar as tabelas oficiais (diploma e ano) no painel de administração.
// Os nomes das categorias são provisórios e devem ser confirmados com o diploma oficial.
export const carreirasPublicas: { nome: string; categorias: string[] }[] = [
  { nome: "Enfermagem", categorias: ["Enfermeiro estagiário", "Enfermeiro de 3.ª classe", "Enfermeiro de 2.ª classe", "Enfermeiro de 1.ª classe", "Enfermeiro especialista"] },
  { nome: "Docência", categorias: ["Professor do ensino primário", "Professor do I ciclo", "Professor do II ciclo", "Professor auxiliar", "Professor titular"] },
  { nome: "Técnica superior", categorias: ["Técnico superior estagiário", "Técnico superior de 2.ª classe", "Técnico superior de 1.ª classe", "Técnico superior principal", "Assessor"] },
  { nome: "Administrativa", categorias: ["Auxiliar administrativo", "Oficial administrativo", "Escriturário-dactilógrafo", "Técnico médio", "Técnico médio principal"] },
];

// Divisão político-administrativa com 21 províncias. Confirmar com a fonte oficial antes do lançamento.
export const provinciasAngola = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cubango", "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo",
  "Huíla", "Icolo e Bengo", "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Moxico Leste", "Namibe",
  "Uíge", "Zaire",
];
