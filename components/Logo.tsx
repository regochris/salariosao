// Logótipo Wiva: dois V (quem contrata, a azul; quem trabalha, a terracota) que formam um W.
// No centro, o V terracota passa à frente do azul, separado por uma folga fina (já recortada no desenho,
// por isso funciona sobre qualquer fundo). Grelha de 48; braços com inclinação 9 : 30.

const V_AZUL = "2,9 11,39 19,39 23.2,25 19.2,11.67 15,25.67 10,9";
const V_TERRACOTA = "20,9 29,39 37,39 46,9 38,9 33,25.67 28,9";

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
