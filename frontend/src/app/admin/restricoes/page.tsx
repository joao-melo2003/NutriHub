"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  addRestricao,
  buscaRestricao,
  deletarRestricao,
  editarRestricao,
  getIndexRestricoes,
  getInfoRestricao,
} from "@/services/usuarioService";

// Reutiliza os tipos das funções do seu service.
type Restricao = Awaited<ReturnType<typeof getInfoRestricao>>;
type PaginaRestricoes = Awaited<ReturnType<typeof getIndexRestricoes>>;
type AdicionarPayload = Parameters<typeof addRestricao>[0];
type EditarPayload = Parameters<typeof editarRestricao>[1];
type ParametrosBusca = NonNullable<Parameters<typeof buscaRestricao>[0]>;

type Filtros = { nome: string; tipo: string };
type Formulario = { nome: string; tipo: string };
type ModalSelecionado = { modo: "adicionar" } | { modo: "editar"; id: string };
type Aviso = { tipo: "sucesso" | "erro"; mensagem: string };

const TIPOS_RESTRICAO = [
  { value: "ALERGIA", label: "Alergia" },
  { value: "INTOLERANCIA", label: "Intolerância" },
  { value: "CONDICAO", label: "Condição" },
  { value: "RESTRICAO", label: "Restrição" },
] as const;

const inputClasse =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

function nomeDoTipo(tipo: string): string {
  return TIPOS_RESTRICAO.find((item) => item.value === tipo)?.label ?? (tipo || "—").replace(/_/g, " ");
}

function mensagemErro(error: unknown, alternativa: string) {
  return error instanceof Error ? error.message : alternativa;
}

function FiltroDeTipo({
  value,
  onChange,
}: {
  value: string;
  onChange: (tipo: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fecharFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    function fecharEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", fecharEscape);
    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", fecharEscape);
    };
  }, []);

  return (
    <div className="relative w-full sm:w-60" ref={containerRef}>
      <label id="filtro-tipo-label" className="mb-2 block text-sm font-semibold text-neutral-700">
        Tipo de restrição
      </label>
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-labelledby="filtro-tipo-label"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className={`${inputClasse} flex items-center justify-between gap-2 text-left`}
      >
        <span className={value ? "text-neutral-900" : "text-neutral-400"}>
          {value ? nomeDoTipo(value) : "Todos os tipos"}
        </span>
        <ChevronDown size={18} className={`shrink-0 text-neutral-500 transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>

      {aberto && (
        <div
          role="listbox"
          aria-label="Selecionar tipo de restrição"
          className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
        >
          {TIPOS_RESTRICAO.map((tipo) => {
            const selecionado = value === tipo.value;
            return (
              <button
                key={tipo.value}
                type="button"
                role="option"
                aria-selected={selecionado}
                onClick={() => {
                  onChange(selecionado ? "" : tipo.value);
                  setAberto(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-yellow-50 ${selecionado ? "bg-yellow-100 font-semibold text-neutral-900" : "text-neutral-700"}`}
              >
                {tipo.label}
                {selecionado && <Check size={17} className="text-yellow-700" />}
              </button>
            );
          })}
          <p className="border-t border-neutral-100 px-3 pb-1 pt-2 text-[11px] text-neutral-400">
            Selecione novamente um tipo marcado para desmarcar.
          </p>
        </div>
      )}
    </div>
  );
}

