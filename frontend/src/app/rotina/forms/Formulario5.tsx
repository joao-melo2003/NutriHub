"use client";

import { useEffect, useRef, useState } from "react";
import { buscaAlimentoNome, getIndexAlimentos } from "@/services/usuarioService";
import { CATEGORIAS_ALIMENTO, INPUT_CLASSE, Paginacao, textoErro } from "./formUtils";

type Alimento = Awaited<ReturnType<typeof getIndexAlimentos>>["content"][number];
type PaginaAlimento = Awaited<ReturnType<typeof getIndexAlimentos>>;

const ITENS_POR_PAGINA_BUSCA = 10;

export default function Formulario5({
  selecionados,
  onChange,
  bloqueado,
  onBusyChange,
}: {
  selecionados: string[];
  onChange: (ids: string[]) => void;
  bloqueado: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const [textoBusca, setTextoBusca] = useState("");
  const [paginaIndex, setPaginaIndex] = useState(0);
  const [paginaBusca, setPaginaBusca] = useState(0);
  const [resultadoIndex, setResultadoIndex] = useState<PaginaAlimento | null>(null);
  const [resultadoBusca, setResultadoBusca] = useState<Alimento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [selecionandoTodos, setSelecionandoTodos] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [todosMarcados, setTodosMarcados] = useState(false);
  const selecionandoTodosRef = useRef(false);

  const buscaAtiva = textoBusca.trim().length > 0;

  useEffect(() => {
    if (buscaAtiva) return;
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await getIndexAlimentos(paginaIndex);
        if (ativo) setResultadoIndex(resposta);
      } catch (error) {
        if (ativo) { setResultadoIndex(null); setErro(textoErro(error, "Erro ao carregar alimentos.")); }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [paginaIndex, buscaAtiva]);

  useEffect(() => {
    if (!buscaAtiva) return;
    let ativo = true;
    setCarregando(true);
    setErro("");
    const timer = window.setTimeout(() => {
      void buscaAlimentoNome(textoBusca.trim())
        .then((dados) => { if (ativo) setResultadoBusca(dados); })
        .catch((error: unknown) => { if (ativo) { setResultadoBusca([]); setErro(textoErro(error, "Erro ao buscar alimentos.")); } })
        .finally(() => { if (ativo) setCarregando(false); });
    }, 300);
    return () => { ativo = false; window.clearTimeout(timer); };
  }, [textoBusca, buscaAtiva]);

  function pesquisar(texto: string) {
    setTextoBusca(texto);
    setPaginaBusca(0);
  }

  function alternar(alimento: Alimento) {
    const id = String(alimento.id);
    onChange(selecionados.includes(id) ? selecionados.filter((item) => item !== id) : [...selecionados, id]);
    setTodosMarcados(false);
  }

  async function marcarTodos() {
    if (selecionandoTodosRef.current || bloqueado) return;
    if (todosMarcados) {
      onChange([]);
      setTodosMarcados(false);
      return;
    }

    selecionandoTodosRef.current = true;
    setSelecionandoTodos(true);
    onBusyChange(true);
    setErro("");
    try {
      setProgresso("Consultando catálogo completo...");
      const primeira = await getIndexAlimentos(0);
      const todos = new Set<string>(primeira.content.map((alimento) => String(alimento.id)));
      const total = primeira.totalPages;
      // Lotes pequenos evitam uma explosão de requisições simultâneas.
      for (let inicio = 1; inicio < total; inicio += 5) {
        const fim = Math.min(inicio + 5, total);
        setProgresso(`Consultando páginas ${inicio + 1} a ${fim} de ${total}...`);
        const paginas = await Promise.all(Array.from({ length: fim - inicio }, (_, i) => getIndexAlimentos(inicio + i)));
        for (const pagina of paginas) for (const alimento of pagina.content) todos.add(String(alimento.id));
      }
      onChange([...todos]);
      setTodosMarcados(true);
    } catch (error) {
      setErro(textoErro(error, "Não foi possível selecionar todos os alimentos."));
    } finally {
      selecionandoTodosRef.current = false;
      setSelecionandoTodos(false);
      onBusyChange(false);
      setProgresso("");
    }
  }

  const totalPaginas = buscaAtiva
    ? Math.ceil(resultadoBusca.length / ITENS_POR_PAGINA_BUSCA)
    : (resultadoIndex?.totalPages ?? 0);
  const paginaAtual = buscaAtiva ? paginaBusca : paginaIndex;
  const alimentosVisiveis: Alimento[] = buscaAtiva
    ? resultadoBusca.slice(paginaBusca * ITENS_POR_PAGINA_BUSCA, (paginaBusca + 1) * ITENS_POR_PAGINA_BUSCA)
    : (resultadoIndex?.content ?? []);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-neutral-950">Seus alimentos preferidos</h3>
        <p className="mt-1 text-sm text-neutral-500">Selecione pelo menos 5 alimentos. Você pode navegar pelas páginas sem perder sua seleção.</p>
      </div>
      <input type="search" aria-label="Buscar alimento" className={INPUT_CLASSE} placeholder="Digite o nome do alimento para filtrar..." value={textoBusca} onChange={(e) => pesquisar(e.target.value)}/>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-yellow-50 p-3">
        <span className="text-sm font-semibold text-neutral-900">Selecionados: {selecionados.length} / mínimo 5</span>
        <button type="button" disabled={selecionandoTodos || bloqueado} onClick={() => void marcarTodos()}
          className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-yellow-300 disabled:opacity-50">
          {selecionandoTodos ? "Selecionando..." : todosMarcados ? "Desmarcar todos" : "Marcar todos os alimentos"}
        </button>
      </div>
      {progresso && <p role="status" className="text-xs text-neutral-600">{progresso}</p>}
      <p className="text-xs text-neutral-500">Marcar todos busca todas as páginas do catálogo, inclusive fora dos resultados da pesquisa.</p>
      {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
      {carregando && <p role="status" className="py-5 text-center text-sm text-neutral-500">Carregando alimentos...</p>}
      {!carregando && (
        <>
          {alimentosVisiveis.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {alimentosVisiveis.map((alimento) => {
                const marcado = selecionados.includes(String(alimento.id));
                return (
                  <button key={alimento.id} type="button" disabled={bloqueado || selecionandoTodos} aria-pressed={marcado} onClick={() => alternar(alimento)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all disabled:opacity-60 ${marcado ? "border-yellow-400 bg-yellow-50" : "border-neutral-200 bg-white hover:border-yellow-200"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-neutral-900">{alimento.nome}</p>
                        <p className="mt-1 text-xs text-neutral-500">{CATEGORIAS_ALIMENTO[String(alimento.categoria)] || alimento.categoria}</p>
                      </div>
                      <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${marcado ? "border-yellow-500 bg-yellow-400" : "border-neutral-300"}`}>{marcado ? "✓" : ""}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">Nenhum alimento encontrado.</p>}
          <Paginacao pagina={paginaAtual} totalPaginas={totalPaginas} carregando={carregando || selecionandoTodos}
            onMudar={(proxima) => buscaAtiva ? setPaginaBusca(proxima) : setPaginaIndex(proxima)}/>
        </>
      )}
    </div>
  );
}
