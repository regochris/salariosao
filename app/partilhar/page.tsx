import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer, utilizadorAtual } from "@/lib/supabase/server";
import { pillPrimary, pillQuiet } from "@/lib/ui";
import { Formulario, type Catalogo } from "./Formulario";

export const metadata: Metadata = { title: "Partilhar o meu salário" };
export const dynamic = "force-dynamic";

function Aviso({ titulo, texto, children }: { titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center gap-3 px-5 pt-16 pb-20 text-center">
      <h1 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px]">{titulo}</h1>
      <p className="m-0 text-[17px] text-muted">{texto}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  );
}

export default async function Partilhar() {
  const u = await utilizadorAtual();
  if (!u) {
    return (
      <Aviso titulo="Partilhe o seu salário." texto="Para partilhar precisa de uma conta. Leva 1 minuto e os seus dados ficam anónimos.">
        <Link href="/registo" className={pillPrimary}>Criar conta</Link>
        <Link href="/entrar?seguinte=/partilhar" className={pillQuiet}>Já tenho conta</Link>
      </Aviso>
    );
  }
  if (!u.confirmado) {
    return (
      <Aviso titulo="Confirme o seu email." texto={`Enviámos um link para ${u.email}. Depois de confirmar, volte aqui para partilhar.`}>
        <Link href="/conta" className={pillQuiet}>A minha conta</Link>
      </Aviso>
    );
  }

  const supabase = await supabaseServer();
  const [areas, cargos, provincias, ramos, tabela, municipios, niveis] = await Promise.all([
    supabase.from("areas").select("id, nome").eq("activo", true).order("nome"),
    supabase.from("cargos").select("id, nome, sinonimos, area_id").eq("activo", true).order("nome"),
    supabase.from("provincias").select("id, nome").order("nome"),
    supabase.from("ramos").select("id, nome").eq("activo", true).order("nome"),
    supabase.from("tabela_vigente").select("anexo, tabela, tabela_id, carreira, carreira_id, categoria, categoria_id, ordem, posicao_id, variante, vencimento_base").order("tabela_id").order("carreira_id").order("ordem"),
    supabase.from("municipios").select("id, nome, provincia_id, classe").order("nome").limit(1000),
    supabase.from("niveis").select("nome, descricao").eq("activo", true).order("ordem"),
  ]);

  const catalogo: Catalogo = {
    areas: areas.data ?? [],
    cargos: cargos.data ?? [],
    provincias: provincias.data ?? [],
    ramos: ramos.data ?? [],
    municipios: municipios.data ?? [],
    niveis: niveis.data ?? [],
    posicoes: (tabela.data ?? []).map((r) => ({ ...r, vencimento_base: Number(r.vencimento_base) })),
  };

  return (
    <div className="mx-auto max-w-[560px] px-5 pt-6 pb-10">
      <Formulario catalogo={catalogo} autorId={u.id} />
    </div>
  );
}