function ModalRestricao({
  selecionado,
  onFechar,
  onConcluido,
}: {
  selecionado: ModalSelecionado;
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const editando = selecionado.modo === "editar";
  const id = editando ? selecionado.id : null;

  const [detalhes, setDetalhes] = useState<Restricao | null>(null);
  const [form, setForm] = useState<Formulario>({ nome: "", tipo: "" });
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erro, setErro] = useState("");
  const [erroExclusao, setErroExclusao] = useState("");
  const [animado, setAnimado] = useState(false);
  const [confirmacaoAnimada, setConfirmacaoAnimada] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimado(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!confirmarExclusao) {
      setConfirmacaoAnimada(false);
      return;
    }
    const frame = requestAnimationFrame(() => setConfirmacaoAnimada(true));
    return () => cancelAnimationFrame(frame);
  }, [confirmarExclusao]);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    async function carregarDetalhes() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await getInfoRestricao(id!);
        if (!ativo) return;
        setDetalhes(resposta);
        setForm({ nome: resposta.nome ?? "", tipo: String(resposta.tipo ?? "") });
      } catch (error) {
        if (ativo) setErro(mensagemErro(error, "Não foi possível carregar a restrição."));
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregarDetalhes();
    return () => { ativo = false; };
  }, [id]);

  useEffect(() => {
    function fecharComEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || salvando || deletando) return;
      if (confirmarExclusao) setConfirmarExclusao(false);
      else onFechar();
    }
    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [confirmarExclusao, deletando, onFechar, salvando]);

  const bloqueado = carregando || salvando || deletando;

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (bloqueado) return;
    setErro("");

    const nome = form.nome.trim();
    if (!nome) {
      setErro("Informe o nome da restrição.");
      return;
    }
    if (!TIPOS_RESTRICAO.some((tipo) => tipo.value === form.tipo)) {
      setErro("Selecione um tipo de restrição válido.");
      return;
    }

    const payload = { nome, tipo: form.tipo as AdicionarPayload["tipo"] };
    setSalvando(true);
    try {
      if (editando && id) {
        await editarRestricao(id, payload as EditarPayload);
        onConcluido("Restrição editada com sucesso!");
      } else {
        await addRestricao(payload);
        onConcluido("Restrição adicionada com sucesso!");
      }
    } catch (error) {
      setErro(mensagemErro(error, "Não foi possível salvar a restrição."));
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarDelete() {
    if (!id || bloqueado) return;
    setErroExclusao("");
    setDeletando(true);
    try {
      await deletarRestricao(id);
      onConcluido("Restrição deletada com sucesso!");
    } catch (error) {
      setErroExclusao(mensagemErro(error, "Não foi possível deletar a restrição."));
    } finally {
      setDeletando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !bloqueado && !confirmarExclusao) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-restricao-titulo"
        className={`max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-200 ease-out ${animado ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="h-2 bg-yellow-400" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                {editando ? <Pencil size={23} /> : <Plus size={23} />}
              </span>
              <div>
                <h2 id="modal-restricao-titulo" className="text-xl font-extrabold text-neutral-950">
                  {editando ? "Editar restrição" : "Adicionar restrição"}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {editando ? "Altere os dados e salve as modificações." : "Informe o nome e o tipo da nova restrição."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onFechar}
              disabled={bloqueado}
              aria-label="Fechar modal"
              className="rounded-xl p-2 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-40"
            >
              <X size={21} />
            </button>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center gap-3 py-20 text-sm text-neutral-500">
              <LoaderCircle size={23} className="animate-spin text-yellow-600" /> Carregando restrição...
            </div>
          ) : editando && !detalhes ? (
            <div role="alert" className="mt-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erro || "Não foi possível carregar esta restrição."}
            </div>
          ) : (
            <form onSubmit={(event) => void salvar(event)} className="mt-7 space-y-5">
              {editando && id && (
                <div>
                  <label htmlFor="restricao-id" className="mb-2 block text-sm font-semibold text-neutral-600">Identificador</label>
                  <input id="restricao-id" value={id} readOnly disabled className={inputClasse} />
                </div>
              )}
              <div>
                <label htmlFor="restricao-nome" className="mb-2 block text-sm font-semibold text-neutral-700">Nome da restrição</label>
                <input
                  id="restricao-nome"
                  type="text"
                  maxLength={255}
                  value={form.nome}
                  onChange={(event) => setForm((atual) => ({ ...atual, nome: event.target.value }))}
                  placeholder="Ex.: Intolerância à lactose"
                  className={inputClasse}
                  disabled={bloqueado}
                  required
                />
              </div>
              <div>
                <label htmlFor="restricao-tipo" className="mb-2 block text-sm font-semibold text-neutral-700">Tipo</label>
                <select
                  id="restricao-tipo"
                  value={form.tipo}
                  onChange={(event) => setForm((atual) => ({ ...atual, tipo: event.target.value }))}
                  className={inputClasse}
                  disabled={bloqueado}
                  required
                >
                  <option value="" disabled>Selecione o tipo</option>
                  {TIPOS_RESTRICAO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              {erro && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" /> {erro}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
                {editando && (
                  <button
                    type="button"
                    disabled={bloqueado}
                    onClick={() => { setErroExclusao(""); setConfirmarExclusao(true); }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={18} /> Deletar
                  </button>
                )}
                <div className="ml-auto flex items-center gap-3">
                  <button
                    type="button"
                    disabled={bloqueado}
                    onClick={onFechar}
                    className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={bloqueado}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {salvando ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                    {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar restrição"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {confirmarExclusao && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletando) setConfirmarExclusao(false);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="excluir-restricao-titulo"
            aria-describedby="excluir-restricao-descricao"
            className={`w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-7 shadow-2xl transition-all duration-200 ease-out ${confirmacaoAnimada ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={30} />
            </div>
            <h3 id="excluir-restricao-titulo" className="mt-5 text-center text-xl font-extrabold text-neutral-950">Deletar esta restrição?</h3>
            <p id="excluir-restricao-descricao" className="mt-3 text-center text-sm leading-6 text-neutral-500">
              Deseja realmente excluir <strong className="text-neutral-800">{detalhes?.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            {erroExclusao && (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroExclusao}</div>
            )}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={deletando}
                onClick={() => setConfirmarExclusao(false)}
                className="rounded-xl border border-neutral-200 px-3 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
              >
                Não, voltar
              </button>
              <button
                type="button"
                disabled={deletando}
                onClick={() => void confirmarDelete()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletando ? <><LoaderCircle size={17} className="animate-spin" /> Deletando...</> : "Sim, deletar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function GerenciarRestricoesPage() {
  const router = useRouter();

  const [nomeDigitado, setNomeDigitado] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>({ nome: "", tipo: "" });

  const [pagina, setPagina] = useState(0);
  const [dados, setDados] = useState<PaginaRestricoes | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState<ModalSelecionado | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [revisao, setRevisao] = useState(0);

  const filtrado = Boolean(filtrosAplicados.nome || filtrosAplicados.tipo);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro("");

    async function carregar() {
      try {

        const resposta = filtrado
          ? await buscaRestricao({
              nome: filtrosAplicados.nome || undefined,
              tipo: (filtrosAplicados.tipo || undefined) as ParametrosBusca["tipo"],
              pagina,
            })
          : await getIndexRestricoes(pagina);

        if (!ativo) return;

        const ultimaPagina = Math.max(0, resposta.totalPages - 1);
        if (pagina > ultimaPagina) {
          setPagina(ultimaPagina);
          return;
        }
        setDados(resposta);
      } catch (error) {
        if (ativo) {
          setDados(null);
          setErro(mensagemErro(error, "Não foi possível carregar as restrições."));
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [pagina, filtrosAplicados, revisao, filtrado]);

  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(
      () => setAviso(null),
      aviso.tipo === "sucesso" ? 2000 : 5000
    );
    return () => window.clearTimeout(timer);
  }, [aviso]);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPagina(0);
    setFiltrosAplicados({ nome: nomeDigitado.trim(), tipo: tipoSelecionado });
    setRevisao((atual) => atual + 1);
  }

  function limparFiltros() {
    setNomeDigitado("");
    setTipoSelecionado("");
    setFiltrosAplicados({ nome: "", tipo: "" });
    setPagina(0);
    setRevisao((atual) => atual + 1);
  }

  function concluirAcao(mensagem: string) {
    setModal(null);
    setAviso({ tipo: "sucesso", mensagem });
    setRevisao((atual) => atual + 1);
  }

  const itens = dados?.content ?? [];
  const total = dados?.totalElements ?? 0;
  const totalPaginas = dados?.totalPages ?? 0;
  const paginaAtual = dados?.number ?? pagina;

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#F6F6F2] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-yellow-400/15 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-950"
        >
          <ArrowLeft size={18} /> Voltar ao painel
        </button>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-neutral-950 shadow-sm">
              <ClipboardList size={28} />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">Gerenciar restrições</h1>
              <p className="mt-1 text-sm text-neutral-500">Consulte, pesquise e organize as restrições cadastradas.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModal({ modo: "adicionar" })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-neutral-950 shadow-sm transition-all hover:bg-yellow-300 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} /> Adicionar restrição
          </button>
        </div>

        <section className="overflow-visible rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_45px_rgba(0,0,0,0.05)]">
          <div className="rounded-t-3xl border-b border-neutral-100 px-5 py-6 sm:px-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-950">Restrições cadastradas</h2>
                <p className="mt-1 text-xs text-neutral-500">Clique em uma restrição para editar ou deletar.</p>
              </div>
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-800">
                {total} restrição(ões)
              </span>
            </div>

            <form onSubmit={buscar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="buscar-restricao-nome" className="mb-2 block text-sm font-semibold text-neutral-700">
                  Nome da restrição
                </label>
                <input
                  id="buscar-restricao-nome"
                  type="search"
                  value={nomeDigitado}
                  onChange={(event) => setNomeDigitado(event.target.value)}
                  placeholder="Digite o nome para pesquisar..."
                  className={inputClasse}
                />
              </div>

              <FiltroDeTipo value={tipoSelecionado} onChange={setTipoSelecionado} />

              <div className="flex gap-2">
                <button
                  type="submit"
                  aria-label="Pesquisar restrições"
                  title="Pesquisar restrições"
                  className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-neutral-950 transition-colors hover:bg-yellow-300"
                >
                  <Search size={20} /> <span className="sm:hidden">Pesquisar</span>
                </button>
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100"
                >
                  Limpar
                </button>
              </div>
            </form>
            {filtrado && (
              <p className="mt-3 text-xs text-neutral-500">
                Filtros aplicados: {filtrosAplicados.nome ? `nome: ${filtrosAplicados.nome}` : "todos os nomes"}
                {filtrosAplicados.tipo ? ` · tipo: ${nomeDoTipo(filtrosAplicados.tipo)}` : ""}
              </p>
            )}
          </div>

          {erro && (
            <div role="alert" className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-7">
              <AlertCircle size={19} className="shrink-0" /> {erro}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold sm:px-7">Nome da restrição</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Tipo</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold sm:px-7"><span className="sr-only">Editar</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {carregando ? (
                  <tr><td colSpan={3} className="px-5 py-14 text-center text-neutral-500"><LoaderCircle size={21} className="mr-2 inline animate-spin text-yellow-600" /> Carregando restrições...</td></tr>
                ) : erro ? (
                  <tr><td colSpan={3} className="px-5 py-12 text-center text-neutral-500">Não foi possível carregar os dados.</td></tr>
                ) : itens.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-14 text-center text-neutral-500">
                    {filtrado ? "Nenhuma restrição encontrada para os filtros aplicados." : "Nenhuma restrição cadastrada nesta página."}
                  </td></tr>
                ) : (
                  itens.map((restricao) => (
                    <tr
                      key={restricao.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Editar ${restricao.nome}`}
                      onClick={() => setModal({ modo: "editar", id: restricao.id })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setModal({ modo: "editar", id: restricao.id });
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-yellow-50/70 focus-visible:bg-yellow-50 focus-visible:outline-none"
                    >
                      <td className="px-5 py-4 font-semibold text-neutral-950 sm:px-7">{restricao.nome}</td>
                      <td className="px-5 py-4 text-neutral-600">{nomeDoTipo(String(restricao.tipo))}</td>
                      <td className="px-5 py-4 text-right font-semibold text-yellow-700 sm:px-7">
                        <span className="inline-flex items-center gap-1"><Pencil size={16} /> Editar</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 rounded-b-3xl border-t border-neutral-100 px-5 py-5 sm:px-7">
            <span className="text-xs text-neutral-500">
              Total de {total} restrição(ões) · até {dados?.size ?? 10} por página
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Página anterior"
                disabled={carregando || pagina <= 0}
                onClick={() => setPagina((atual) => Math.max(0, atual - 1))}
                className="rounded-xl border border-neutral-200 p-2 text-neutral-700 hover:border-yellow-400 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="min-w-[104px] text-center text-sm font-semibold text-neutral-700">
                {totalPaginas ? `Página ${paginaAtual + 1} de ${totalPaginas}` : "Página 0 de 0"}
              </span>
              <button
                type="button"
                aria-label="Próxima página"
                disabled={carregando || totalPaginas === 0 || pagina + 1 >= totalPaginas}
                onClick={() => setPagina((atual) => atual + 1)}
                className="rounded-xl border border-neutral-200 p-2 text-neutral-700 hover:border-yellow-400 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </footer>
        </section>
      </div>

      {aviso && (
        <div
          role={aviso.tipo === "erro" ? "alert" : "status"}
          className={`fixed right-4 top-24 z-[120] flex max-w-sm items-start gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-semibold shadow-xl sm:right-8 ${aviso.tipo === "sucesso" ? "border-yellow-300 text-neutral-800" : "border-red-200 text-red-700"}`}
        >
          {aviso.tipo === "sucesso" ? <CheckCircle2 size={20} className="shrink-0 text-yellow-600" /> : <AlertCircle size={20} className="shrink-0" />}
          {aviso.mensagem}
          <button aria-label="Fechar mensagem" onClick={() => setAviso(null)} className="ml-1 text-neutral-400 hover:text-neutral-700"><X size={17} /></button>
        </div>
      )}

      {modal && (
        <ModalRestricao
          key={modal.modo === "editar" ? `editar-${modal.id}` : "adicionar"}
          selecionado={modal}
          onFechar={() => setModal(null)}
          onConcluido={concluirAcao}
        />
      )}
    </main>
  );
}
