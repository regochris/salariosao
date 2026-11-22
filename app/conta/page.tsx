import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer, utilizadorAtual } from "@/lib/supabase/server";
import { formatKz } from "@/lib/format";
import { pillPrimary, pillQuiet } from "@/lib/ui";

export const metadata: Metadata = { title: "A minha conta" };
export const dynamic = "force-dynamic";

const estadoTexto = { pendente: "Em revisão", aprovada: "Aprovada", rejeitada: "Não aprovada" } as const;
const estadoCor = { pendente: "text-warning", aprovada: "text-success", rejeitada: "text-error" } as const;

export default async function Conta({ searchParams }: { searchParams: Promise<{ confirmado?: string; enviado?: string }> }) {
  const u = await utilizadorAtual();
  if (!u) redirect("/entrar?seguinte=/conta");
  const { confirmado, enviado } = await searchParams;

  const supabase = await supabaseServer();
  const { data: partilhas } = await supabase
    .from("partilhas")
    .select("id, cargo_texto, sector, ano, salario_base, moeda, estado, criado_em")
    .order("criado_em", { ascending: false });

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-5 pt-10 pb-20 md:pt-16">
      {confirmado && <p role="status" className="m-0 rounded-[14px] bg-primary-soft px-4 py-3 text-[15px]">Email confirmado. A sua conta está activa.</p>}
      {enviado && <p role="status" className="m-0 rounded-[14px] bg-primary-soft px-4 py-3 text-[15px]">Obrigado! A sua partilha foi recebida.</p>}

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-[34px] leading-[38px] font-bold tracking-[-0.7px]">A minha conta.</h1>
          <p className="m-0 mt-1 text-muted">{u.email}</p>
        </div>
        <form action="/auth/sair" method="post">
          <button type="submit" className={pillQuiet}>Sair</button>
        </form>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-tile bg-surface p-5">
          <span className="text-sm text-muted">Perfil</span>
          <p className="m-0 mt-1 font-semibold">{u.tipo === "trabalhador" ? "Trabalhador" : "Estudante"}</p>
        </div>
        <div className="rounded-tile bg-surface p-5">
          <span className="text-sm text-muted">Email</span>
          <p className={`m-0 mt-1 font-semibold ${u.confirmado ? "text-success" : "text-warning"}`}>{u.confirmado ? "Confirmado" : "Por confirmar"}</p>
        </div>
        <div className="rounded-tile bg-surface p-5">
          <span className="text-sm text-muted">Partilhas</span>
          <p className="num m-0 mt-1 font-semibold">{partilhas?.length ?? 0}</p>
        </div>
      </section>

      {u.papel === "admin" && (
        <Link href="/admin" className="card flex items-center justify-between rounded-tile bg-ink p-5 text-bg">
          <strong className="font-semibold">Painel de administração</strong><span>›</span>
        </Link>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 text-[22px] leading-7 font-bold">As minhas partilhas</h2>
          {u.tipo === "trabalhador" && <Link href="/partilhar" className="text-[15px]">+ Nova partilha</Link>}
        </div>
        {!partilhas?.length ? (
          <div className="rounded-tile bg-surface p-8 text-center">
            <p className="m-0 font-semibold">Ainda não partilhou nenhum salário.</p>
            <p className="m-0 mt-1 text-[15px] text-muted">Partilhe e desbloqueie os subsídios e benefícios de cada cargo.</p>
            <Link href="/partilhar" className={`${pillPrimary} mt-4`}>Partilhar o meu salário</Link>
          </div>
        ) : (
          <ul className="m-0 list-none rounded-tile bg-surface p-0">
            {partilhas.map((p) => (
              <li key={p.id} className="num flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 last:border-b-0">
                <span className="flex flex-col">
                  <strong className="font-semibold">{p.cargo_texto}</strong>
                  <span className="text-sm text-muted">{p.sector === "publico" ? "Público" : "Privado"} · {p.ano}</span>
                </span>
                <span className="flex flex-col items-end">
                  <span>{p.moeda === "AOA" ? formatKz(Number(p.salario_base)) : `${Number(p.salario_base).toLocaleString("pt-AO")} USD`}</span>
                  <span className={`text-sm font-medium ${estadoCor[p.estado as keyof typeof estadoCor]}`}>{estadoTexto[p.estado as keyof typeof estadoTexto]}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/conta/palavra-passe" className="text-[15px]">Mudar palavra-passe</Link>
    </div>
  );
}
