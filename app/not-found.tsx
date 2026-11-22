import Link from "next/link";

// Página mostrada quando um endereço ainda não existe (páginas em construção).
export default function NaoEncontrado() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-5 py-20 text-center">
      <p className="m-0 text-[17px] font-semibold text-primary">Em construção</p>
      <h1 className="m-0 max-w-[18ch] text-[40px] leading-[44px] font-bold tracking-[-1px]">
        Esta página está quase pronta.
      </h1>
      <p className="m-0 max-w-[34ch] text-[19px] leading-[26px] text-muted">
        Estamos a preparar esta secção do SaláriosAO. Volte em breve.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex h-11 items-center rounded-pill bg-primary px-[22px] text-[15px] font-medium text-on-primary no-underline hover:text-on-primary"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
