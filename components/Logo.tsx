// Logótipo Wiva: dois V (quem contrata, a azul; quem trabalha, a terracota) que se cruzam e formam um W.
// O braço terracota passa por cima do azul com uma folga fina, já recortada no desenho
// (funciona sobre qualquer fundo). Grelha de 48; braços com inclinação 10,5 : 30 e traço 7,5.

const V_AZUL = "2.03,9 12.53,39 20.47,39 23.1,31.5 19.13,20.14 16.5,27.65 9.97,9";
const V_AZUL_PONTA = "26.77,9 30.97,9 28.87,15"; // a ponta do braço azul que aparece por cima do cruzamento
const V_TERRACOTA = "17.03,9 27.53,39 35.47,39 45.97,9 38.03,9 31.5,27.65 24.97,9";

const PALETAS = {
  cor: ["#0066CC", "#C2571E"],
  escuro: ["#3D9BFF", "#E8875A"], // sobre fundos escuros
  azul: ["#FFFFFF", "#F6C7A6"],   // sobre fundo azul (ícone da app)
  mono: ["currentColor", "currentColor"],
} as const;

export type VarianteLogo = keyof typeof PALETAS;

export function Simbolo({ tamanho = 28, variante = "cor", className }: { tamanho?: number; variante?: VarianteLogo; className?: string }) {
  const [a, b] = PALETAS[variante];
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" aria-hidden className={className}>
      <polygon points={V_AZUL} fill={a} />
      <polygon points={V_AZUL_PONTA} fill={a} />
      <polygon points={V_TERRACOTA} fill={b} />
    </svg>
  );
}

// Símbolo + nome. O nome fica em tinta: a cor vive só no símbolo.
export function Logo({ tamanho = 28, variante = "cor", className = "" }: { tamanho?: number; variante?: VarianteLogo; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.28em] font-bold ${className}`} style={{ fontSize: tamanho * 0.7, letterSpacing: "-0.035em", lineHeight: 1 }}>
      <Simbolo tamanho={tamanho} variante={variante} />
      <span>Wiva</span>
    </span>
  );
}
