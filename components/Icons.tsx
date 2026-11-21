// Ícones em SVG inline (estilo Lucide, traço 1,75–2 px). Decorativos: aria-hidden.
type P = { size?: number; className?: string };

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className,
});

export const SearchIcon = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const HomeIcon = ({ size = 22, className }: P) => (
  <svg {...base(size, className)} strokeWidth={1.75}>
    <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
  </svg>
);

export const PlusCircleIcon = ({ size = 22, className }: P) => (
  <svg {...base(size, className)} strokeWidth={1.75}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const UserIcon = ({ size = 22, className }: P) => (
  <svg {...base(size, className)} strokeWidth={1.75}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const ShieldIcon = ({ size = 16, className }: P) => (
  <svg {...base(size, className)} strokeWidth={1.75}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
  </svg>
);
