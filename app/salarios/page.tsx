import Link from "next/link";
import type { Metadata } from "next";
import { SearchIcon } from "@/components/Icons";
import { pesquisar } from "@/lib/dados";
import { formatKz } from "@/lib/format";
import { h1, pillPrimary } from "@/lib/ui";

export const metadata: Metadata = { title: "Pesquisar salários" };

export default async function Salarios({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const resultados = pesquisar(q);

  return (
    <div className="mx-auto flex max-w-[1024px] flex-col gap-6 px-5 pt-10 pb-16 md:px-[22px] md:pt-16">
      <h1 className={h1}>Pesquisar salários.</h1>

      <form action="/salarios" className="flex h-[52px] w-full max-w-[640px] items-center gap-2 rounded-pill bg-surface pr-2 pl-5">
        <label htmlFor="q" className="sr-only">Cargo ou profissão</label>
        <SearchIcon className="shrink-0 text-muted" />
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Procure um cargo, ex.: enfermeiro"
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
        />
        <button type="submit" className={pillPrimary}>Pesquisar</button>
      </form>

      <p className="m-0 text-[15px] text-muted">
        {q ? `${resultados.length} resultado(s) para "${q}"` : "Todas as profissões"}
      </p>

      {resultados.length === 0 ? (
        <div className="rounded-tile bg-surface p-8 text-center">
          <p className="m-0 font-semibold">Ainda não temos dados para este cargo.</p>
          <p className="m-0 mt-1 text-[15px] text-muted">Seja o primeiro a partilhar e ajude quem vem a seguir.</p>
          <Link href="/partilhar" className={`${pillPrimary} mt-4`}>Partilhar o meu salário</Link>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {resultados.map((p) => (
            <li key={p.slug} className="border-b border-line last:border-b-0">
              <Link href={`/salarios/${p.slug}`} className="num flex flex-wrap items-baseline justify-between gap-2 py-4 text-ink no-underline md:py-5 md:text-[19px]">
                <span>
                  <span className="font-semibold">{p.cargo}</span>
                  <span className="ml-3 text-[15px] text-muted">{p.area}</span>
                </span>
                <span>{formatKz(p.mediana)} ›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
