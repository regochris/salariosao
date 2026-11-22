import type { Metadata } from "next";
import { Suspense } from "react";
import { Entrar } from "./Entrar";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <div className="mx-auto max-w-[440px] px-5 pt-12 pb-16 md:pt-20">
      <Suspense>
        <Entrar />
      </Suspense>
    </div>
  );
}
