import type { Metadata } from "next";
import { tabelaFuncaoPublica } from "@/lib/consultas";
import { supabaseServer } from "@/lib/supabase/server";
import { Analise, type AbaFP } from "./Analise";

export const metadata: Metadata = {
  title: "Função pública — tabelas e carreiras",
  description: "Vencimentos base da função pública de Angola: simulador de carreira, comparação entre carreiras e ranking.",
};
export const revalidate = 3600;

export default async function FuncaoPublica({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const supabase = await supabaseServer();
  const [linhas, { data: provincias }, { data: municipios }, { data: incentivos }] = await Promise.all([
    tabelaFuncaoPublica(),
    supabase.from("provincias").select("id, nome").order("nome"),
    supabase.from("municipios").select("id, nome, provincia_id, classe").order("nome").limit(1000),
    supabase.from("componentes").select("nome, valor, diplomas(numero)").in("nome", ["Subsídio de isolamento", "Subsídio de renda de casa"]).is("valido_ate", null),
  ]);
  const diploma = linhas[0]?.diploma ?? null;
  const inc = (n: string) => Number(incentivos?.find((i) => i.nome === n)?.valor ?? 0);
  const diplomaIncentivos = (incentivos?.[0]?.diplomas as unknown as { numero: string } | null)?.numero ?? null;
  const aba: AbaFP = t === "simulador" || t === "comparar" || t === "ranking" ? t : "tabelas";

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-5 px-3 pb-16">
      <section className="flex flex-col gap-1.5 px-2 pt-10 pb-2 text-center md:pt-16">
        <p className="m-0 text-[15px] font-semibold text-accent">Tabelas oficiais</p>
        <h1 className="m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px]">Quanto paga o Estado.</h1>
        <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">Vencimento base por carreira e categoria{diploma ? ` · ${diploma}` : ""}.</p>
      </section>
      <Analise
        abaInicial={aba}
        linhas={linhas}
        provincias={provincias ?? []}
        municipios={municipios ?? []}
        incentivos={{ isolamento: inc("Subsídio de isolamento"), renda: inc("Subsídio de renda de casa"), diploma: diplomaIncentivos }}
      />
    </div>
  );
}
