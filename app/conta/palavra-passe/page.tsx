"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { field, label, pillPrimary } from "@/lib/ui";

export default function NovaPalavraPasse() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const a = String(form.get("password")), b = String(form.get("confirmar"));
    if (a !== b) return setErro("As palavras-passe não coincidem.");
    setAGuardar(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: a });
    setAGuardar(false);
    if (error) return setErro("Não foi possível guardar. Peça um novo link de recuperação.");
    router.push("/conta");
  };

  return (
    <form onSubmit={guardar} className="mx-auto flex max-w-[440px] flex-col gap-5 px-5 pt-12 pb-16">
      <h1 className="m-0 text-center text-[32px] leading-9 font-bold tracking-[-0.6px]">Nova palavra-passe.</h1>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="np" className={label}>Nova palavra-passe</label>
        <input id="np" name="password" type="password" required minLength={8} autoComplete="new-password" className={`${field} h-12`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="np2" className={label}>Repetir</label>
        <input id="np2" name="confirmar" type="password" required minLength={8} autoComplete="new-password" className={`${field} h-12`} />
      </div>
      {erro && <p role="alert" className="m-0 text-[15px] text-error">{erro}</p>}
      <button type="submit" disabled={aGuardar} className={`${pillPrimary} h-[50px] disabled:opacity-50`}>Guardar</button>
    </form>
  );
}
