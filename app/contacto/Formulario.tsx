"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { field, label, pillPrimary } from "@/lib/ui";

export function Formulario() {
  const [enviado, setEnviado] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setAEnviar(true);
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().from("mensagens").insert({
      nome: String(f.get("nome")).trim(),
      contacto: String(f.get("contacto")).trim(),
      assunto: String(f.get("assunto")),
      mensagem: String(f.get("mensagem")).trim(),
    });
    setAEnviar(false);
    if (error) setErro("Não foi possível enviar. Verifique a ligação e tente de novo.");
    else setEnviado(true);
  }

  if (enviado) {
    return (
      <p role="status" className="rounded-tile bg-primary-soft p-5 text-center">
        Mensagem enviada. Respondemos o mais breve possível.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-tile bg-surface p-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-nome" className={label}>Nome</label>
        <input id="c-nome" name="nome" required className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-contacto" className={label}>Email ou telefone</label>
        <input id="c-contacto" name="contacto" required className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-assunto" className={label}>Assunto</label>
        <select id="c-assunto" name="assunto" className={field}>
          <option>Dúvida</option>
          <option>Sugestão</option>
          <option>Os meus dados</option>
          <option>Empresas e parcerias</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-msg" className={label}>Mensagem</label>
        <textarea id="c-msg" name="mensagem" required rows={5} className={`${field} h-auto py-2.5`} />
      </div>
      {erro && <p role="alert" className="m-0 text-[15px] text-error">{erro}</p>}
      <button type="submit" disabled={aEnviar} className={`${pillPrimary} self-start disabled:opacity-60`}>{aEnviar ? "A enviar…" : "Enviar mensagem"}</button>
    </form>
  );
}
