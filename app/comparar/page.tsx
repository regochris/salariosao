import Link from "next/link";
import type { Metadata } from "next";
import { listaCargos, salariosMinimos, serieIpc } from "@/lib/consultas";
import { supabaseServer, utilizadorAtual } from "@/lib/supabase/server";
import { pillPrimary, pillQuiet } from "@/lib/ui";
import { Ferramentas, type Aba, type MinhaPartilha } from "./Ferramentas";

export const metadata: Metadata = {
  title: "Comparar",
  description: "Compare o seu salário com o mercado, avalie uma proposta de emprego e veja o seu poder de compra face à inflação.",
};
export const dynamic = "force-dynamic";

function Cabecalho() {
  return (
    <section className="flex flex-col gap-1.5 px-2 pt-10 pb-3 text-center md:pt-16">
      <h1 className="m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px]">Comparar.</h1>
      <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">O seu salário face ao mercado, propostas de emprego e poder de compra.</p>
    </section>
  );
}

function Bloqueio({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4 px-3 pb-16">
      <Cabecalho />
      <section className="flex flex-col items-center gap-3 rounded-tile bg-surface p-8 text-center">
        <strong className="text-[21px]">{titulo}</strong>
        <p className="m-0 max-w-[42ch] text-[15px] text-muted">{texto}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>
      </section>
    </div>
  );
}

export default async function Comparar({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const u = await utilizadorAtual();

  // Ferramenta reservada a quem já partilhou o salário: é assim que se desbloqueia.
  if (!u) {
    return (
      <Bloqueio titulo="Disponível para quem partilha o salário" texto="Partilhe o seu salário de forma anónima e compare-o com o mercado, avalie propostas e veja o efeito da inflação.">
        <Link href="/registo" className={pillPrimary}>Criar conta</Link>
        <Link href="/entrar?seguinte=/comparar" className={pillQuiet}>Já tenho conta</Link>
      </Bloqueio>
    );
  }

  const supabase = await supabaseServer();
  const { data: partilhas } = await supabase
    .from("partilhas")
    .select("id, cargo_texto, sector, provincia_id, salario_base_kz, ano, estado, criado_em, cargos(nome, slug), provincias(nome)")
    .neq("estado", "rejeitada")
    .not("salario_base_kz", "is", null)
    .order("criado_em", { ascending: false });

  const minhas: MinhaPartilha[] = (partilhas ?? []).map((p) => {
    const cargo = p.cargos as unknown as { nome: string; slug: string } | null;
    return {
      id: p.id as string,
      cargo: cargo?.nome ?? (p.cargo_texto as string),
      slug: cargo?.slug ?? null,
      sector: p.sector as "publico" | "privado",
      provinciaId: p.provincia_id as number,
      provincia: (p.provincias as unknown as { nome: string } | null)?.nome ?? "",
      salario: Number(p.salario_base_kz),
      ano: p.ano as number,
      estado: p.estado as string,
      criado_em: p.criado_em as string,
    };
  });

  if (minhas.length === 0) {
    return (
      <Bloqueio
        titulo={u.tipo === "estudante" ? "Disponível para quem partilha o salário" : "Partilhe o seu salário para comparar"}
        texto={u.tipo === "estudante" ? "Como estudante, pode ver as médias por profissão. As comparações pessoais usam o salário que cada pessoa partilhou." : "As comparações usam o salário que partilhou, sem ter de o escrever outra vez. Leva 2 minutos e é anónimo."}
      >
        {u.tipo === "estudante" ? <Link href="/salarios" className={pillPrimary}>Ver salários por profissão</Link> : <Link href="/partilhar" className={pillPrimary}>Partilhar o meu salário</Link>}
      </Bloqueio>
    );
  }

  const [cargos, ipc, minimos, { data: provincias }] = await Promise.all([
    listaCargos(),
    serieIpc(),
    salariosMinimos(),
    supabase.from("provincias").select("id, nome").order("nome"),
  ]);
  const aba: Aba = t === "proposta" || t === "poder" ? t : "mercado";

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4 px-3 pb-16">
      <Cabecalho />
      <Ferramentas
        abaInicial={aba}
        minhas={minhas}
        cargos={cargos.map((c) => ({ slug: c.slug, nome: c.cargo, n: c.n }))}
        provincias={provincias ?? []}
        ipc={ipc}
        minimos={minimos}
      />
    </div>
  );
}
