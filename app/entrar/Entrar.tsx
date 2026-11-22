"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { field, label, pillPrimary, pillQuiet } from "@/lib/ui";

export function Entrar() {
  const router = useRouter();
  const [recuperar, setRecuperar] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // TODO (fase 4): autenticação com Supabase Auth (email ou telefone + palavra-passe).
  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/salarios");
  };

  // TODO (fase 4): enviar link de recuperação (email) ou código por SMS (telefone).
  const pedirRecuperacao = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  if (recuperar) {
    return (
      <form onSubmit={pedirRecuperacao} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px]">Recuperar acesso.</h1>
          <p className="m-0 text-[17px] text-muted">Indique o email ou telefone da sua conta.</p>
        </div>
        {enviado ? (
          <p role="status" className="rounded-[14px] bg-primary-soft px-4 py-3 text-center text-[15px]">
            Se existir uma conta com esses dados, vai receber as instruções em breve.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-id" className={label}>Email ou número de telefone</label>
              <input id="rec-id" name="contacto" required autoComplete="username" className={`${field} h-12`} />
            </div>
            <button type="submit" className={`${pillPrimary} h-[50px]`}>Enviar instruções</button>
          </>
        )}
        <button type="button" onClick={() => { setRecuperar(false); setEnviado(false); }} className={`${pillQuiet} h-[50px]`}>
          Voltar a entrar
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={entrar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px]">Entrar.</h1>
        <p className="m-0 text-[17px] text-muted">Bem-vindo de volta ao SaláriosAO.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="e-id" className={label}>Email ou número de telefone</label>
        <input id="e-id" name="contacto" required autoComplete="username" placeholder="nome@email.com ou 9XX XXX XXX" className={`${field} h-12`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="e-pw" className={label}>Palavra-passe</label>
          <button type="button" onClick={() => setRecuperar(true)} className="cursor-pointer text-sm text-primary hover:underline">
            Esqueceu-se?
          </button>
        </div>
        <input id="e-pw" name="password" type="password" required autoComplete="current-password" className={`${field} h-12`} />
      </div>

      <button type="submit" className={`${pillPrimary} h-[50px]`}>Entrar</button>

      <div className="flex items-center gap-3 text-sm text-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>
      <Link href="/registo" className={`${pillQuiet} h-[50px]`}>Criar conta grátis</Link>
      <p className="m-0 text-center text-xs text-muted">
        Os seus dados salariais nunca ficam ligados ao seu nome. <Link href="/privacidade">Saiba como</Link>.
      </p>
    </form>
  );
}
