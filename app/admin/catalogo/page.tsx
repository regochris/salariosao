import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { dataCurta } from "@/lib/admin";
import { alternarActivo, guardarCargo, guardarItem, resolverSugestao } from "../accoes";
import { Aviso, Bloco, Cabecalho, Selo, btnPerigo, btnPrimario, btnQuieto, campo, rotulo } from "../ui";

export const metadata: Metadata = { title: "Catálogo" };

const ABAS = [
  { t: "sugestoes", nome: "Sugestões" },
  { t: "cargos", nome: "Cargos" },
  { t: "areas", nome: "Áreas" },
  { t: "ramos", nome: "Ramos de actividade" },
  { t: "niveis", nome: "Responsabilidade" },
] as const;
type Aba = (typeof ABAS)[number]["t"];
const nomeTipo = { cargo: "Cargo", area: "Área", ramo: "Ramo", nivel: "Responsabilidade" } as const;

type SP = { t?: string; q?: string; area?: string; ok?: string; erro?: string; inactivos?: string };

export default async function Catalogo({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const aba: Aba = (ABAS.some((a) => a.t === sp.t) ? sp.t : "sugestoes") as Aba;
  const supabase = await supabaseServer();
  const voltar = `/admin/catalogo?${new URLSearchParams({ t: aba, ...(sp.q ? { q: sp.q } : {}), ...(sp.area ? { area: sp.area } : {}) })}`;

  const [{ data: areas }, { data: ramos }, { data: niveis }, { count: nSug }] = await Promise.all([
    supabase.from("areas").select("id, nome, activo").order("nome"),
    supabase.from("ramos").select("id, nome, activo").order("nome"),
    supabase.from("niveis").select("id, nome, descricao, ordem, activo").order("ordem"),
    supabase.from("sugestoes").select("id", { count: "exact", head: true }).eq("estado", "pendente"),
  ]);

  return (
    <>
      <Cabecalho titulo="Catálogo" sub="As listas que aparecem no formulário de partilha." />
      <Aviso ok={sp.ok} erro={sp.erro} />
      <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {ABAS.map((a) => (
          <Link key={a.t} href={`/admin/catalogo?t=${a.t}`} role="tab" aria-selected={a.t === aba} className={`plain ${a.t === aba ? btnPrimario : btnQuieto}`}>
            {a.nome}{a.t === "sugestoes" && (nSug ?? 0) > 0 && <span className="num ml-1.5 rounded-full bg-warning px-1.5 text-xs text-white">{nSug}</span>}
          </Link>
        ))}
      </div>

      {aba === "sugestoes" && <Sugestoes voltar={voltar} areas={areas ?? []} ramos={ramos ?? []} niveis={niveis ?? []} />}
      {aba === "cargos" && <Cargos voltar={voltar} areas={areas ?? []} q={sp.q} area={sp.area} />}
      {aba === "areas" && <ListaSimples tabela="areas" voltar={voltar} itens={areas ?? []} />}
      {aba === "ramos" && <ListaSimples tabela="ramos" voltar={voltar} itens={ramos ?? []} />}
      {aba === "niveis" && <Niveis voltar={voltar} itens={niveis ?? []} />}
    </>
  );
}

type Item = { id: number; nome: string; activo: boolean };

function Escondidos({ voltar, ...v }: { voltar: string } & Record<string, string | number>) {
  return (
    <>
      <input type="hidden" name="voltar" value={voltar} />
      {Object.entries(v).map(([k, x]) => <input key={k} type="hidden" name={k} value={x} />)}
    </>
  );
}

function BotaoActivo({ tabela, item, voltar }: { tabela: string; item: Item; voltar: string }) {
  return (
    <form action={alternarActivo}>
      <Escondidos voltar={voltar} tabela={tabela} id={item.id} activo={String(!item.activo)} />
      <button className={item.activo ? btnQuieto : btnPrimario}>{item.activo ? "Desactivar" : "Activar"}</button>
    </form>
  );
}

// ---------- Sugestões ----------
async function Sugestoes({ voltar, areas, ramos, niveis }: { voltar: string; areas: Item[]; ramos: Item[]; niveis: Item[] }) {
  const supabase = await supabaseServer();
  const [{ data: sug }, { data: cargos }] = await Promise.all([
    supabase.from("sugestoes").select("id, tipo, texto, criado_em, partilha_id").eq("estado", "pendente").order("criado_em").limit(100),
    supabase.from("cargos").select("id, nome").eq("activo", true).order("nome"),
  ]);
  const alvos: Record<string, { id: number; nome: string }[]> = { cargo: cargos ?? [], area: areas, ramo: ramos, nivel: niveis };

  // Agrupa sugestões iguais (o mesmo texto escrito por várias pessoas).
  const grupos = new Map<string, { id: number; tipo: keyof typeof nomeTipo; texto: string; vezes: number; primeira: string }>();
  for (const s of sug ?? []) {
    const k = `${s.tipo}|${s.texto.trim().toLowerCase()}`;
    const g = grupos.get(k);
    if (g) g.vezes++;
    else grupos.set(k, { id: s.id, tipo: s.tipo as keyof typeof nomeTipo, texto: s.texto, vezes: 1, primeira: s.criado_em });
  }

  if (grupos.size === 0) {
    return (
      <div className="rounded-tile bg-surface p-8 text-center">
        <p className="m-0 font-semibold">Sem sugestões pendentes.</p>
        <p className="m-0 mt-1 text-sm text-muted">Quando alguém escolher «Outro» ou escrever um cargo novo, aparece aqui.</p>
      </div>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {[...grupos.values()].map((g) => (
        <li key={g.id} className="rounded-tile bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Selo texto={nomeTipo[g.tipo]} cor="bg-primary-soft text-primary" />
            <strong className="text-[17px] font-semibold">{g.texto}</strong>
            <span className="text-sm text-muted">· {g.vezes > 1 ? `${g.vezes} pessoas` : "1 pessoa"} · desde {dataCurta(g.primeira)}</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <form action={resolverSugestao} className="flex flex-wrap items-end gap-2 rounded-[14px] bg-bg p-3">
              <Escondidos voltar={voltar} id={g.id} accao="aprovar" />
              <label className="flex min-w-[160px] flex-1 flex-col gap-1">
                <span className={rotulo}>Adicionar como novo</span>
                <input name="nome" defaultValue={g.texto} className={campo} />
              </label>
              {g.tipo === "cargo" && (
                <label className="flex min-w-[160px] flex-1 flex-col gap-1">
                  <span className={rotulo}>Área</span>
                  <select name="area_id" defaultValue="" className={campo}>
                    <option value="">Sem área</option>
                    {areas.filter((a) => a.activo).map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </label>
              )}
              <button className={btnPrimario}>Aprovar</button>
            </form>
            <form action={resolverSugestao} className="flex flex-wrap items-end gap-2 rounded-[14px] bg-bg p-3">
              <Escondidos voltar={voltar} id={g.id} accao="juntar" />
              <label className="flex min-w-[160px] flex-1 flex-col gap-1">
                <span className={rotulo}>Ou juntar a um existente</span>
                <select name="alvo_id" required defaultValue="" className={campo}>
                  <option value="" disabled>Escolher…</option>
                  {alvos[g.tipo].map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </label>
              <button className={btnQuieto}>Juntar</button>
            </form>
            <form action={resolverSugestao} className="flex items-end">
              <Escondidos voltar={voltar} id={g.id} accao="rejeitar" />
              <button className={btnPerigo}>Rejeitar</button>
            </form>
          </div>
          <p className="m-0 mt-2 text-xs text-muted">
            {g.tipo === "cargo" ? "Ao juntar, o texto escrito fica como sinónimo do cargo e é reconhecido nas próximas partilhas. " : ""}
            As partilhas com este texto passam a usar o item escolhido.
          </p>
        </li>
      ))}
    </ul>
  );
}

// ---------- Cargos ----------
async function Cargos({ voltar, areas, q, area }: { voltar: string; areas: Item[]; q?: string; area?: string }) {
  const supabase = await supabaseServer();
  let c = supabase.from("cargos").select("id, nome, slug, sinonimos, area_id, activo").order("nome").limit(300);
  if (q) c = c.ilike("nome", `%${q}%`);
  if (area) c = c.eq("area_id", Number(area));
  const { data: cargos } = await c;
  const nomeArea = new Map(areas.map((a) => [a.id, a.nome]));
  const opcoesArea = (
    <>
      <option value="">Sem área</option>
      {areas.map((a) => <option key={a.id} value={a.id}>{a.nome}{a.activo ? "" : " (inactiva)"}</option>)}
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <Bloco titulo="Adicionar cargo">
        <form action={guardarCargo} className="grid gap-3 md:grid-cols-[2fr_1.5fr_2fr_auto] md:items-end">
          <Escondidos voltar={voltar} />
          <label className="flex flex-col gap-1"><span className={rotulo}>Nome</span><input name="nome" required placeholder="Ex.: Operador(a) de grua" className={campo} /></label>
          <label className="flex flex-col gap-1"><span className={rotulo}>Área</span><select name="area_id" defaultValue="" className={campo}>{opcoesArea}</select></label>
          <label className="flex flex-col gap-1"><span className={rotulo}>Sinónimos (separados por vírgula)</span><input name="sinonimos" placeholder="Ex.: gruista, operador de grua" className={campo} /></label>
          <button className={btnPrimario}>Adicionar</button>
        </form>
      </Bloco>

      <form action="/admin/catalogo" className="flex flex-wrap gap-2">
        <input type="hidden" name="t" value="cargos" />
        <input name="q" defaultValue={q} placeholder="Procurar cargo" aria-label="Procurar cargo" className={`${campo} w-56`} />
        <select name="area" defaultValue={area ?? ""} aria-label="Área" className={`${campo} w-56`}>
          <option value="">Todas as áreas</option>
          {areas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
        <button className={btnQuieto}>Filtrar</button>
        <span className="self-center text-sm text-muted">{cargos?.length ?? 0} cargo(s)</span>
      </form>

      <ul className="m-0 list-none rounded-tile bg-surface p-0">
        {(cargos ?? []).map((c) => (
          <li key={c.id} className={`border-b border-line px-4 py-3 last:border-b-0 ${c.activo ? "" : "opacity-60"}`}>
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
                <span>
                  <strong className="font-semibold">{c.nome}</strong>
                  <span className="ml-2 text-sm text-muted">{c.area_id ? nomeArea.get(c.area_id) : "Sem área"}</span>
                  {c.sinonimos?.length > 0 && <span className="ml-2 text-xs text-muted">· também: {c.sinonimos.join(", ")}</span>}
                  {!c.activo && <span className="ml-2"><Selo texto="Inactivo" cor="bg-surface-2 text-muted" /></span>}
                </span>
                <span className="text-sm text-primary">Editar ›</span>
              </summary>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <form action={guardarCargo} className="grid flex-1 gap-2 md:grid-cols-[2fr_1.5fr_2fr_auto] md:items-end">
                  <Escondidos voltar={voltar} id={c.id} />
                  <label className="flex flex-col gap-1"><span className={rotulo}>Nome</span><input name="nome" defaultValue={c.nome} required className={campo} /></label>
                  <label className="flex flex-col gap-1"><span className={rotulo}>Área</span><select name="area_id" defaultValue={c.area_id ?? ""} className={campo}>{opcoesArea}</select></label>
                  <label className="flex flex-col gap-1"><span className={rotulo}>Sinónimos</span><input name="sinonimos" defaultValue={(c.sinonimos ?? []).join(", ")} className={campo} /></label>
                  <button className={btnPrimario}>Guardar</button>
                </form>
                <BotaoActivo tabela="cargos" item={c} voltar={voltar} />
              </div>
              <p className="m-0 mt-2 text-xs text-muted">Endereço da página: /salarios/{c.slug}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Áreas e ramos ----------
function ListaSimples({ tabela, voltar, itens }: { tabela: "areas" | "ramos"; voltar: string; itens: Item[] }) {
  const singular = tabela === "areas" ? "área" : "ramo";
  return (
    <div className="flex flex-col gap-4">
      <Bloco titulo={`Adicionar ${singular}`}>
        <form action={guardarItem} className="flex flex-wrap items-end gap-2">
          <Escondidos voltar={voltar} tabela={tabela} />
          <label className="flex min-w-[240px] flex-1 flex-col gap-1"><span className={rotulo}>Nome</span><input name="nome" required className={campo} /></label>
          <button className={btnPrimario}>Adicionar</button>
        </form>
      </Bloco>
      <ul className="m-0 list-none rounded-tile bg-surface p-0">
        {itens.map((i) => (
          <li key={i.id} className={`flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5 last:border-b-0 ${i.activo ? "" : "opacity-60"}`}>
            <form action={guardarItem} className="flex min-w-[240px] flex-1 gap-2">
              <Escondidos voltar={voltar} tabela={tabela} id={i.id} />
              <input name="nome" defaultValue={i.nome} aria-label="Nome" required className={campo} />
              <button className={btnQuieto}>Guardar</button>
            </form>
            <BotaoActivo tabela={tabela} item={i} voltar={voltar} />
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-muted">Desactivar esconde o item do formulário sem apagar as partilhas que já o usam.</p>
    </div>
  );
}

// ---------- Responsabilidade ----------
function Niveis({ voltar, itens }: { voltar: string; itens: (Item & { descricao: string | null; ordem: number })[] }) {
  const linha = (i?: Item & { descricao: string | null; ordem: number }) => (
    <form action={guardarItem} className="grid flex-1 gap-2 md:grid-cols-[2fr_3fr_80px_auto] md:items-end">
      <Escondidos voltar={voltar} tabela="niveis" {...(i ? { id: i.id } : {})} />
      <label className="flex flex-col gap-1"><span className={rotulo}>Nome</span><input name="nome" defaultValue={i?.nome} required className={campo} /></label>
      <label className="flex flex-col gap-1"><span className={rotulo}>Explicação (aparece no formulário)</span><input name="descricao" defaultValue={i?.descricao ?? ""} className={campo} /></label>
      <label className="flex flex-col gap-1"><span className={rotulo}>Ordem</span><input name="ordem" type="number" defaultValue={i?.ordem ?? itens.length + 1} className={campo} /></label>
      <button className={i ? btnQuieto : btnPrimario}>{i ? "Guardar" : "Adicionar"}</button>
    </form>
  );
  return (
    <div className="flex flex-col gap-4">
      <Bloco titulo="Adicionar nível">{linha()}</Bloco>
      <ul className="m-0 list-none rounded-tile bg-surface p-0">
        {itens.map((i) => (
          <li key={i.id} className={`flex flex-wrap items-end gap-2 border-b border-line px-4 py-3 last:border-b-0 ${i.activo ? "" : "opacity-60"}`}>
            {linha(i)}
            <BotaoActivo tabela="niveis" item={i} voltar={voltar} />
          </li>
        ))}
      </ul>
    </div>
  );
}
