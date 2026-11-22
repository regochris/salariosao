import type { Metadata } from "next";
import { Calculadora } from "./Calculadora";

export const metadata: Metadata = { title: "Calculadora de salário líquido" };

export default function CalculadoraPage() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-3 px-3 pb-16">
      <section className="flex flex-col gap-1.5 px-2 pt-10 pb-5 text-center md:pt-16">
        <h1 className="m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px] md:text-5xl md:leading-[52px]">Do bruto ao líquido.</h1>
        <p className="m-0 text-[17px] text-muted md:text-[21px] md:leading-7">
          Quanto recebe de facto, depois do IRT e da Segurança Social.
        </p>
      </section>
      <Calculadora />
    </div>
  );
}
