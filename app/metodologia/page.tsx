import Link from "next/link";
import type { Metadata } from "next";
import { PaginaTexto } from "@/components/Texto";
import { pillPrimary } from "@/lib/ui";

export const metadata: Metadata = { title: "Metodologia" };

const fontes = [
  { nome: "Partilhas anónimas", texto: "Trabalhadores do sector público e privado indicam o seu salário, subsídios e benefícios. É a fonte principal." },
  { nome: "Tabelas oficiais", texto: "Tabelas salariais da função pública, por carreira, categoria e escalão, tal como publicadas." },
  { nome: "Dados de empresas", texto: "Informação fornecida por empresas parceiras, sempre de forma agregada." },
  { nome: "Pesquisa própria", texto: "Anúncios de emprego, inquéritos e estudos publicados, para completar áreas com poucas partilhas." },
];

export default function Metodologia() {
  return (
    <PaginaTexto
      etiqueta="Metodologia"
      titulo="De onde vêm os números."
      intro="Cada valor da Wiva mostra a fonte e quantas respostas tem por trás. Assim sabe até que ponto pode confiar nele."
    >
      <section>
        <h2>Quatro fontes</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fontes.map((f) => (
            <div key={f.nome} className="rounded-tile bg-surface p-5">
              <strong className="mb-1 block font-semibold">{f.nome}</strong>
              <span className="text-[15px] text-muted">{f.texto}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Como calculamos</h2>
        <ul>
          <li><strong>Mediana:</strong> o valor do meio. Metade das pessoas ganha mais, metade ganha menos. É mais justa do que a média, que sobe com poucos salários muito altos.</li>
          <li><strong>Intervalo:</strong> mostramos onde está a metade do meio (do 25.º ao 75.º percentil), além do mínimo e do máximo.</li>
          <li><strong>Salário base bruto:</strong> comparamos sempre o salário base mensal antes de impostos. Os subsídios aparecem à parte.</li>
          <li><strong>Líquido:</strong> não o perguntamos. Calculamo-lo com a Segurança Social e o IRT em vigor, para todos os valores serem comparáveis.</li>
          <li><strong>Moeda:</strong> salários em USD ou indexados ao USD são convertidos para Kz com a taxa de referência do mês da partilha.</li>
        </ul>
      </section>

      <section>
        <h2>Regras de qualidade</h2>
        <ul>
          <li>Um valor só aparece com pelo menos <strong>5 respostas</strong>. Abaixo disso, mostramos a etiqueta "Poucos dados".</li>
          <li>Partilhas muito fora do normal ficam em revisão antes de entrarem nas contas.</li>
          <li>O nome de uma empresa só aparece com pelo menos 5 partilhas dessa empresa.</li>
        </ul>
      </section>

      <section>
        <h2>Anonimato</h2>
        <p>Nunca mostramos respostas individuais, só agregados. A sua partilha não fica visível ligada ao seu nome, email ou telefone. Leia a <Link href="/privacidade">política de privacidade</Link>.</p>
      </section>

      <Link href="/partilhar" className={`${pillPrimary} self-start`}>Partilhar o meu salário</Link>
    </PaginaTexto>
  );
}
