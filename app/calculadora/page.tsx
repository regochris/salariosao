import { redirect } from "next/navigation";

// A calculadora de líquido foi substituída pelas ferramentas de comparação.
export default function CalculadoraPage() {
  redirect("/comparar");
}
