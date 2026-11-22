import type { Metadata } from "next";
import { Tabelas } from "./Tabelas";

export const metadata: Metadata = { title: "Função pública — tabelas salariais" };

export default function FuncaoPublica() {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-3 pb-16">
      <section className="flex flex-col gap-1.5 px-2 pt-10 pb-2 text-center md:pt-16">
        <p className="m-0 text-[15px] font-semibold text-accent">Tabelas oficiais</p>
        <h1 className="m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px]">Quanto paga o Estado.</h1>
        <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">Por carreira, categoria e escalão.</p>
      </section>
      <Tabelas />
    </div>
  );
}
