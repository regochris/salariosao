"use client";

import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { field, label, pillPrimary } from "@/lib/ui";

type Perfil = "trabalhador" | "estudante";

const opcoes: { v: Perfil; titulo: string; texto: string }[] = [
  { v: "trabalhador", titulo: "Trabalho", texto: "Partilho o meu salário e vejo todos os dados." },
  { v: "estudante", titulo: "Estudo ou procuro emprego", texto: "Vejo as médias salariais por profissão." },
];

export function Registo({ inicial }: { inicial: Perfil }) {
  const [perfil, setPerfil] = useState<Perfil>(inicial);
  const [estado, setEstado] = useState<"livre" | "a_enviar" | "enviado">("livre");
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");

  const criar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    setEstado("a_enviar");
    const form = new FormData(e.currentTarget);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
      options: {
        data: { tipo: perfil },
        emailRedirectTo: `${window.location.origin}/auth/confirmar?seguinte=${perfil === "trabalhador" ? "/partilhar" : "/salarios"}`,
      },
    });
    if (error) {
      setEstado("livre");
      setErro(
        error.message.includes("already registered")
          ? "Já existe uma conta com este email. Entre ou recupere a palavra-passe."
          : error.message.includes("Password")
            ? "A palavra-passe deve ter pelo menos 8 caracteres."
            : "Não foi possível criar a conta. Tente de novo dentro de momentos.",
      );
      return;
    }
    setEmail(String(form.get("email")));
    setEstado("enviado");
  };

  if (estado === "enviado") {
    return (
      <div className="flex flex-col items-center gap-3 pt-10 text-center">
        <div className="flex size-[72px] items-center justify-center rounded-full bg-primary-soft text-primary">
          <svg aria-hidden width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        </div>
        <h1 className="m-0 mt-2 text-[32px] leading-9 font-bold tracking-[-0.6px]">Confirme o seu email.</h1>
        <p className="m-0 max-w-[34ch] text-[17px] text-muted">
          Enviámos um link para <strong className="text-ink">{email}</strong>. Abra-o para ativar a conta. Sem confirmação não é possível partilhar.
        </p>
        <p className="m-0 text-sm text-muted">Não chegou? Veja na pasta de spam ou promoções.</p>
      </div>
    );
  }

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
        <label htmlFor="r-email" className={label}>Email</label>
        <input id="r-email" name="email" type="email" required autoComplete="email" placeholder="nome@email.com" className={`${field} h-12`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="r-pw" className={label}>Palavra-passe</label>
        <input id="r-pw" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={`${field} h-12`} />
      </div>

      {erro && <p role="alert" className="m-0 rounded-[12px] bg-surface px-4 py-3 text-[15px] text-error">{erro}</p>}

      <button type="submit" disabled={estado === "a_enviar"} className={`${pillPrimary} h-[50px] disabled:opacity-50`}>
        {estado === "a_enviar" ? "A criar conta…" : perfil === "trabalhador" ? "Criar conta e partilhar" : "Criar conta"}
      </button>
      <p className="m-0 text-center text-[15px]">Já tem conta? <Link href="/entrar">Entrar</Link></p>
      <p className="m-0 text-center text-xs text-muted">
        Ao criar conta aceita os <Link href="/termos">Termos</Link> e a <Link href="/privacidade">Política de privacidade</Link>.
      </p>
    </form>
  );
}
