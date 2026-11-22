import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { dataCurta } from "@/lib/admin";
import { marcarMensagem } from "../accoes";
import { Aviso, Cabecalho, Selo, btnQuieto } from "../ui";

export const metadata: Metadata = { title: "Mensagens" };

export default async function Mensagens({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("mensagens").select("id, nome, contacto, assunto, mensagem, lida, criado_em").order("lida").order("criado_em", { ascending: false }).limit(100);
  const contactoLink = (c: string) => (c.includes("@") ? `mailto:${c}` : `tel:${c.replace(/[^\d+]/g, "")}`);

  return (
    <>
      <Cabecalho titulo="Mensagens" sub="Enviadas pelo formulário de contacto." />
      <Aviso ok={sp.ok} erro={sp.erro} />
      {(data ?? []).length === 0 ? (
        <div className="rounded-tile bg-surface p-8 text-center text-muted">Ainda não há mensagens.</div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {data!.map((m) => (
            <li key={m.id} className={`rounded-tile p-5 ${m.lida ? "bg-surface opacity-75" : "bg-surface ring-2 ring-primary/30"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-semibold">{m.nome}</strong>
                  <a href={contactoLink(m.contacto)} className="text-sm">{m.contacto}</a>
                  <Selo texto={m.assunto} cor="bg-primary-soft text-primary" />
                  {!m.lida && <Selo texto="Nova" cor="bg-warning/15 text-warning" />}
                </div>
                <span className="text-sm text-muted">{dataCurta(m.criado_em)}</span>
              </div>
              <p className="m-0 mt-3 text-[15px] whitespace-pre-line">{m.mensagem}</p>
              <form action={marcarMensagem} className="mt-3">
                <input type="hidden" name="voltar" value="/admin/mensagens" />
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="lida" value={String(!m.lida)} />
                <button className={btnQuieto}>{m.lida ? "Marcar como não lida" : "Marcar como lida"}</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
