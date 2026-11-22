"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { field, label, pillPrimary } from "@/lib/ui";

type Perfil = "trabalho" | "estudante";

const opcoes: { v: Perfil; titulo: string; texto: string }[] = [
  { v: "trabalho", titulo: "Trabalho", texto: "Partilho o meu salário e vejo todos os dados." },
  { v: "estudante", titulo: "Estudo ou procuro emprego", texto: "Vejo as médias salariais por profissão." },
];

export function Registo({ inicial }: { inicial: Perfil }) {
  const [perfil, setPerfil] = useState<Perfil>(inicial);
  const router = useRouter();

  // TODO (fase 4): criar a conta no Supabase Auth (email ou telefone) e guardar o perfil.
  const criar = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(perfil === "trabalho" ? "/partilhar" : "/salarios");
  };

  return (
    <form onSubmit={criar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px]">Criar conta.</h1>
        <p className="m-0 text-[17px] text-muted">Grátis. Os seus dados salariais nunca ficam ligados ao seu nome.</p>
      </div>

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className={`${label} mb-2.5`}>Qual é a sua situação?</legend>
        {opcoes.map((o) => (
          <button
            key={o.v}
            type="button"
            aria-pressed={perfil === o.v}
            onClick={() => setPerfil(o.v)}
            className={`btn flex flex-col items-start gap-0.5 rounded-tile border-2 px-[18px] py-4 text-left text-ink ${
              perfil === o.v ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-input"
            }`}
          >
            <strong className="font-semibold">{o.titulo}</strong>
            <span className="text-sm text-muted">{o.texto}</span>
          </button>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="r-id" className={label}>Email ou número de telefone</label>
        <input id="r-id" name="contacto" required autoComplete="username" placeholder="nome@email.com ou 9XX XXX XXX" className={`${field} h-12`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="r-pw" className={label}>Palavra-passe</label>
        <input id="r-pw" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={`${field} h-12`} />
      </div>

      <button type="submit" className={`${pillPrimary} h-[50px]`}>
        {perfil === "trabalho" ? "Criar conta e partilhar" : "Criar conta"}
      </button>
      <p className="m-0 text-center text-[15px]">Já tem conta? <Link href="/entrar">Entrar</Link></p>
      <p className="m-0 text-center text-xs text-muted">
        Ao criar conta aceita os <Link href="/termos">Termos</Link> e a <Link href="/privacidade">Política de privacidade</Link>.
      </p>
    </form>
  );
}
