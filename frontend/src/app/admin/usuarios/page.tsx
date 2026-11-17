"use client";

import {
    type FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    Ban,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Search,
    ShieldAlert,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";
import {
    banirUsuario,
    filtraUsuariosPorNome,
    getIndexUsuarios,
    getUsuarioInfos,
} from "@/services/usuarioService";

import type {
    IndexUsuariosParams,
    PageResponse,
    UsuarioResponse,
    UsuariosPorStatusResponse,
} from "@/types/padroes";

type ChaveTabela = keyof UsuariosPorStatusResponse;

type Paginas = Record<ChaveTabela, number>;
type Carregamentos = Record<ChaveTabela, boolean>;

const PAGINAS_INICIAIS: Paginas = {
    usuarios_ativos: 0,
    usuarios_banidos: 0,
    usuarios_desativados: 0,
};

const NENHUMA_TABELA_CARREGANDO: Carregamentos = {
    usuarios_ativos: false,
    usuarios_banidos: false,
    usuarios_desativados: false,
};

const SECOES: {
    chave: ChaveTabela;
    titulo: string;
    descricao: string;
    indicador: string;
}[] = [
        {
            chave: "usuarios_ativos",
            titulo: "Usuários ativos",
            descricao: "Contas que podem acessar normalmente o NutriHub.",
            indicador: "bg-emerald-100 text-emerald-700",
        },
        {
            chave: "usuarios_banidos",
            titulo: "Usuários banidos",
            descricao: "Contas com acesso bloqueado.",
            indicador: "bg-red-100 text-red-700",
        },
        {
            chave: "usuarios_desativados",
            titulo: "Usuários desativados",
            descricao: "Contas desativadas pelos próprios usuários.",
            indicador: "bg-neutral-200 text-neutral-600",
        },
    ];

function formatarCpf(cpf: string) {
    const digitos = cpf.replace(/\D/g, "");
    return digitos.length === 11
        ? digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        : cpf;
}

function formatarData(data: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return data || "—";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function rotuloSexo(sexo: string) {
    if (sexo === "F") return "Feminino";
    if (sexo === "M") return "Masculino";
    return sexo || "—";
}

function rotuloTipo(tipo: string) {
    if (tipo === "ADMIN") return "Administrador";
    if (tipo === "COMUM") return "Usuário comum";
    return tipo || "—";
}

function rotuloStatus(status: string) {
    switch (status) {
        case "ATIVO": return "Ativo";
        case "BANIDO": return "Banido";
        case "DESATIVADO": return "Desativado";
        default: return status || "—";
    }
}

function EtiquetaStatus({ status }: { status: string }) {
    const classe =
        status === "ATIVO"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : status === "BANIDO"
                ? "bg-red-50 text-red-700 ring-red-200"
                : "bg-neutral-100 text-neutral-600 ring-neutral-200";

    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${classe}`}>
            {rotuloStatus(status)}
        </span>
    );
}

function TabelaUsuarios({
    titulo,
    descricao,
    indicador,
    pagina,
    carregando,
    onAbrir,
    onMudarPagina,
}: {
    titulo: string;
    descricao: string;
    indicador: string;
    pagina: PageResponse<UsuarioResponse>;
    carregando: boolean;
    onAbrir: (usuario: UsuarioResponse) => void;
    onMudarPagina: (pagina: number) => void;
}) {
    const totalPaginas = pagina.totalPages;
    const paginaAtual = pagina.number;
    const podeAnterior = !carregando && totalPaginas > 0 && !pagina.first && paginaAtual > 0;
    const podeProxima = !carregando && totalPaginas > 0 && !pagina.last && paginaAtual + 1 < totalPaginas;

    return (
        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 shrink-0 rounded-full ${indicador.split(" ")[0]}`} />
                    <div>
                        <h2 className="text-lg font-extrabold text-neutral-950">{titulo}</h2>
                        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">{descricao}</p>
                    </div>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
                    {pagina.totalElements} {pagina.totalElements === 1 ? "usuário" : "usuários"}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[660px] border-collapse text-left text-sm">
                    <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Nome</th>
                            <th scope="col" className="px-6 py-4 font-semibold">CPF</th>
                            <th scope="col" className="px-6 py-4 font-semibold">E-mail</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold"><span className="sr-only">Detalhes</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {carregando ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                                    <LoaderCircle size={20} className="mr-2 inline animate-spin text-yellow-600" />
                                    Carregando usuários...
                                </td>
                            </tr>
                        ) : pagina.content.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                                    Nenhum usuário encontrado nesta página.
                                </td>
                            </tr>
                        ) : (
                            pagina.content.map((usuario) => (
                                <tr
                                    key={usuario.cpf}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Ver detalhes de ${usuario.nome}`}
                                    onClick={() => onAbrir(usuario)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            onAbrir(usuario);
                                        }
                                    }}
                                    className="cursor-pointer transition-colors hover:bg-yellow-50/70 focus-visible:bg-yellow-50 focus-visible:outline-none"
                                >
                                    <td className="px-6 py-4 font-semibold text-neutral-900">{usuario.nome}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-neutral-600">{formatarCpf(usuario.cpf)}</td>
                                    <td className="px-6 py-4 text-neutral-600">{usuario.email}</td>
                                    <td className="px-6 py-4"><EtiquetaStatus status={usuario.status} /></td>
                                    <td className="px-6 py-4 text-right font-semibold text-yellow-700">Ver detalhes</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4 sm:px-7">
                <span className="text-xs text-neutral-500">
                    {pagina.totalElements} resultado(s) · até {pagina.size} por página
                </span>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label={`Página anterior de ${titulo}`}
                        onClick={() => onMudarPagina(paginaAtual - 1)}
                        disabled={!podeAnterior}
                        className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-700 transition-colors hover:border-yellow-400 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="min-w-[100px] text-center text-sm font-semibold text-neutral-700">
                        {totalPaginas === 0 ? "Página 0 de 0" : `Página ${paginaAtual + 1} de ${totalPaginas}`}
                    </span>
                    <button
                        type="button"
                        aria-label={`Próxima página de ${titulo}`}
                        onClick={() => onMudarPagina(paginaAtual + 1)}
                        disabled={!podeProxima}
                        className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-700 transition-colors hover:border-yellow-400 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </footer>
        </section>
    );
}

function CampoSomenteLeitura({
    rotulo,
    valor,
}: {
    rotulo: string;
    valor: string;
}) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-xs font-semibold text-neutral-600">{rotulo}</label>
            <div className="min-h-12 break-words rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500">
                {valor || "—"}
            </div>
        </div>
    );
}

function ModalUsuario({
    usuario,
    onFechar,
    onBanido,
}: {
    usuario: UsuarioResponse;
    onFechar: () => void;
    onBanido: () => Promise<void>;
}) {
    const [detalhes, setDetalhes] = useState<UsuarioResponse | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [aberto, setAberto] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false);
    const [banindo, setBanindo] = useState(false);
    const [erroBanimento, setErroBanimento] = useState("");

    useEffect(() => {
        const id = requestAnimationFrame(() => setAberto(true));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        if (!confirmando) {
            setConfirmacaoVisivel(false);
            return;
        }
        const id = requestAnimationFrame(() => setConfirmacaoVisivel(true));
        return () => cancelAnimationFrame(id);
    }, [confirmando]);

    useEffect(() => {
        let ativo = true;

        async function buscarDetalhes() {
            setCarregando(true);
            setErro("");
            try {
                // Usa o CPF selecionado como infoUser.
                const resposta = await getUsuarioInfos(usuario.cpf);
                if (ativo) setDetalhes(resposta);
            } catch (error) {
                if (ativo) {
                    setErro(error instanceof Error ? error.message : "Erro ao buscar usuário.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void buscarDetalhes();
        return () => { ativo = false; };
    }, [usuario.cpf]);

    useEffect(() => {
        function aoPressionarTecla(event: KeyboardEvent) {
            if (event.key !== "Escape" || banindo) return;
            if (confirmando) setConfirmando(false);
            else onFechar();
        }
        document.addEventListener("keydown", aoPressionarTecla);
        return () => document.removeEventListener("keydown", aoPressionarTecla);
    }, [banindo, confirmando, onFechar]);

    async function confirmarBanimento() {
        if (banindo) return;
        setErroBanimento("");
        setBanindo(true);
        try {
            await banirUsuario(usuario.cpf);
            await onBanido();
        } catch (error) {
            setErroBanimento(
                error instanceof Error ? error.message : "Não foi possível banir o usuário."
            );
        } finally {
            setBanindo(false);
        }
    }

    const info = detalhes;
    const podeBanir = (info ?? usuario).status === "ATIVO";

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[3px]"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !banindo && !confirmando) onFechar();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="detalhes-usuario-titulo"
                className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-200 ease-out ${aberto ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            >
                <div className="h-2 bg-yellow-400" />
                <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700"><UserRound size={24} /></span>
                            <div>
                                <h2 id="detalhes-usuario-titulo" className="text-xl font-extrabold text-neutral-950">Informações do usuário</h2>
                                <p className="mt-1 text-xs text-neutral-500">Dados somente para consulta.</p>
                            </div>
                        </div>
                        <button type="button" disabled={banindo} onClick={onFechar} aria-label="Fechar detalhes" className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"><X size={21} /></button>
                    </div>

                    {carregando ? (
                        <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500"><LoaderCircle size={22} className="animate-spin text-yellow-600" /> Carregando informações...</div>
                    ) : erro ? (
                        <div role="alert" className="mt-7 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={19} className="shrink-0" /> {erro}</div>
                    ) : info ? (
                        <>
                            {/* Não exibimos senha, qtSenha ou status neste modal. */}
                            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <CampoSomenteLeitura rotulo="Nome completo" valor={info.nome} />
                                <CampoSomenteLeitura rotulo="CPF" valor={formatarCpf(info.cpf)} />
                                <CampoSomenteLeitura rotulo="E-mail" valor={info.email} />
                                <CampoSomenteLeitura rotulo="Nascimento" valor={formatarData(info.dataNascimento)} />
                                <CampoSomenteLeitura rotulo="Sexo" valor={rotuloSexo(info.sexo)} />
                                <CampoSomenteLeitura rotulo="Tipo de usuário" valor={rotuloTipo(info.tipo)} />
                            </div>
                            <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-neutral-100 pt-5">
                                <button type="button" onClick={onFechar} className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">Fechar</button>
                                {podeBanir && (
                                    <button type="button" onClick={() => { setErroBanimento(""); setConfirmando(true); }} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700">
                                        <Ban size={18} /> Banir usuário
                                    </button>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </section>

            {confirmando && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4" role="presentation" onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !banindo) setConfirmando(false);
                }}>
                    <section role="alertdialog" aria-modal="true" aria-labelledby="banir-titulo" aria-describedby="banir-descricao" className={`w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-7 shadow-2xl transition-all duration-200 ease-out ${confirmacaoVisivel ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600"><ShieldAlert size={30} /></div>
                        <h3 id="banir-titulo" className="mt-5 text-center text-xl font-extrabold text-neutral-950">Banir este usuário?</h3>
                        <p id="banir-descricao" className="mt-3 text-center text-sm leading-6 text-neutral-500">
                            Deseja realmente banir <strong className="text-neutral-800">{info?.nome ?? usuario.nome}</strong>? O acesso à conta será bloqueado.
                        </p>
                        {erroBanimento && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroBanimento}</div>}
                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <button type="button" disabled={banindo} onClick={() => setConfirmando(false)} className="rounded-xl border border-neutral-200 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50">Não, cancelar</button>
                            <button type="button" disabled={banindo} onClick={() => void confirmarBanimento()} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
                                {banindo ? <><LoaderCircle size={17} className="animate-spin" /> Banindo...</> : "Sim, banir"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default function GerenciarUsuariosPage() {
    const router = useRouter();
    const [carregandoInicial, setCarregandoInicial] = useState(true);
    const [dados, setDados] = useState<UsuariosPorStatusResponse | null>(null);
    const [erroGeral, setErroGeral] = useState("");
    const [paginas, setPaginas] = useState<Paginas>(PAGINAS_INICIAIS);
    const [carregandoTabelas, setCarregandoTabelas] = useState<Carregamentos>(NENHUMA_TABELA_CARREGANDO);
    const [selecionado, setSelecionado] = useState<UsuarioResponse | null>(null);
    const [aviso, setAviso] = useState("");

    const [nomeBusca, setNomeBusca] = useState("");
    const [filtroAplicado, setFiltroAplicado] = useState("");
    const [resultadoFiltro, setResultadoFiltro] = useState<PageResponse<UsuarioResponse> | null>(null);
    const [carregandoFiltro, setCarregandoFiltro] = useState(false);
    const [erroFiltro, setErroFiltro] = useState("");

    // Sequências impedem que respostas atrasadas sobrescrevam dados mais recentes.
    const idRequisicao = useRef<Record<ChaveTabela, number>>({
        usuarios_ativos: 0,
        usuarios_banidos: 0,
        usuarios_desativados: 0,
    });
    const idBusca = useRef(0);

    useEffect(() => {
        let ativo = true;

        async function iniciar() {
            try {
                const resposta = await getIndexUsuarios();
                if (!ativo) return;
                setDados(resposta);
                setPaginas({
                    usuarios_ativos: resposta.usuarios_ativos.number,
                    usuarios_banidos: resposta.usuarios_banidos.number,
                    usuarios_desativados: resposta.usuarios_desativados.number,
                });
            } catch (error) {
                if (ativo) setErroGeral(error instanceof Error ? error.message : "Erro ao carregar usuários.");
            } finally {
                if (ativo) setCarregandoInicial(false);
            }
        }

        void iniciar();
        return () => { ativo = false; };
    }, []);

    useEffect(() => {
        if (!aviso) return;
        const id = window.setTimeout(() => setAviso(""), 2000);
        return () => window.clearTimeout(id);
    }, [aviso]);


    async function mudarPagina(chave: ChaveTabela, novaPagina: number) {
        if (!dados || novaPagina < 0 || novaPagina >= dados[chave].totalPages || carregandoTabelas[chave]) return;

        const requisicao = ++idRequisicao.current[chave];
        setErroGeral("");
        setCarregandoTabelas((anterior) => ({ ...anterior, [chave]: true }));

        try {
            const parametros: IndexUsuariosParams =
                chave === "usuarios_ativos"
                    ? { paginaAtivos: novaPagina }
                    : chave === "usuarios_banidos"
                        ? { paginaBanidos: novaPagina }
                        : { paginaDesativados: novaPagina };
            const resposta = await getIndexUsuarios(parametros);
            if (requisicao !== idRequisicao.current[chave]) return;

            // Atualiza SOMENTE o grupo solicitado.
            setDados((anterior) => anterior ? { ...anterior, [chave]: resposta[chave] } : resposta);
            setPaginas((anterior) => ({ ...anterior, [chave]: resposta[chave].number }));
        } catch (error) {
            if (requisicao === idRequisicao.current[chave]) {
                setErroGeral(error instanceof Error ? error.message : "Não foi possível mudar de página.");
            }
        } finally {
            if (requisicao === idRequisicao.current[chave]) {
                setCarregandoTabelas((anterior) => ({ ...anterior, [chave]: false }));
            }
        }
    }

    async function atualizarTodasAsTabelas() {
        const requisicoes = {
            usuarios_ativos: ++idRequisicao.current.usuarios_ativos,
            usuarios_banidos: ++idRequisicao.current.usuarios_banidos,
            usuarios_desativados: ++idRequisicao.current.usuarios_desativados,
        };
        setCarregandoTabelas({ usuarios_ativos: true, usuarios_banidos: true, usuarios_desativados: true });
        setErroGeral("");

        try {
            const params: IndexUsuariosParams = {
                paginaAtivos: paginas.usuarios_ativos,
                paginaBanidos: paginas.usuarios_banidos,
                paginaDesativados: paginas.usuarios_desativados,
            };
            let resposta = await getIndexUsuarios(params);

            const paginasCorrigidas: Paginas = {
                usuarios_ativos: Math.min(paginas.usuarios_ativos, Math.max(0, resposta.usuarios_ativos.totalPages - 1)),
                usuarios_banidos: Math.min(paginas.usuarios_banidos, Math.max(0, resposta.usuarios_banidos.totalPages - 1)),
                usuarios_desativados: Math.min(paginas.usuarios_desativados, Math.max(0, resposta.usuarios_desativados.totalPages - 1)),
            };
            if (
                paginasCorrigidas.usuarios_ativos !== paginas.usuarios_ativos ||
                paginasCorrigidas.usuarios_banidos !== paginas.usuarios_banidos ||
                paginasCorrigidas.usuarios_desativados !== paginas.usuarios_desativados
            ) {
                resposta = await getIndexUsuarios({
                    paginaAtivos: paginasCorrigidas.usuarios_ativos,
                    paginaBanidos: paginasCorrigidas.usuarios_banidos,
                    paginaDesativados: paginasCorrigidas.usuarios_desativados,
                });
            }

            if (
                requisicoes.usuarios_ativos !== idRequisicao.current.usuarios_ativos ||
                requisicoes.usuarios_banidos !== idRequisicao.current.usuarios_banidos ||
                requisicoes.usuarios_desativados !== idRequisicao.current.usuarios_desativados
            ) return;

            setDados(resposta);
            setPaginas({
                usuarios_ativos: resposta.usuarios_ativos.number,
                usuarios_banidos: resposta.usuarios_banidos.number,
                usuarios_desativados: resposta.usuarios_desativados.number,
            });
        } catch (error) {
            setErroGeral(error instanceof Error ? error.message : "Erro ao atualizar a lista de usuários.");
        } finally {
            setCarregandoTabelas({ usuarios_ativos: false, usuarios_banidos: false, usuarios_desativados: false });
        }
    }

    async function buscarNome(nome: string, pagina = 0) {
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) {
            limparBusca();
            return;
        }
        const requisicao = ++idBusca.current;
        setFiltroAplicado(nomeLimpo);
        setCarregandoFiltro(true);
        setErroFiltro("");
        try {
            const resposta = await filtraUsuariosPorNome(nomeLimpo, pagina);
            if (requisicao === idBusca.current) setResultadoFiltro(resposta);
        } catch (error) {
            if (requisicao === idBusca.current) {
                setErroFiltro(error instanceof Error ? error.message : "Erro ao pesquisar usuários.");
            }
        } finally {
            if (requisicao === idBusca.current) setCarregandoFiltro(false);
        }
    }

    function limparBusca() {
        idBusca.current += 1;
        setNomeBusca("");
        setFiltroAplicado("");
        setResultadoFiltro(null);
        setErroFiltro("");
        setCarregandoFiltro(false);
    }

    function enviarBusca(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void buscarNome(nomeBusca, 0);
    }

    async function depoisDeBanir() {
        setSelecionado(null);
        setAviso("Usuário banido com sucesso");
        await Promise.all([
            atualizarTodasAsTabelas(),
            filtroAplicado ? buscarNome(filtroAplicado, resultadoFiltro?.number ?? 0) : Promise.resolve(),
        ]);
    }

    return (
        <main className="min-h-[calc(100vh-5rem)] bg-[#F6F6F2] px-4 py-9 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-7xl">
                <button type="button" onClick={() => router.push("/admin")} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-950">
                    <ArrowLeft size={18} /> Voltar ao painel
                </button>

                <header className="mb-8 flex flex-wrap items-center gap-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-neutral-950 shadow-sm"><UsersRound size={30} /></span>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950">Gerenciar usuários</h1>
                        <p className="mt-2 text-sm text-neutral-500">Consulte usuários por status e administre o acesso às contas.</p>
                    </div>
                </header>

                {erroGeral && (
                    <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        <AlertCircle size={19} className="shrink-0" />
                        <span className="flex-1">{erroGeral}</span>
                        {dados && <button type="button" onClick={() => void atualizarTodasAsTabelas()} className="font-bold underline">Tentar novamente</button>}
                    </div>
                )}

                {carregandoInicial ? (
                    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-3 text-neutral-500">
                        <LoaderCircle size={35} className="animate-spin text-yellow-600" />
                        <p>Carregando usuários...</p>
                    </div>
                ) : !dados ? (
                    <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center text-neutral-500">
                        Não foi possível exibir a lista de usuários.
                    </div>
                ) : (
                    <>
                        <section className="mb-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Search size={20} className="text-yellow-600" />
                                <h2 className="text-lg font-bold text-neutral-900">Buscar usuário por nome</h2>
                            </div>
                            <form onSubmit={enviarBusca} className="flex flex-col gap-3 sm:flex-row">
                                <label htmlFor="buscar-usuario" className="sr-only">Nome do usuário</label>
                                <input
                                    id="buscar-usuario"
                                    type="search"
                                    placeholder="Digite o início do nome..."
                                    value={nomeBusca}
                                    onChange={(event) => setNomeBusca(event.target.value)}
                                    maxLength={255}
                                    className="w-full flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                                />
                                <button type="submit" disabled={carregandoFiltro} className="rounded-xl bg-yellow-400 px-7 py-3 text-sm font-bold text-neutral-950 hover:bg-yellow-300 disabled:opacity-60">
                                    {carregandoFiltro ? "Buscando..." : "Buscar"}
                                </button>
                                {filtroAplicado && <button type="button" onClick={limparBusca} className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">Limpar</button>}
                            </form>
                            {erroFiltro && <p role="alert" className="mt-3 text-sm text-red-600">{erroFiltro}</p>}
                        </section>

                        {filtroAplicado && resultadoFiltro && (
                            <div className="mb-8">
                                <TabelaUsuarios
                                    titulo={`Resultados para “${filtroAplicado}”`}
                                    descricao=""
                                    indicador="bg-yellow-400 text-yellow-800"
                                    pagina={resultadoFiltro}
                                    carregando={carregandoFiltro}
                                    onAbrir={setSelecionado}
                                    onMudarPagina={(pagina) => void buscarNome(filtroAplicado, pagina)}
                                />
                            </div>
                        )}

                        <div className="space-y-7">
                            {SECOES.map((secao) => (
                                <TabelaUsuarios
                                    key={secao.chave}
                                    titulo={secao.titulo}
                                    descricao={secao.descricao}
                                    indicador={secao.indicador}
                                    pagina={dados[secao.chave]}
                                    carregando={carregandoTabelas[secao.chave]}
                                    onAbrir={setSelecionado}
                                    onMudarPagina={(pagina) => void mudarPagina(secao.chave, pagina)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {selecionado && (
                <ModalUsuario
                    key={selecionado.cpf}
                    usuario={selecionado}
                    onFechar={() => setSelecionado(null)}
                    onBanido={depoisDeBanir}
                />
            )}

            {aviso && (
                <div role="status" aria-live="polite" className="fixed bottom-6 right-4 z-[150] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-semibold text-emerald-800 shadow-xl sm:right-6">
                    <CheckCircle2 size={23} className="shrink-0 text-emerald-600" />
                    {aviso}
                </div>
            )}
        </main>
    );
}
