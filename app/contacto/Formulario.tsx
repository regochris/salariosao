"use client";

import { useState } from "react";
import { field, label, pillPrimary } from "@/lib/ui";

export function Formulario() {
  const [enviado, setEnviado] = useState(false);

  // TODO (fase 4): gravar a mensagem no Supabase e notificar por email.
  if (enviado) {
    return (
      <p role="status" className="rounded-tile bg-primary-soft p-5 text-center">
        Mensagem enviada. Respondemos o mais breve possível.
      </p>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setEnviado(true); }} className="flex flex-col gap-4 rounded-tile bg-surface p-5">
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
      <button type="submit" className={`${pillPrimary} self-start`}>Enviar mensagem</button>
    </form>
  );
}
