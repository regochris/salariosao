import Link from "next/link";
import type { Metadata } from "next";
import { SearchIcon } from "@/components/Icons";
import { listaCargos, type CargoLista } from "@/lib/consultas";
import { formatKz, MINIMO_RESPOSTAS } from "@/lib/format";
import { h1, pillPrimary } from "@/lib/ui";

export const metadata: Metadata = { title: "Pesquisar salários" };
export const revalidate = 300;

const SEM_AREA = "Outras profissões";

// Agrupa por área. Dentro de cada área: primeiro os cargos com dados, depois por ordem alfabética.
function agrupar(cargos: CargoLista[]) {
  const m = new Map<string, CargoLista[]>();
  for (const c of cargos) {
    const a = c.area ?? SEM_AREA;
    if (!m.has(a)) m.set(a, []);
    m.get(a)!.push(c);
  }
  return [...m.entries()]
    .map(([area, lista]) => ({
      area,
      lista: lista.sort((x, y) => Number(y.n >= MINIMO_RESPOSTAS) - Number(x.n >= MINIMO_RESPOSTAS) || x.cargo.localeCompare(y.cargo, "pt")),
      comDados: lista.filter((c) => c.n >= MINIMO_RESPOSTAS).length,
    }))
    .sort((a, b) => (a.area === SEM_AREA ? 1 : b.area === SEM_AREA ? -1 : a.area.localeCompare(b.area, "pt")));
}

function Linha({ c }: { c: CargoLista }) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link href={`/salarios/${c.slug}`} className="row num flex items-baseline justify-between gap-3 px-4 py-3.5 text-ink no-underline md:px-5">
        <span className="font-medium">{c.cargo}</span>
        <span className="flex shrink-0 items-baseline gap-3">
          {c.n >= MINIMO_RESPOSTAS ? (
            <>
              <span className="hidden text-[13px] text-muted sm:inline">{c.n} resp.</span>
              <span className="font-semibold">{formatKz(c.mediana)}</span>
            </>
          ) : (
            <span className="text-[13px] text-muted">{c.n > 0 ? "Poucos dados" : "Sem dados"}</span>
          )}
          <span className="text-muted">›</span>
        </span>
      </Link>
    </li>
  );
}

export default async function Salarios({ searchParams }: { searchParams: Promise<{ q?: string; area?: string }> }) {
  const { q = "", area = "" } = await searchParams;
  const todos = await listaCargos(q);
  const grupos = agrupar(todos);
  const visiveis = area ? grupos.filter((g) => g.area === area) : grupos;
  const aberto = Boolean(q || area);
  const ligacao = (a: string) => `/salarios?${new URLSearchParams({ ...(q ? { q } : {}), ...(a ? { area: a } : {}) })}`;

  return (
    <div className="mx-auto flex max-w-[1024px] flex-col gap-6 px-5 pt-10 pb-16 md:px-[22px] md:pt-16">
      <h1 className={h1}>Pesquisar salários.</h1>

      <form action="/salarios" className="flex h-[52px] w-full max-w-[640px] items-center gap-2 rounded-pill border border-input bg-bg pr-2 pl-5 transition-colors focus-within:border-primary hover:border-ink">
        <label htmlFor="q" className="sr-only">Cargo ou profissão</label>
        <SearchIcon className="shrink-0 text-muted" />
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Procure um cargo, ex.: enfermeiro"
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted" />
        {area && <input type="hidden" name="area" value={area} />}
        <button type="submit" className={pillPrimary}>Pesquisar</button>
      </form>

      {grupos.length > 1 && (
        <nav aria-label="Áreas" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <Link href={ligacao("")} aria-current={!area ? "page" : undefined}
            className={`plain flex h-9 shrink-0 items-center rounded-pill px-4 text-sm font-medium no-underline transition-colors ${!area ? "bg-ink text-bg" : "border border-input bg-bg text-ink hover:border-ink"}`}>
            Todas <span className="num ml-1.5 opacity-60">{todos.length}</span>
          </Link>
          {grupos.map((g) => (
            <Link key={g.area} href={ligacao(g.area)} aria-current={area === g.area ? "page" : undefined}
              className={`plain flex h-9 shrink-0 items-center rounded-pill px-4 text-sm font-medium no-underline transition-colors ${area === g.area ? "bg-ink text-bg" : "border border-input bg-bg text-ink hover:border-ink"}`}>
              {g.area} <span className="num ml-1.5 opacity-60">{g.lista.length}</span>
            </Link>
          ))}
        </nav>
      )}

      <p className="m-0 text-[15px] text-muted">
        {q ? `${todos.length} resultado(s) para "${q}"` : `${todos.length} profissões em ${grupos.length} áreas`}
        {area && ` · ${area}`}
      </p>

      {visiveis.length === 0 ? (
        <div className="rounded-tile bg-surface p-8 text-center">
          <p className="m-0 font-semibold">Ainda não temos este cargo.</p>
          <p className="m-0 mt-1 text-[15px] text-muted">Partilhe o seu salário e o cargo entra no catálogo.</p>
          <Link href="/partilhar" className={`${pillPrimary} mt-4`}>Partilhar o meu salário</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visiveis.map((g) => (
            <details key={g.area} open={aberto || visiveis.length === 1} className="group overflow-hidden rounded-tile bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 md:px-5 [&::-webkit-details-marker]:hidden">
                <span className="flex flex-col">
                  <strong className="text-[17px] font-semibold md:text-[19px]">{g.area}</strong>
                  <span className="text-[13px] text-muted">{g.lista.length} profissões{g.comDados > 0 ? ` · ${g.comDados} com dados` : ""}</span>
                </span>
                <span aria-hidden className="text-xl text-muted transition-transform group-open:rotate-90">›</span>
              </summary>
              <ul className="m-0 list-none border-t border-line bg-bg p-0">
                {g.lista.map((c) => <Linha key={c.slug} c={c} />)}
              </ul>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
