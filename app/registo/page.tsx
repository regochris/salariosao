import type { Metadata } from "next";
import { Registo } from "./Registo";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegistoPage({ searchParams }: { searchParams: Promise<{ perfil?: string }> }) {
  const { perfil } = await searchParams;
  return (
    <div className="mx-auto max-w-[480px] px-5 pt-10 pb-16">
      <Registo inicial={perfil === "estudante" ? "estudante" : "trabalhador"} />
    </div>
  );
}
