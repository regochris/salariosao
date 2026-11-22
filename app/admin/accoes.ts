"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase/server";

// Acções do painel. Cada uma volta à página de onde veio com ?ok= ou ?erro=.
// Mesmo que alguém chame estas acções sem ser admin, as regras RLS recusam.

const texto = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const numero = (f: FormData, k: string) => (f.get(k) ? Number(f.get(k)) : null);

function voltar(f: FormData, chave: "ok" | "erro", msg: string): never {
  const destino = texto(f, "voltar") || "/admin";
  const url = new URL(destino, "http://x");
  url.searchParams.delete("ok");
  url.searchParams.delete("erro");
  url.searchParams.set(chave, msg);
  revalidatePath("/admin", "layout");
  redirect(url.pathname + url.search);
}

function slugify(s: string) {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/\((a|ã)\)/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ---------- Moderação ----------
export async function moderar(f: FormData) {
  await exigirAdmin();
  const estado = texto(f, "estado");
  if (!["aprovada", "rejeitada", "pendente"].includes(estado)) voltar(f, "erro", "Estado inválido.");
  const supabase = await supabaseServer();
  const alteracao: Record<string, unknown> = { estado, motivo_revisao: texto(f, "motivo") || null };
  const cargo = numero(f, "cargo_id");
  if (cargo) alteracao.cargo_id = cargo;
  const { error } = await supabase.from("partilhas").update(alteracao).eq("id", texto(f, "id"));
  if (error) voltar(f, "erro", "Não foi possível guardar: " + error.message);
  voltar(f, "ok", estado === "aprovada" ? "Partilha aprovada." : estado === "rejeitada" ? "Partilha rejeitada." : "Partilha voltou a pendente.");
}

// ---------- Sugestões ----------
export async function resolverSugestao(f: FormData) {
  await exigirAdmin();
  const accao = texto(f, "accao");
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("admin_resolver_sugestao", {
    p_id: Number(f.get("id")),
    p_accao: accao === "juntar" ? "aprovar" : accao,
    p_alvo_id: accao === "juntar" ? numero(f, "alvo_id") : null,
    p_nome: accao === "aprovar" ? texto(f, "nome") || null : null,
    p_area_id: numero(f, "area_id"),
  });
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", accao === "rejeitar" ? "Sugestão rejeitada." : accao === "juntar" ? "Sugestão juntada ao item existente." : "Sugestão aprovada e adicionada ao catálogo.");
}

// ---------- Catálogo ----------
export async function guardarCargo(f: FormData) {
  await exigirAdmin();
  const nome = texto(f, "nome");
  if (nome.length < 2) voltar(f, "erro", "Escreva o nome do cargo.");
  const sinonimos = texto(f, "sinonimos").split(",").map((s) => s.trim()).filter(Boolean);
  const dados = { nome, area_id: numero(f, "area_id"), sinonimos };
  const supabase = await supabaseServer();
  const id = numero(f, "id");
  const { error } = id
    ? await supabase.from("cargos").update(dados).eq("id", id)
    : await supabase.from("cargos").insert({ ...dados, slug: slugify(nome) });
  if (error) voltar(f, "erro", error.code === "23505" ? "Já existe um cargo com este nome." : error.message);
  voltar(f, "ok", id ? "Cargo actualizado." : "Cargo adicionado.");
}

const TABELAS = ["areas", "ramos", "niveis", "cargos"] as const;
type Tabela = (typeof TABELAS)[number];

export async function guardarItem(f: FormData) {
  await exigirAdmin();
  const tabela = texto(f, "tabela") as Tabela;
  if (!TABELAS.includes(tabela) || tabela === "cargos") voltar(f, "erro", "Lista inválida.");
  const nome = texto(f, "nome");
  if (nome.length < 2) voltar(f, "erro", "Escreva o nome.");
  const dados: Record<string, unknown> = { nome };
  if (tabela === "areas") dados.slug = slugify(nome);
  if (tabela === "niveis") {
    dados.descricao = texto(f, "descricao") || null;
    if (f.get("ordem")) dados.ordem = numero(f, "ordem");
  }
  const supabase = await supabaseServer();
  const id = numero(f, "id");
  const { error } = id ? await supabase.from(tabela).update(dados).eq("id", id) : await supabase.from(tabela).insert(dados);
  if (error) voltar(f, "erro", error.code === "23505" ? "Já existe um item com este nome." : error.message);
  voltar(f, "ok", id ? "Alteração guardada." : "Item adicionado.");
}

export async function alternarActivo(f: FormData) {
  await exigirAdmin();
  const tabela = texto(f, "tabela") as Tabela;
  if (!TABELAS.includes(tabela)) voltar(f, "erro", "Lista inválida.");
  const supabase = await supabaseServer();
  const activo = texto(f, "activo") === "true";
  const { error } = await supabase.from(tabela).update({ activo }).eq("id", Number(f.get("id")));
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", activo ? "Item activado." : "Item desactivado. Deixa de aparecer no formulário.");
}

// ---------- Decretos ----------
export async function guardarComponente(f: FormData) {
  await exigirAdmin();
  const valor = Number(String(f.get("valor")).replace(",", "."));
  if (!(valor > 0)) voltar(f, "erro", "Valor inválido.");
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("componentes")
    .update({ valor, condicao: texto(f, "condicao") || null, valido_ate: texto(f, "valido_ate") || null })
    .eq("id", Number(f.get("id")));
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", "Componente actualizado.");
}

export async function guardarTaxa(f: FormData) {
  await exigirAdmin();
  const mes = texto(f, "mes");
  const usd = Number(String(f.get("usd_kz")).replace(",", "."));
  if (!/^\d{4}-\d{2}$/.test(mes) || !(usd > 0)) voltar(f, "erro", "Indique o mês e a taxa.");
  const supabase = await supabaseServer();
  const { error } = await supabase.from("taxas_cambio").upsert({ mes: `${mes}-01`, usd_kz: usd }, { onConflict: "mes" });
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", "Taxa de câmbio guardada.");
}

// ---------- Utilizadores ----------
export async function definirPapel(f: FormData) {
  const eu = await exigirAdmin();
  const alvo = texto(f, "id");
  const papel = texto(f, "papel");
  if (alvo === eu.id && papel !== "admin") voltar(f, "erro", "Não pode tirar a si próprio o papel de administrador.");
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("admin_definir_papel", { p_utilizador: alvo, p_papel: papel });
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", papel === "admin" ? "Agora é administrador." : "Deixou de ser administrador.");
}

// ---------- Mensagens ----------
export async function marcarMensagem(f: FormData) {
  await exigirAdmin();
  const supabase = await supabaseServer();
  const lida = texto(f, "lida") === "true";
  const { error } = await supabase.from("mensagens").update({ lida }).eq("id", Number(f.get("id")));
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", lida ? "Marcada como lida." : "Marcada como não lida.");
}

export async function novoAjuste(f: FormData) {
  await exigirAdmin();
  const valores: Record<string, number> = {};
  for (const [k, v] of f.entries()) {
    if (k.startsWith("grupo_") && String(v).trim()) valores[k.slice(6)] = Number(String(v).replace(/\s/g, "").replace(",", "."));
  }
  if (Object.keys(valores).length === 0) voltar(f, "erro", "Indique pelo menos um novo valor do índice 100.");
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("admin_ajuste_geral", {
    p_numero: texto(f, "numero"),
    p_titulo: texto(f, "titulo"),
    p_data_efeitos: texto(f, "data_efeitos"),
    p_url: texto(f, "url"),
    p_valores: valores,
    p_notas: texto(f, "notas") || null,
  });
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", "Decreto registado. As tabelas passam a usar os novos valores a partir da data de efeitos.");
}

// ---------- Inflação e salário mínimo ----------
export async function guardarIpc(f: FormData) {
  await exigirAdmin();
  const mes = texto(f, "mes");
  const h = Number(texto(f, "var_homologa").replace(",", "."));
  const indiceEscrito = Number(texto(f, "indice").replace(",", "."));
  if (!/^\d{4}-\d{2}$/.test(mes) || !Number.isFinite(h)) voltar(f, "erro", "Indique o mês e a variação homóloga.");
  const supabase = await supabaseServer();
  let indice = indiceEscrito > 0 ? indiceEscrito : 0;
  if (!indice) {
    // Sem índice: calcula a partir do mesmo mês do ano anterior.
    const [a, m] = mes.split("-");
    const { data } = await supabase.from("ipc").select("indice").eq("mes", `${Number(a) - 1}-${m}-01`).maybeSingle();
    if (!data) voltar(f, "erro", "Falta o índice do mesmo mês do ano anterior. Escreva o índice publicado pelo INE.");
    indice = Math.round(Number(data!.indice) * (1 + h / 100) * 100) / 100;
  }
  const { error } = await supabase.from("ipc").upsert({ mes: `${mes}-01`, indice, var_homologa: h, calculado: !(indiceEscrito > 0) }, { onConflict: "mes" });
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", "Inflação do mês guardada.");
}

export async function guardarSalarioMinimo(f: FormData) {
  await exigirAdmin();
  const valor = Number(texto(f, "valor").replace(/\s/g, "").replace(",", "."));
  const desde = texto(f, "valido_desde");
  if (!(valor > 0) || !desde) voltar(f, "erro", "Indique o valor e a data de entrada em vigor.");
  const supabase = await supabaseServer();
  // Fecha o valor em vigor (fim exclusivo) e abre o novo.
  await supabase.from("salario_minimo").update({ valido_ate: desde }).is("valido_ate", null).lt("valido_desde", desde);
  const { error } = await supabase.from("salario_minimo").insert({ valor, valido_desde: desde, diploma: texto(f, "diploma") || null, nota: texto(f, "nota") || null });
  if (error) voltar(f, "erro", error.message);
  voltar(f, "ok", "Salário mínimo actualizado.");
}
