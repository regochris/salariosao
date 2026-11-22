import type { Metadata } from "next";
import { PaginaTexto } from "@/components/Texto";
import { Formulario } from "./Formulario";

export const metadata: Metadata = { title: "Contacto" };

export default function Contacto() {
  return (
    <PaginaTexto
      etiqueta="Contacto"
      titulo="Fale connosco."
      intro="Dúvidas, sugestões, pedidos sobre os seus dados ou parcerias para empresas."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-tile bg-surface p-5">
          <strong className="mb-1 block font-semibold">Email</strong>
          <span className="text-[15px] text-muted">[email de contacto]</span>
        </div>
        <div className="rounded-tile bg-surface p-5">
          <strong className="mb-1 block font-semibold">Empresas e parcerias</strong>
          <span className="text-[15px] text-muted">[email para empresas]</span>
        </div>
      </div>
      <Formulario />
    </PaginaTexto>
  );
}
