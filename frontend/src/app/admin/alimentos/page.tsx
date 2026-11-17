"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Apple,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  addAlimento,
  buscaAlimentoNome,
  deletarAlimento,
  editarAlimento,
  getIndexAlimentos,
  getInfoAlimento,
} from "@/services/usuarioService";

type Alimento = Awaited<ReturnType<typeof getInfoAlimento>>;
type PaginaAlimentos = Awaited<ReturnType<typeof getIndexAlimentos>>;
type CriarAlimentoPayload = Parameters<typeof addAlimento>[0];
type EditarAlimentoPayload = Parameters<typeof editarAlimento>[1];

type FormularioAlimento = {
  nome: string;
  categoria: string;
  calorias: string;
  proteina: string;
  carboidratos: string;
  gorduras: string;
};

type ModalSelecionado =
  | { modo: "adicionar" }
  | { modo: "editar"; id: string };

type Aviso = { tipo: "sucesso" | "erro"; mensagem: string };

const CATEGORIAS_ALIMENTO = [
  { value: "CEREAIS", label: "Cereais" },
  { value: "TUBERCULOS_RAIZES", label: "Tubérculos e raízes" },
  { value: "HORTALICAS", label: "Hortaliças" },
  { value: "FRUTAS", label: "Frutas" },
  { value: "CARNES_OVOS", label: "Carnes e ovos" },
  { value: "LATICINEOS", label: "Laticínios" },
  { value: "OLEOS_GORDURAS", label: "Óleos e gorduras" },
  { value: "ACUCARES", label: "Açúcares" },
] as const;

const FORMULARIO_VAZIO: FormularioAlimento = {
  nome: "",
  categoria: "",
  calorias: "",
  proteina: "",
  carboidratos: "",
  gorduras: "",
};

const camposNutricionais: {
  chave: "calorias" | "proteina" | "carboidratos" | "gorduras";
  rotulo: string;
  unidade: string;
}[] = [
  { chave: "calorias", rotulo: "Calorias", unidade: "kcal" },
  { chave: "proteina", rotulo: "Proteínas", unidade: "g" },
  { chave: "carboidratos", rotulo: "Carboidratos", unidade: "g" },
  { chave: "gorduras", rotulo: "Gorduras", unidade: "g" },
];

const campo =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition-all focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

function formatarValor(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "—";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(numero);
}

function formatarCategoria(categoria: string): string {
  return CATEGORIAS_ALIMENTO.find((item) => item.value === categoria)?.label
    ?? (categoria || "—").replace(/_/g, " ");
}

function formularioDeAlimento(alimento: Alimento): FormularioAlimento {
  return {
    nome: alimento.nome ?? "",
    categoria: String(alimento.categoria ?? ""),
    calorias: String(alimento.calorias ?? ""),
    proteina: String(alimento.proteina ?? ""),
    carboidratos: String(alimento.carboidratos ?? ""),
    gorduras: String(alimento.gorduras ?? ""),
  };
}

function gerarPayload(form: FormularioAlimento): CriarAlimentoPayload {
  const numero = (texto: string) => Number(texto.trim().replace(",", "."));
  return {
    nome: form.nome.trim(),
    categoria: form.categoria.trim().toUpperCase() as CriarAlimentoPayload["categoria"],
    calorias: numero(form.calorias),
    proteina: numero(form.proteina),
    carboidratos: numero(form.carboidratos),
    gorduras: numero(form.gorduras),
  };
}

function validarFormulario(form: FormularioAlimento): string | null {
  if (!form.nome.trim()) return "Informe o nome do alimento.";
  if (!form.categoria.trim()) return "Informe a categoria do alimento.";

  for (const item of camposNutricionais) {
    const valor = form[item.chave].trim();
    const numero = Number(valor.replace(",", "."));

    if (!valor || !Number.isFinite(numero) || numero < 0) {
      return `${item.rotulo}: informe um número válido maior ou igual a zero.`;
    }
    if (item.chave === "calorias" && !Number.isInteger(numero)) {
      return "Calorias devem ser informadas em um número inteiro de kcal.";
    }
  }
  return null;
}

