// Classes repetidas (botões em pílula, campos). Mantém o visual do DESIGN.md num só sítio.
export const pill =
  "inline-flex h-11 items-center justify-center rounded-pill px-[22px] text-[15px] font-medium no-underline";
export const pillPrimary = `${pill} bg-primary text-on-primary hover:bg-primary-hover hover:text-on-primary`;
export const pillOutline = `${pill} border border-primary text-primary`;
export const pillQuiet = `${pill} border border-line bg-bg text-ink`;

export const label = "text-sm leading-5 font-medium";
export const field =
  "h-11 w-full rounded-[10px] border border-line bg-bg px-3 text-ink outline-none focus:border-primary";

export const h1 = "m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px] md:tracking-[-1px]";
export const h2 = "m-0 text-[22px] leading-7 font-bold";
