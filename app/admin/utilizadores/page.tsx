import type { Metadata } from "next";
import { exigirAdmin, dataCurta } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { definirPapel } from "../accoes";
import { Aviso, Cabecalho, Selo, btnPerigo, btnPrimario, btnQuieto, campo } from "../ui";

export const metadata: Metadata = { title: "Utilizadores" };

type U = { id: string; email: string; confirmado: boolean; tipo: string; papel: string; criado_em: string; ultimo_acesso: string | null; partilhas: number };

export default async function Utilizadores({ searchParams }: { searchParams: Promise<{ q?: string; ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const eu = await exigirAdmin();
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_utilizadores", { p_q: sp.q || null });
  const lista = (data ?? []) as U[];
  const admins = lista.filter((u) => u.papel === "admin").length;
  const voltar = `/admin/utilizadores${sp.q ? `?q=${encodeURIComponent(sp.q)}` : ""}`;

  return (
    <>
      <Cabecalho titulo="Utilizadores" sub="Contas registadas. Os emails só aparecem aqui, nunca junto das partilhas." />
      <Aviso ok={sp.ok} erro={sp.erro ?? error?.message} />
      {admins < 2 && !sp.q && (
        <p className="m-0 mb-4 rounded-[12px] bg-warning/10 px-4 py-3 text-sm text-warning">
          Há só {admins} administrador. Recomenda-se pelo menos 2: peça à outra pessoa que crie conta e confirme o email, e depois torne-a administradora aqui.
        </p>
      )}

      <form action="/admin/utilizadores" className="mb-4 flex gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Procurar por email" aria-label="Procurar por email" className={`${campo} max-w-xs`} />
        <button className={btnQuieto}>Procurar</button>
      </form>

      <div className="overflow-x-auto rounded-tile bg-surface">
        <table className="num w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              {["Email", "Tipo", "Partilhas", "Registo", "Último acesso", "Papel", ""].map((h) => <th key={h} scope="col" className="border-b border-line px-4 py-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id}>
                <td className="border-b border-line px-4 py-3">
                  {u.email}
                  {!u.confirmado && <span className="ml-2"><Selo texto="Email por confirmar" cor="bg-warning/15 text-warning" /></span>}
                </td>
                <td className="border-b border-line px-4 py-3">{u.tipo === "estudante" ? "Estudante" : "Trabalhador"}</td>
                <td className="border-b border-line px-4 py-3">{u.partilhas}</td>
                <td className="border-b border-line px-4 py-3 text-muted">{dataCurta(u.criado_em)}</td>
                <td className="border-b border-line px-4 py-3 text-muted">{dataCurta(u.ultimo_acesso)}</td>
                <td className="border-b border-line px-4 py-3">{u.papel === "admin" ? <Selo texto="Administrador" cor="bg-ink text-bg" /> : "Utilizador"}</td>
                <td className="border-b border-line px-4 py-3 text-right">
                  {u.id !== eu.id && (
                    <form action={definirPapel}>
                      <input type="hidden" name="voltar" value={voltar} />
                      <input type="hidden" name="id" value={u.id} />
                      {u.papel === "admin" ? (
                        <button name="papel" value="utilizador" className={btnPerigo}>Retirar admin</button>
                      ) : (
                        <button name="papel" value="admin" disabled={!u.confirmado} title={u.confirmado ? undefined : "Só contas com email confirmado"} className={`${btnPrimario} disabled:opacity-40`}>Tornar admin</button>
                      )}
                    </form>
                  )}
                  {u.id === eu.id && <span className="text-xs text-muted">É você</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lista.length === 200 && <p className="mt-3 text-sm text-muted">A mostrar os 200 mais recentes. Procure por email para encontrar outros.</p>}
    </>
  );
}
