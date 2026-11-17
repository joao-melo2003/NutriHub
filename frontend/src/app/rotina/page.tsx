"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    LoaderCircle,
    Pencil,
    Plus,
    RefreshCw,
    X,
} from "lucide-react";

import {
    verificarRotinaUsuario,
} from "@/services/rotinaService";

import type {
    RotinaUsuario,
    VerificarRotinaResult
} from "@/types/padroes_rotina";

type EstadoPagina = "carregando" | "sem-rotina" | "corrompida" | "ok" | "erro";
type ModoFormulario = "criar" | "editar" | null;

export default function RotinaPage() {
    const [estado, setEstado] = useState<EstadoPagina>("carregando");
    const [rotina, setRotina] = useState<RotinaUsuario | null>(null);
    const [mensagem, setMensagem] = useState("");

    const [modalCorrompida, setModalCorrompida] = useState(false);
    const [modoFormulario, setModoFormulario] = useState<ModoFormulario>(null);

    // Reutiliza a primeira Promise quando o Strict Mode reexecuta o efeito.
    // Assim não repetimos a consulta inicial durante a mesma montagem.
    const requisicaoInicial = useRef<Promise<VerificarRotinaResult> | null>(null);

    const aplicarResultado = useCallback((resultado: VerificarRotinaResult) => {
        if (resultado.status === "OK") {
            setRotina(resultado.rotina);
            setMensagem("");
            setModalCorrompida(false);
            setEstado("ok");
            return;
        }

        setRotina(null);
        setMensagem(resultado.message);

        if (resultado.status === "SEM_ROTINA") {
            setModalCorrompida(false);
            setEstado("sem-rotina");
        } else {
            // Não mostramos o botão de criar rotina em caso de corrupção.
            setModalCorrompida(true);
            setEstado("corrompida");
        }
    }, []);

    useEffect(() => {
        let ativo = true;

        if (!requisicaoInicial.current) {
            requisicaoInicial.current = verificarRotinaUsuario();
        }

        requisicaoInicial.current
            .then((resultado) => {
                if (ativo) aplicarResultado(resultado);
            })
            .catch((error: unknown) => {
                if (!ativo) return;
                setMensagem(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível verificar sua rotina.",
                );
                setEstado("erro");
            });

        return () => {
            ativo = false;
        };
    }, [aplicarResultado]);

    // Pode ser chamado novamente após a conclusão dos formulários.
    async function recarregarRotina() {
        setEstado("carregando");
        setMensagem("");

        try {
            const resultado = await verificarRotinaUsuario();
            aplicarResultado(resultado);
        } catch (error) {
            setMensagem(
                error instanceof Error
                    ? error.message
                    : "Não foi possível verificar sua rotina.",
            );
            setEstado("erro");
        }
    }

    // Esc fecha os modais, sem alterar o estado real da rotina.
    useEffect(() => {
        if (!modalCorrompida && !modoFormulario) return;

        function aoPressionarTecla(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setModalCorrompida(false);
                setModoFormulario(null);
            }
        }

        document.addEventListener("keydown", aoPressionarTecla);
        return () => document.removeEventListener("keydown", aoPressionarTecla);
    }, [modalCorrompida, modoFormulario]);

    return (
        <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#F6F6F2] px-4 py-10 sm:px-6">
            <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-400/15 blur-3xl" />

            <div className="relative mx-auto w-full max-w-5xl">
                <header className="mb-9 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 shadow-sm">
                            <ClipboardList size={28} strokeWidth={2.2} className="text-neutral-950" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
                        Minha rotina
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500 sm:text-base">
                        Organize seus treinos, sua alimentação e seus objetivos em um só lugar.
                    </p>
                </header>

                {/* Enquanto a API responde */}
                {estado === "carregando" && (
                    <div role="status" className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
                        <LoaderCircle size={40} className="animate-spin text-yellow-500" />
                        <h2 className="mt-5 text-xl font-bold text-neutral-900">
                            Verificando sua rotina...
                        </h2>
                        <p className="mt-2 text-sm text-neutral-500">
                            Estamos consultando suas informações.
                        </p>
                    </div>
                )}

                {/* 404: usuário sem rotina */}
                {estado === "sem-rotina" && (
                    <button
                        type="button"
                        onClick={() => setModoFormulario("criar")}
                        className="group flex min-h-64 w-full flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-yellow-300 bg-white px-6 py-10 text-center shadow-[0_16px_48px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-yellow-400 hover:bg-yellow-50/40 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500 sm:min-h-80"
                    >
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-neutral-950 transition-transform duration-200 group-hover:scale-110">
                            <Plus size={38} strokeWidth={2.5} />
                        </span>
                        <span className="text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                            Crie sua rotina de treino
                        </span>
                        <span className="max-w-md text-sm leading-relaxed text-neutral-500">
                            Comece a montar sua rotina personalizada com o formulário passo a passo.
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-yellow-700">
                            Começar agora <ArrowRight size={17} />
                        </span>
                    </button>
                )}

                {/* 200: rotina encontrada. O conteúdo real será definido na próxima etapa. */}
                {estado === "ok" && rotina && (
                    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                                    <CheckCircle2 size={25} className="text-yellow-700" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-950">Sua rotina foi encontrada</h2>
                                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                                        A rotina está cadastrada. A exibição dos dados será adicionada
                                        quando definirmos o formato dos formulários.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModoFormulario("editar")}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-yellow-300"
                            >
                                <Pencil size={17} /> Editar rotina
                            </button>
                        </div>

                        {/* TODO - ETAPA FUTURA: exibir aqui a rotina formatada.
                O formato da rotina será definido depois que os cinco
                formulários e os dados retornados pelo backend forem detalhados.

                Exemplo futuro:
                <VisualizacaoRotina rotina={rotina} />
            */}
                    </section>
                )}

                {/* 409: mostramos o modal de erro. Nunca habilitamos a criação aqui. */}
                {estado === "corrompida" && (
                    <section className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 py-10 text-center shadow-sm">
                        <AlertTriangle size={34} className="text-yellow-600" />
                        <h2 className="mt-4 text-xl font-bold text-neutral-900">
                            Não foi possível exibir sua rotina
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-neutral-500">
                            {mensagem || "Sua rotina precisa ser verificada."}
                        </p>
                    </section>
                )}

                {/* Erro inesperado, diferente de 404 e 409 */}
                {estado === "erro" && (
                    <section className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 py-10 text-center shadow-sm">
                        <AlertTriangle size={36} className="text-red-500" />
                        <h2 className="mt-4 text-xl font-bold text-neutral-900">
                            Não foi possível carregar sua rotina
                        </h2>
                        <p role="alert" className="mt-2 max-w-md text-sm text-neutral-500">
                            {mensagem}
                        </p>
                        <button
                            type="button"
                            onClick={() => void recarregarRotina()}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-neutral-950 hover:bg-yellow-300"
                        >
                            <RefreshCw size={17} /> Tentar novamente
                        </button>
                    </section>
                )}
            </div>

            {/* MODAL: rotina corrompida (fechável no OK ou fora do card) */}
            {modalCorrompida && estado === "corrompida" && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setModalCorrompida(false);
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="rotina-corrompida-titulo"
                        aria-describedby="rotina-corrompida-mensagem"
                        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
                    >
                        <div className="h-2 bg-yellow-400" />
                        <div className="flex flex-col items-center px-7 py-9 text-center">
                            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                                <AlertTriangle size={38} className="text-yellow-700" />
                            </span>
                            <h2 id="rotina-corrompida-titulo" className="mt-5 text-2xl font-bold text-neutral-900">
                                Problema com sua rotina
                            </h2>
                            <p id="rotina-corrompida-mensagem" className="mt-3 text-sm leading-relaxed text-neutral-600">
                                {mensagem || "A rotina está corrompida e não pode ser exibida."}
                            </p>
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setModalCorrompida(false)}
                                className="mt-7 w-full rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-colors hover:bg-yellow-300"
                            >
                                OK
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* MODAL RESERVADO PARA OS CINCO FORMULÁRIOS */}
            {modoFormulario !== null && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setModoFormulario(null);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="rotina-form-titulo"
                        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                    >
                        <div className="h-2 bg-yellow-400" />
                        <div className="px-6 py-8 sm:px-10 sm:py-10">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 id="rotina-form-titulo" className="text-2xl font-extrabold text-neutral-950">
                                        {modoFormulario === "criar" ? "Criar minha rotina" : "Editar minha rotina"}
                                    </h2>
                                    <p className="mt-2 text-sm text-neutral-500">
                                        Os cinco formulários sequenciais serão conectados nesta área.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModoFormulario(null)}
                                    aria-label="Fechar formulário"
                                    className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="mt-7 rounded-2xl border-2 border-dashed border-yellow-200 bg-yellow-50/40 px-6 py-12 text-center">
                                <ClipboardList size={34} className="mx-auto text-yellow-600" />
                                <p className="mt-4 font-semibold text-neutral-800">
                                    Espaço reservado para os formulários
                                </p>
                                <p className="mt-2 text-sm text-neutral-500">
                                    Vamos montar as etapas na próxima fase.
                                </p>
                            </div>

                            {/* TODO - FORMS (etapa seguinte):
                  Importar o fluxo de src/components/forms ou da sua pasta forms.
                  O modal NÃO redireciona ainda (nenhum router.push).
                  Usaremos o mesmo fluxo para criar e editar.

                  <RotinaWizard
                    modo={modoFormulario}
                    rotinaInicial={modoFormulario === "editar" ? rotina : null}
                    onCancelar={() => setModoFormulario(null)}
                    onConcluido={async () => {
                      setModoFormulario(null);
                      await recarregarRotina();
                    }}
                  />
              */}
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}
