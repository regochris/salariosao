import type { Metadata } from "next";
import { Aviso, PaginaTexto } from "@/components/Texto";

export const metadata: Metadata = { title: "Termos de utilização" };

// RASCUNHO: rever com um jurista antes do lançamento.
export default function Termos() {
  return (
    <PaginaTexto etiqueta="Termos" titulo="Termos de utilização." actualizado="[data]">
      <Aviso>Rascunho em revisão jurídica. A versão final será publicada antes do lançamento.</Aviso>

      <section>
        <h2>O serviço</h2>
        <p>O SaláriosAO apresenta informação salarial agregada sobre Angola, com base em partilhas anónimas, tabelas oficiais, dados de empresas e pesquisa própria.</p>
      </section>

      <section>
        <h2>Valores indicativos</h2>
        <p>Os valores são estimativas e podem não corresponder a um salário concreto. Não substituem um contrato, um recibo de vencimento ou aconselhamento profissional.</p>
      </section>

      <section>
        <h2>As suas partilhas</h2>
        <ul>
          <li>Compromete-se a partilhar informação verdadeira e sobre o seu próprio salário.</li>
          <li>Não deve incluir dados que identifiquem outras pessoas.</li>
          <li>Podemos rever ou excluir partilhas que pareçam falsas ou fora do normal.</li>
        </ul>
      </section>

      <section>
        <h2>Utilização correcta</h2>
        <p>Não é permitido copiar dados em massa, tentar identificar quem partilhou ou usar o serviço para fins ilegais.</p>
      </section>

      <section>
        <h2>Alterações</h2>
        <p>Podemos actualizar estes termos. Avisaremos as alterações importantes nesta página.</p>
      </section>
    </PaginaTexto>
  );
}
