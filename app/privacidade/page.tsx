import type { Metadata } from "next";
import { Aviso, PaginaTexto } from "@/components/Texto";

export const metadata: Metadata = { title: "Política de privacidade" };

// RASCUNHO: rever com um jurista antes do lançamento (Lei angolana de Protecção de Dados Pessoais).
export default function Privacidade() {
  return (
    <PaginaTexto etiqueta="Privacidade" titulo="Os seus dados, protegidos." actualizado="[data]">
      <Aviso>Rascunho em revisão jurídica. A versão final será publicada antes do lançamento.</Aviso>

      <section>
        <h2>O que recolhemos</h2>
        <ul>
          <li><strong>Dados da conta:</strong> email ou número de telefone e o seu perfil (trabalha ou estuda).</li>
          <li><strong>Dados da partilha:</strong> cargo, sector, província, experiência, formação, contrato, salário, subsídios e benefícios.</li>
          <li><strong>Dados opcionais:</strong> nome da empresa, género e contratação (nacional ou expatriado), só se os indicar.</li>
          <li><strong>Dados técnicos:</strong> informação básica de utilização para manter o site seguro e a funcionar.</li>
        </ul>
      </section>

      <section>
        <h2>Como usamos</h2>
        <ul>
          <li>Para calcular medianas e intervalos <strong>agregados</strong>. Nunca publicamos respostas individuais.</li>
          <li>Para gerir a sua conta e dar-lhe acesso aos dados detalhados.</li>
          <li>Para produzir estudos e relatórios, sempre com dados agregados e sem identificar ninguém.</li>
        </ul>
        <p>Não vendemos dados pessoais.</p>
      </section>

      <section>
        <h2>Como protegemos</h2>
        <ul>
          <li>A partilha salarial é guardada separada dos seus dados de contacto.</li>
          <li>Um valor só aparece com pelo menos 5 respostas, e o nome de uma empresa só com 5 partilhas dessa empresa.</li>
          <li>O acesso aos dados é restrito por regras de segurança na base de dados.</li>
        </ul>
      </section>

      <section>
        <h2>Os seus direitos</h2>
        <p>Pode pedir para ver, corrigir ou apagar os seus dados e a sua conta a qualquer momento, através da página de <a href="/contacto">contacto</a>.</p>
      </section>

      <section>
        <h2>Responsável</h2>
        <p>[Nome da entidade responsável], [endereço], [email de contacto].</p>
      </section>
    </PaginaTexto>
  );
}
