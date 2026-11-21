import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface text-xs leading-4 text-muted">
      <div className="mx-auto flex max-w-[1024px] flex-col gap-3 px-5 pt-5 pb-8 md:px-[22px]">
        <p className="m-0 border-b border-line pb-3">
          Os valores são medianas do salário base mensal bruto, calculadas a partir de partilhas anónimas e de tabelas
          oficiais. Nunca mostramos respostas individuais.
        </p>
        <div className="flex flex-wrap justify-between gap-3">
          <span>SaláriosAO · Angola</span>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/metodologia" className="text-muted">Metodologia</Link>
            <Link href="/privacidade" className="text-muted">Privacidade</Link>
            <Link href="/termos" className="text-muted">Termos</Link>
            <Link href="/contacto" className="text-muted">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
