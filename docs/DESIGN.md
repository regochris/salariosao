# SaláriosAO — Design System

Direção: **minimalismo de produto premium** (inspirado na linguagem visual da Apple, adaptado à marca SaláriosAO, sem copiar marca, imagens ou textos). Muito espaço em branco, títulos grandes e centrados, blocos de largura total que alternam fundo claro, cinzento e preto, botões em pílula. Os números são o "produto" em destaque.

Princípios:
1. **Números primeiro.** O salário é sempre o maior elemento do ecrã.
2. **Confiança visível.** Cada valor mostra a fonte e o número de respostas.
3. **Leve.** Pensado para telemóvel e internet lenta: uma fonte, sem imagens pesadas, ícones em SVG.
4. **Angolano sem cliché.** Azul (confiança) e terracota (a terra angolana) em vez das cores da bandeira.

---

## 1. Cor

Todas as combinações de texto foram verificadas: mínimo 4,5:1.

| Token | Claro | Escuro | Função |
| --- | --- | --- | --- |
| `--bg` | `#FFFFFF` | `#000000` | Fundo da página e blocos claros |
| `--surface` | `#F5F5F7` | `#1D1D1F` | Blocos cinzentos, cartões (sem borda), barra de navegação |
| `--surface-2` | `#E8E8ED` | `#2C2C2E` | Fundo das barras de gráfico |
| `--border` | `#D2D2D7` | `#424245` | Divisórias finas de listas e tabelas |
| `--text` | `#1D1D1F` | `#F5F5F7` | Texto principal e números (15,5:1) |
| `--text-muted` | `#6E6E73` | `#A1A1A6` | Texto secundário, legendas (4,7:1 sobre cinzento, 8,2:1 sobre preto) |
| `--primary` | `#0066CC` | `#2997FF` | Botões, links, foco, **sector privado** nos gráficos (5,6:1 / 7,0:1) |
| `--primary-hover` | `#004E9E` | `#5AAEFF` | Hover dos botões e links |
| `--on-primary` | `#FFFFFF` | `#000000` | Texto sobre o botão principal |
| `--primary-soft` | `#EDF4FD` | `#0A2A4A` | Fundo de etiquetas e seleção |
| `--accent` | `#B4531F` | `#E8875A` | **Sector público** nos gráficos, destaque pontual (5,0:1 / 6,5:1) |
| `--accent-soft` | `#F7E8DF` | `#3A2418` | Fundo de etiquetas "Público" |
| `--success` | `#1E7A3A` | `#4CC27A` | Acima da mediana, confirmação |
| `--warning` | `#A16207` | `#E0A93B` | Poucos dados (menos de 5 respostas), em revisão |
| `--error` | `#B42318` | `#F0776B` | Erros de formulário |
| `--button` | `#0066CC` | `#0071E3` | Fundo dos botões principais (texto sempre branco: 5,6:1 / 4,7:1) |
| `--button-hover` | `#004E9E` | `#005BB5` | Hover dos botões principais |
| `--input-border` | `#86868B` | `#7C7C80` | Borda das caixas de texto e da pesquisa (≥ 3:1) |

Regras:
- **Privado = azul, público = terracota**, sempre. O utilizador aprende a leitura uma vez.
- O accent nunca é usado em botões: só no sector público e em pequenos destaques.
- Sem gradientes nem texto em gradiente. Única exceção de transparência: a barra de navegação translúcida.
- Blocos escuros (classe `.ink`) usam os valores da coluna Escuro, para alternar o ritmo claro / escuro.

## 2. Tipografia

