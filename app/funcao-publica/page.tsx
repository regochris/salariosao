import type { Metadata } from "next";
import { tabelaFuncaoPublica } from "@/lib/consultas";
import { Tabelas } from "./Tabelas";

export const metadata: Metadata = { title: "Função pública — tabelas salariais" };
export const revalidate = 3600;

export default async function FuncaoPublica() {
  const linhas = await tabelaFuncaoPublica();
  const diploma = linhas[0]?.diploma ?? null;

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-5 px-3 pb-16">
      <section className="flex flex-col gap-1.5 px-2 pt-10 pb-2 text-center md:pt-16">
        <p className="m-0 text-[15px] font-semibold text-accent">Tabelas oficiais</p>
        <h1 className="m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px]">Quanto paga o Estado.</h1>
        <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">Vencimento base por carreira e categoria{diploma ? ` · ${diploma}` : ""}.</p>
      </section>
      <Tabelas linhas={linhas} />
    </div>
  );
}
