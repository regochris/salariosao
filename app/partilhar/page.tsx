import type { Metadata } from "next";
import { Formulario } from "./Formulario";

export const metadata: Metadata = { title: "Partilhar o meu salário" };

export default function Partilhar() {
  return (
    <div className="mx-auto max-w-[560px] px-5 pt-6 pb-10">
      <Formulario />
    </div>
  );
}