**Fonte do sistema** (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`): SF Pro no iPhone e Mac, Roboto no Android, Segoe no Windows. Zero bytes a descarregar, ideal para internet lenta. Títulos a 700 com espaçamento negativo; corpo a 17 px com −0,2 px.

Todos os números salariais usam `font-variant-numeric: tabular-nums`, para os valores ficarem alinhados nas tabelas.

| Token | Tamanho / altura de linha | Peso | Uso |
| --- | --- | --- | --- |
| `--fs-hero` | 64 / 68 (telemóvel 40 / 44) | 700 | Título principal da página inicial, centrado |
| `--fs-display` | 48 / 52 (telemóvel 40 / 44) | 600–700 | Salário em destaque, títulos de bloco |
| `--fs-h3` | 40 / 44 (telemóvel 28 / 32) | 700 | Títulos de tile |
| `--fs-lead` | 24 / 32 (telemóvel 19 / 26) | 400 | Subtítulo em cinzento |
| `--fs-body` | 17 / 25 | 400 | Texto corrido |
| `--fs-small` | 14 / 20 | 400–500 | Legendas, filtros, tabelas |
| `--fs-micro` | 12 / 16 | 500 | Fonte do dado, nº de respostas, etiquetas |

Linhas de texto com 60 a 75 caracteres (`max-width: 68ch`).

## 3. Espaçamento e layout

- Escala de 4 px: `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- Espaço entre secções: 48 no telemóvel, 96 no computador.
- Largura do conteúdo: 1120 px; texto longo: 68ch.
- Margem lateral: 16 no telemóvel, 24 no tablet, 32 no computador.
- Layout **mobile-first**: uma coluna até 768 px; grelha de 12 colunas acima disso.
- Alinhamento à esquerda por defeito. Centrado só no topo da página inicial.

## 4. Forma e profundidade

- Raios: `--r-sm: 6px` (etiquetas, inputs), `--r-lg: 18px` (tiles e cartões), `--r-pill: 980px` (botões e pesquisa).
- Sem sombras nos cartões: separam-se pela cor de fundo (branco / `#F5F5F7` / preto). Tiles com 12 px de intervalo entre si.

## 5. Componentes

**Botões** (altura 44 px, para o dedo no telemóvel)
- *Primário*: pílula, fundo `--primary`, texto `--on-primary`, 15 px / 500.
- *Secundário*: pílula com contorno `--primary`, texto `--primary` ("Saiba mais").
- *Ligação de ação*: texto `--primary` com " ›" no fim ("Partilhar o meu salário ›").
- Estados: hover `--button-hover` (primário), fundo `--primary-soft` (contorno), fundo `--surface` (discreto); ao clicar, encolhe 2%; foco com anel de 2 px `--primary` e 2 px de espaço; desativado com 40% de opacidade e sem cursor.

**Inputs**: altura 44 px, borda `--input-border` (escurece no hover, azul com anel no foco), raio `--r-sm`, etiqueta sempre visível por cima (nunca só placeholder). Erro: borda e texto `--error`, com a mensagem por baixo. O campo de valor tem seletor Kz/USD colado à direita.

**Cartão salarial** (o componente central)
- Cargo (h3) e etiqueta Público/Privado.
- Mediana em `--fs-display`, com o intervalo (P25–P75) por baixo em `--text-muted`.
- Barra de intervalo horizontal: mínimo a máximo, a zona P25–P75 preenchida e um ponto na mediana.
- Rodapé em `--fs-micro`: "Baseado em 128 respostas · Fonte: partilhas + tabela oficial 2026".
- Com menos de 5 respostas: etiqueta `--warning` "Poucos dados".

**Bloco bloqueado**: dados desfocados com o cartão "Partilhe o seu salário para desbloquear" e um botão primário. Para estudantes, o texto muda para "Disponível para quem partilha".

**Etiquetas**: Público (`--accent-soft` / `--accent`), Privado (`--primary-soft` / `--primary`), Poucos dados (`--warning`).

**Formulário em passos**: barra de progresso no topo ("Passo 2 de 6"), um bloco de campos por ecrã, botão "Continuar" fixo em baixo no telemóvel e mensagem de anonimato visível em todos os passos.

**Hover**: texto clicável sublinha; cartões e blocos clicáveis sobem 2 px; linhas de lista ficam azuis.

**Navegação**: menu a 15 px; barra superior com logótipo, Pesquisar, Função Pública, Calculadora e Entrar. No telemóvel, menu com 4 ícones em baixo: Início, Pesquisar, Partilhar, Conta.

**Rodapé**: Metodologia, Privacidade, Contacto, redes sociais, "Dados agregados e anónimos".

**Gráficos**: barras horizontais (mais legíveis no telemóvel) com valores escritos na barra, sem legenda separada quando bastam 2 cores. Os eixos usam `--border` e o texto `--text-muted`.

## 6. Imagem e ícones

- Ícones: **Lucide**, traço de 1,75 px, 20 px, só SVG inline.
- Sem fotografias de banco de imagens. A identidade visual vem dos números, dos gráficos e da tipografia.
- Ilustração opcional: padrão geométrico discreto inspirado em motivos angolanos (sona/lusona), só no topo da página inicial e em SVG leve.
- Logótipo: "Salários" na fonte do sistema, 600, + "AO" na cor `--primary`. Versão final a desenhar pelo Rx.

## 7. Tom dos textos

Direto, português de Angola, sem jargão. Termos a usar: "salário base", "subsídios", "13.º mês", "Kz". Exemplos: "Quanto ganha um enfermeiro em Benguela?", "Os seus dados são anónimos. Nunca mostramos respostas individuais."

---

## Tokens (CSS)

```css
:root {
  --bg:#FFFFFF; --surface:#F5F5F7; --surface-2:#E8E8ED; --border:#D2D2D7;
  --text:#1D1D1F; --text-muted:#6E6E73;
  --primary:#0066CC; --primary-hover:#004E9E; --on-primary:#FFFFFF; --primary-soft:#EDF4FD;
  --accent:#B4531F; --accent-soft:#F7E8DF;
  --success:#1E7A3A; --warning:#A16207; --error:#B42318;
  --font:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --fs-hero:4rem; --fs-display:3rem; --fs-h3:2.5rem; --fs-lead:1.5rem;
  --fs-body:1.0625rem; --fs-small:.875rem; --fs-micro:.75rem;
  --r-sm:6px; --r-lg:18px; --r-pill:980px;
}
/* modo escuro e blocos .ink */
@media (prefers-color-scheme: dark) { :root { /* mesmos valores do bloco .ink */ } }
.ink {
  --bg:#000000; --surface:#1D1D1F; --surface-2:#2C2C2E; --border:#424245;
  --text:#F5F5F7; --text-muted:#A1A1A6;
  --primary:#2997FF; --primary-hover:#5AAEFF; --on-primary:#000000; --primary-soft:#0A2A4A;
  --accent:#E8875A; --accent-soft:#3A2418;
  --success:#4CC27A; --warning:#E0A93B; --error:#F0776B;
}
```
