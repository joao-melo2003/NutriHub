"use client";

import { useEffect, useState, type FormEvent } from "react";
import { buscaRestricao, getIndexRestricoes } from "@/services/usuarioService";
import { INPUT_CLASSE, Paginacao, TIPOS_RESTRICAO, textoErro } from "./formUtils";

type Restricao = Awaited<ReturnType<typeof getIndexRestricoes>>["content"][number];
type Pagina = Awaited<ReturnType<typeof getIndexRestricoes>>;

export default function Formulario4({
  selecionadas,
  onChange,
  bloqueado,
}: {
  selecionadas: string[];
  onChange: (ids: string[]) => void;
  bloqueado: boolean;
}) {
  const [pagina, setPagina] = useState(0);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroAplicado, setFiltroAplicado] = useState("");
  const [resultado, setResultado] = useState<Pagina | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = filtroAplicado
          ? await buscaRestricao({ nome: filtroAplicado, pagina })
          : await getIndexRestricoes(pagina);
        if (ativo) setResultado(resposta);
      } catch (error) {
        if (ativo) {
          setResultado(null);
          setErro(textoErro(error, "Erro ao carregar restrições."));
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [pagina, filtroAplicado]);

  function pesquisar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPagina(0);
    setFiltroAplicado(pesquisa.trim());
  }

  function alternar(restricao: Restricao) {
    const id = String(restricao.id);
    onChange(selecionadas.includes(id) ? selecionadas.filter((item) => item !== id) : [...selecionadas, id]);
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-neutral-950">Restrições alimentares</h3>
        <p className="mt-1 text-sm text-neutral-500">Selecione quantas restrições precisar. Caso não possua nenhuma, avance sem selecionar.</p>
      </div>
      <form onSubmit={pesquisar} className="flex gap-2">
        <input aria-label="Pesquisar restrição pelo nome" type="search" placeholder="Buscar restrição..." className={INPUT_CLASSE} value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
        <button type="submit" className="shrink-0 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-neutral-900 hover:bg-yellow-300">Buscar</button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-neutral-700">Selecionadas: {selecionadas.length}</span>
        {selecionadas.length > 0 && !bloqueado && <button type="button" onClick={() => onChange([])} className="text-xs font-semibold text-red-600 hover:underline">Limpar seleção</button>}
      </div>
      {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
      {carregando && <p role="status" className="py-5 text-center text-sm text-neutral-500">Carregando restrições...</p>}
      {!carregando && resultado && (
        <>
          {resultado.content.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {resultado.content.map((restricao) => {
                const marcado = selecionadas.includes(String(restricao.id));
                return (
                  <button key={restricao.id} type="button" disabled={bloqueado} aria-pressed={marcado} onClick={() => alternar(restricao)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${marcado ? "border-yellow-400 bg-yellow-50" : "border-neutral-200 bg-white hover:border-yellow-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-900">{restricao.nome}</p>
                        <p className="mt-1 text-xs text-neutral-500">{TIPOS_RESTRICAO[String(restricao.tipo)] || restricao.tipo}</p>
                      </div>
                      <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${marcado ? "border-yellow-500 bg-yellow-400 text-neutral-900" : "border-neutral-300"}`}>{marcado ? "✓" : ""}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : <p className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">Nenhuma restrição encontrada.</p>}
          <Paginacao pagina={resultado.number} totalPaginas={resultado.totalPages} carregando={carregando} onMudar={setPagina}/>
        </>
      )}
    </div>
  );
}
