"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { field, label, pillPrimary, pillQuiet } from "@/lib/ui";

export function Entrar() {
  const router = useRouter();
  const params = useSearchParams();
  const seguinte = params.get("seguinte") ?? "/conta";
  const [recuperar, setRecuperar] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState(params.get("erro") === "link" ? "O link expirou ou já foi usado. Peça um novo." : "");

  const entrar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    setAEnviar(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    setAEnviar(false);
    if (error) {
      setErro(
        error.message.includes("Email not confirmed")
          ? "Ainda não confirmou o email. Abra o link que lhe enviámos."
          : "Email ou palavra-passe incorrectos.",
      );
      return;
    }
    router.push(seguinte.startsWith("/") ? seguinte : "/conta");
    router.refresh();
  };

  const pedirRecuperacao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAEnviar(true);
    const form = new FormData(e.currentTarget);
    await supabaseBrowser().auth.resetPasswordForEmail(String(form.get("email")).trim(), {
      redirectTo: `${window.location.origin}/auth/confirmar?seguinte=/conta/palavra-passe`,
    });
    setAEnviar(false);
    setEnviado(true);
  };

  if (recuperar) {
    return (
      <form onSubmit={pedirRecuperacao} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="m-0 text-[32px] leading-9 font-bold tracking-[-0.6px]">Recuperar acesso.</h1>
          <p className="m-0 text-[17px] text-muted">Indique o email da sua conta.</p>
        </div>
        {enviado ? (
          <p role="status" className="rounded-[14px] bg-primary-soft px-4 py-3 text-center text-[15px]">
            Se existir uma conta com este email, vai receber um link para definir uma nova palavra-passe.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rec-email" className={label}>Email</label>
              <input id="rec-email" name="email" type="email" required autoComplete="email" className={`${field} h-12`} />
            </div>
            <button type="submit" disabled={aEnviar} className={`${pillPrimary} h-[50px] disabled:opacity-50`}>Enviar link</button>
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
        <label htmlFor="e-email" className={label}>Email</label>
        <input id="e-email" name="email" type="email" required autoComplete="email" placeholder="nome@email.com" className={`${field} h-12`} />
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

      {erro && <p role="alert" className="m-0 rounded-[12px] bg-surface px-4 py-3 text-[15px] text-error">{erro}</p>}

      <button type="submit" disabled={aEnviar} className={`${pillPrimary} h-[50px] disabled:opacity-50`}>{aEnviar ? "A entrar…" : "Entrar"}</button>

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
