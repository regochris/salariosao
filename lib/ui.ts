// Classes repetidas (botões em pílula, campos). Mantém o visual do DESIGN.md num só sítio.
export const pill =
  "btn inline-flex h-11 items-center justify-center rounded-pill px-[22px] text-[15px] font-medium no-underline";
export const pillPrimary = `${pill} bg-button text-on-button hover:bg-button-hover hover:text-on-button`;
export const pillOutline = `${pill} border border-primary text-primary hover:bg-primary-soft hover:text-primary`;
export const pillQuiet = `${pill} border border-input bg-bg text-ink hover:bg-surface hover:text-ink`;

export const label = "text-sm leading-5 font-medium";
export const field =
  "h-11 w-full rounded-[10px] border border-input bg-bg px-3 text-ink outline-none transition-colors hover:border-ink focus:border-primary focus:ring-2 focus:ring-primary/25";

export const h1 = "m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px] md:tracking-[-1px]";
export const h2 = "m-0 text-[22px] leading-7 font-bold";
