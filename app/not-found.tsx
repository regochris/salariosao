import Link from "next/link";
import { pillPrimary } from "@/lib/ui";

// Página mostrada quando um endereço ainda não existe (páginas em construção).
export default function NaoEncontrado() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-5 py-20 text-center">
      <p className="m-0 text-[17px] font-semibold text-primary">Em construção</p>
      <h1 className="m-0 max-w-[18ch] text-[40px] leading-[44px] font-bold tracking-[-1px]">
        Esta página está quase pronta.
      </h1>
      <p className="m-0 max-w-[34ch] text-[19px] leading-[26px] text-muted">
        Estamos a preparar esta secção da Wiva. Volte em breve.
      </p>
      <Link href="/" className={`${pillPrimary} mt-4`}>
        Voltar ao início
      </Link>
    </section>
  );
}