function ModalAlimento({
  selecionado,
  onFechar,
  onConcluido,
}: {
  selecionado: ModalSelecionado;
  onFechar: () => void;
  onConcluido: (mensagem: string) => void;
}) {
  const edicao = selecionado.modo === "editar";
  const id = edicao ? selecionado.id : null;

  const [detalhes, setDetalhes] = useState<Alimento | null>(null);
  const [form, setForm] = useState<FormularioAlimento>({ ...FORMULARIO_VAZIO });
  const [carregando, setCarregando] = useState(edicao);
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [animado, setAnimado] = useState(false);
  const [confirmacaoAnimada, setConfirmacaoAnimada] = useState(false);
  const [erro, setErro] = useState("");
  const [erroExclusao, setErroExclusao] = useState("");

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
        const alimento = await getInfoAlimento(id!);
        if (!ativo) return;
        setDetalhes(alimento);
        setForm(formularioDeAlimento(alimento));
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Não foi possível carregar o alimento.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregarDetalhes();
    return () => { ativo = false; };
  }, [id]);

  useEffect(() => {
    function aoPressionarEsc(event: KeyboardEvent) {
      if (event.key !== "Escape" || salvando || deletando) return;
      if (confirmarExclusao) setConfirmarExclusao(false);
      else onFechar();
    }
    document.addEventListener("keydown", aoPressionarEsc);
    return () => document.removeEventListener("keydown", aoPressionarEsc);
  }, [confirmarExclusao, deletando, onFechar, salvando]);

  function atualizarCampo(chave: keyof FormularioAlimento, valor: string) {
    setForm((anterior) => ({ ...anterior, [chave]: valor }));
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando || deletando || carregando) return;

    setErro("");
    const erroFormulario = validarFormulario(form);
    if (erroFormulario) {
      setErro(erroFormulario);
      return;
    }

    setSalvando(true);
    try {
      const payload = gerarPayload(form);
      if (edicao && id) {
        await editarAlimento(id, payload as EditarAlimentoPayload);
        onConcluido("Alimento editado com sucesso!");
      } else {
        await addAlimento(payload);
        onConcluido("Alimento adicionado com sucesso!");
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar o alimento.");
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarDelete() {
    if (!id || deletando || salvando) return;
    setErroExclusao("");
    setDeletando(true);
    try {
      await deletarAlimento(id);
      onConcluido("Alimento deletado com sucesso!");
    } catch (error) {
      setErroExclusao(error instanceof Error ? error.message : "Não foi possível deletar o alimento.");
    } finally {
      setDeletando(false);
    }
  }

  const bloqueado = salvando || deletando || carregando;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !bloqueado && !confirmarExclusao) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-alimento-titulo"
        className={`max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-200 ease-out ${animado ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="h-2 bg-yellow-400" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                {edicao ? <Pencil size={23} /> : <Plus size={24} />}
              </span>
              <div>
                <h2 id="modal-alimento-titulo" className="text-xl font-extrabold text-neutral-950">
                  {edicao ? "Editar alimento" : "Adicionar alimento"}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {edicao ? "Altere os dados nutricionais e salve." : "Preencha os dados nutricionais do novo alimento."}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Fechar modal"
              disabled={bloqueado}
              onClick={onFechar}
              className="rounded-xl p-2 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-40"
            >
              <X size={21} />
            </button>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center gap-3 py-20 text-sm text-neutral-500">
              <LoaderCircle size={23} className="animate-spin text-yellow-600" /> Carregando informações do alimento...
            </div>
          ) : edicao && !detalhes ? (
            <div role="alert" className="mt-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erro || "Não foi possível carregar os dados deste alimento."}
            </div>
          ) : (
            <form onSubmit={(event) => void salvar(event)} className="mt-7 space-y-5">
              {edicao && id && (
                <div>
                  <label htmlFor="id-alimento" className="mb-2 block text-xs font-semibold text-neutral-600">Identificador</label>
                  <input id="id-alimento" type="text" value={id} readOnly disabled className={campo} />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="nome-alimento" className="mb-2 block text-sm font-semibold text-neutral-700">Nome do alimento</label>
                  <input
                    id="nome-alimento"
                    type="text"
                    maxLength={255}
                    value={form.nome}
                    onChange={(event) => atualizarCampo("nome", event.target.value)}
                    disabled={bloqueado}
                    placeholder="Ex.: Filé com cebola"
                    required
                    className={campo}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="categoria-alimento" className="mb-2 block text-sm font-semibold text-neutral-700">Categoria</label>
                  <select
                    id="categoria-alimento"
                    value={form.categoria}
                    onChange={(event) => atualizarCampo("categoria", event.target.value)}
                    disabled={bloqueado}
                    required
                    className={campo}
                  >
                    <option value="" disabled>Selecione a categoria</option>
                    {CATEGORIAS_ALIMENTO.map((categoria) => (
                      <option key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </option>
                    ))}
                  </select>
                </div>

                {camposNutricionais.map((item) => (
                  <div key={item.chave}>
                    <label htmlFor={`alimento-${item.chave}`} className="mb-2 block text-sm font-semibold text-neutral-700">
                      {item.rotulo} ({item.unidade})
                    </label>
                    <div className="relative">
                      <input
                        id={`alimento-${item.chave}`}
                        type="text"
                        inputMode="decimal"
                        value={form[item.chave]}
                        onChange={(event) => atualizarCampo(item.chave, event.target.value)}
                        placeholder={item.chave === "calorias" ? "0" : "0,00"}
                        disabled={bloqueado}
                        required
                        className={`${campo} pr-16`}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-neutral-400">
                        {item.unidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {erro && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" /> {erro}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
                {edicao && (
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
                    {salvando ? "Salvando..." : edicao ? "Salvar alterações" : "Adicionar alimento"}
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
            if (event.currentTarget === event.target && !deletando) setConfirmarExclusao(false);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="deletar-alimento-titulo"
            aria-describedby="deletar-alimento-descricao"
            className={`w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-7 shadow-2xl transition-all duration-200 ease-out ${confirmacaoAnimada ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600"><Trash2 size={30} /></div>
            <h3 id="deletar-alimento-titulo" className="mt-5 text-center text-xl font-extrabold text-neutral-950">
              Deletar este alimento?
            </h3>
            <p id="deletar-alimento-descricao" className="mt-3 text-center text-sm leading-6 text-neutral-500">
              Deseja realmente excluir <strong className="text-neutral-800">{detalhes?.nome}</strong>? Esta ação não poderá ser desfeita.
            </p>
            {erroExclusao && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroExclusao}</div>}
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

export default function GerenciarAlimentosPage() {
  const router = useRouter();
  const [pagina, setPagina] = useState(0);
  const [dadosIndex, setDadosIndex] = useState<PaginaAlimentos | null>(null);
  const [busca, setBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<Alimento[]>([]);
  const [carregandoIndex, setCarregandoIndex] = useState(true);
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [erroIndex, setErroIndex] = useState("");
  const [erroBusca, setErroBusca] = useState("");
  const [modal, setModal] = useState<ModalSelecionado | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [revisao, setRevisao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregandoIndex(true);
    setErroIndex("");

    async function carregarPagina() {
      try {
        const resposta = await getIndexAlimentos(pagina);
        if (!ativo) return;

        const ultimaPagina = Math.max(0, resposta.totalPages - 1);
        if (pagina > ultimaPagina) {
          setPagina(ultimaPagina);
          return;
        }
        setDadosIndex(resposta);
      } catch (error) {
        if (ativo) setErroIndex(error instanceof Error ? error.message : "Erro ao listar alimentos.");
      } finally {
        if (ativo) setCarregandoIndex(false);
      }
    }
    void carregarPagina();
    return () => { ativo = false; };
  }, [pagina, revisao]);

  useEffect(() => {
    let ativo = true;
    const nome = busca.trim();

    if (!nome) {
      setResultadosBusca([]);
      setErroBusca("");
      setCarregandoBusca(false);
      return;
    }

    setCarregandoBusca(true);
    setErroBusca("");

    const timer = window.setTimeout(async () => {
      try {
        const resposta = await buscaAlimentoNome(nome);
        if (ativo) setResultadosBusca(resposta);
      } catch (error) {
        if (ativo) {
          setResultadosBusca([]);
          setErroBusca(error instanceof Error ? error.message : "Não foi possível buscar alimentos.");
        }
      } finally {
        if (ativo) setCarregandoBusca(false);
      }
    }, 250);

    return () => {
      ativo = false;
      window.clearTimeout(timer);
    };
  }, [busca, revisao]);

  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(null), aviso.tipo === "sucesso" ? 2000 : 5000);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  function concluirAcao(mensagem: string) {
    setModal(null);
    setAviso({ tipo: "sucesso", mensagem });
    setRevisao((anterior) => anterior + 1);
  }

  const pesquisando = busca.trim().length > 0;
  const lista = pesquisando ? resultadosBusca : dadosIndex?.content ?? [];
  const carregando = pesquisando ? carregandoBusca : carregandoIndex;
  const erroAtual = pesquisando ? erroBusca : erroIndex;
  const totalPaginas = dadosIndex?.totalPages ?? 0;
  const paginaAtual = dadosIndex?.number ?? pagina;
  const total = pesquisando ? resultadosBusca.length : dadosIndex?.totalElements ?? 0;

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
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 text-neutral-950 shadow-sm"><Apple size={28} /></span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">Gerenciar alimentos</h1>
              <p className="mt-1 text-sm text-neutral-500">Consulte, adicione e atualize os dados nutricionais.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModal({ modo: "adicionar" })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-neutral-950 shadow-sm transition-all hover:bg-yellow-300 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} /> Adicionar alimento
          </button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_45px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-6 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-950">Alimentos cadastrados</h2>
                <p className="mt-1 text-xs text-neutral-500">Clique em qualquer alimento para consultar ou editar.</p>
              </div>
              <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-800">
                {pesquisando ? `${total} resultado(s)` : `${total} alimento(s)`}
              </span>
            </div>

            <div className="relative max-w-xl">
              <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                aria-label="Buscar alimento por nome"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Digite o nome do alimento..."
                className={`${campo} pl-12`}
              />
            </div>
          </div>

          {erroAtual && (
            <div role="alert" className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-7">
              <AlertCircle size={19} className="shrink-0" /> {erroAtual}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold sm:px-7">Alimento</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Categoria</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Calorias (kcal)</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Proteínas (g)</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Carboidratos (g)</th>
                  <th scope="col" className="px-4 py-4 text-right font-semibold">Gorduras (g)</th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold sm:px-7"><span className="sr-only">Editar</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {carregando ? (
                  <tr><td colSpan={7} className="px-5 py-14 text-center text-neutral-500"><LoaderCircle size={21} className="mr-2 inline animate-spin text-yellow-600" /> Carregando alimentos...</td></tr>
                ) : erroAtual ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-neutral-500">Não foi possível carregar os dados.</td></tr>
                ) : lista.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-14 text-center text-neutral-500">{pesquisando ? "Nenhum alimento encontrado para essa pesquisa." : "Nenhum alimento cadastrado nesta página."}</td></tr>
                ) : (
                  lista.map((alimento) => (
                    <tr
                      key={alimento.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Editar ${alimento.nome}`}
                      onClick={() => setModal({ modo: "editar", id: alimento.id })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setModal({ modo: "editar", id: alimento.id });
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-yellow-50/70 focus-visible:bg-yellow-50 focus-visible:outline-none"
                    >
                      <td className="max-w-[270px] px-5 py-4 font-semibold text-neutral-950 sm:px-7">{alimento.nome}</td>
                      <td className="px-4 py-4 text-xs text-neutral-600">{formatarCategoria(String(alimento.categoria))}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-neutral-700">{formatarValor(alimento.calorias)}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-neutral-700">{formatarValor(alimento.proteina)}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-neutral-700">{formatarValor(alimento.carboidratos)}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-neutral-700">{formatarValor(alimento.gorduras)}</td>
                      <td className="px-5 py-4 text-right font-semibold text-yellow-700 sm:px-7"><span className="inline-flex items-center gap-1"><Pencil size={16} /> Editar</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 px-5 py-5 sm:px-7">
            <span className="text-xs text-neutral-500">
              {pesquisando ? "Resultados da busca por nome" : `Total de ${dadosIndex?.totalElements ?? 0} alimento(s) · até ${dadosIndex?.size ?? 10} por página`}
            </span>

            {!pesquisando && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={carregandoIndex || paginaAtual <= 0}
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
                  disabled={carregandoIndex || totalPaginas === 0 || paginaAtual + 1 >= totalPaginas}
                  onClick={() => setPagina((atual) => atual + 1)}
                  className="rounded-xl border border-neutral-200 p-2 text-neutral-700 hover:border-yellow-400 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </footer>
        </section>
      </div>

      {aviso && (
        <div
          role={aviso.tipo === "erro" ? "alert" : "status"}
          className="fixed bottom-6 right-4 z-[120] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-yellow-200 bg-white px-5 py-4 text-sm font-semibold text-neutral-900 shadow-xl sm:right-8"
        >
          <CheckCircle2 size={21} className="shrink-0 text-yellow-600" /> {aviso.mensagem}
        </div>
      )}

      {modal && (
        <ModalAlimento
          key={modal.modo === "editar" ? modal.id : "novo"}
          selecionado={modal}
          onFechar={() => setModal(null)}
          onConcluido={concluirAcao}
        />
      )}
    </main>
  );
}
