"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    Save,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import {
    deleteConta,
    getUsuarioInfos,
    updateSenha,
    updateUsuario,
} from "@/services/usuarioService";

type UsuarioResponse = Awaited<ReturnType<typeof getUsuarioInfos>>;
type UpdateUsuarioPayload = Parameters<typeof updateUsuario>[0];
type Modal = "senha" | "confirmar-exclusao" | "senha-exclusao" | null;

const campoEditavel =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 disabled:opacity-60";
const campoBloqueado =
    "w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed";

function CampoBloqueado({ label, valor }: { label: string; valor: string }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-neutral-600">
                {label}
            </label>
            <input type="text" value={valor} disabled aria-label={label} className={campoBloqueado} />
        </div>
    );
}

function formatarCpf(cpf: string) {
    return cpf.replace(/\D/g, "").replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function formatarData(data: string) {
    const partes = data.split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

export default function EditarPerfilPage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [salvandoDados, setSalvandoDados] = useState(false);
    const [erroDados, setErroDados] = useState("");
    const [sucessoDados, setSucessoDados] = useState("");

    const [modal, setModal] = useState<Modal>(null);
    const [senhaAntiga, setSenhaAntiga] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [novaSenhaConfirm, setNovaSenhaConfirm] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [salvandoSenha, setSalvandoSenha] = useState(false);
    const [erroSenha, setErroSenha] = useState("");
    const [sucessoSenha, setSucessoSenha] = useState("");

    const [senhaExclusao, setSenhaExclusao] = useState("");
    const [mostrarSenhaExclusao, setMostrarSenhaExclusao] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erroExclusao, setErroExclusao] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            try {
                // Busca os dados do usuário autenticado. Se sua API exigir
                // infoUser, passe aqui o valor aceito pelo backend.
                const dados = await getUsuarioInfos();
                if (!ativo) return;
                setUsuario(dados);
                setNome(dados.nome);
                setEmail(dados.email);
            } catch (error) {
                if (ativo) {
                    setErroCarregamento(error instanceof Error ? error.message : "Não foi possível carregar o perfil.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarDados();
        return () => { ativo = false; };
    }, []);

    useEffect(() => {
        if (!modal) return;
        function aoPressionarTecla(event: KeyboardEvent) {
            if (event.key === "Escape" && !salvandoSenha && !excluindo) {
                setModal(null);
                setSenhaAntiga("");
                setNovaSenha("");
                setNovaSenhaConfirm("");
                setSenhaExclusao("");
                setErroSenha("");
                setErroExclusao("");
            }
        }
        document.addEventListener("keydown", aoPressionarTecla);
        return () => document.removeEventListener("keydown", aoPressionarTecla);
    }, [modal, salvandoSenha, excluindo]);

    function fecharModal() {
        if (salvandoSenha || excluindo) return;
        setModal(null);
        setSenhaAntiga("");
        setNovaSenha("");
        setNovaSenhaConfirm("");
        setMostrarSenha(false);
        setSenhaExclusao("");
        setMostrarSenhaExclusao(false);
        setErroSenha("");
        setErroExclusao("");
    }

    async function handleAtualizarDados(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!usuario || salvandoDados) return;
        setErroDados("");
        setSucessoDados("");

        const novoNome = nome.trim();
        const novoEmail = email.trim();
        if (novoNome.length < 4) {
            setErroDados("O nome precisa ter pelo menos 4 caracteres.");
            return;
        }

        const alteracoes: UpdateUsuarioPayload = {};
        if (novoNome !== usuario.nome) alteracoes.nome = novoNome;
        if (novoEmail !== usuario.email) alteracoes.email = novoEmail;

        if (Object.keys(alteracoes).length === 0) {
            setErroDados("Altere o nome ou o e-mail antes de enviar.");
            return;
        }

        setSalvandoDados(true);
        try {
            const resposta = await updateUsuario(alteracoes);
            setUsuario((anterior) => anterior ? {
                ...anterior,
                nome: alteracoes.nome !== undefined ? (resposta.nome ?? novoNome) : anterior.nome,
                email: alteracoes.email !== undefined ? (resposta.email ?? novoEmail) : anterior.email,
            } : anterior);
            setNome(alteracoes.nome !== undefined ? (resposta.nome ?? novoNome) : usuario.nome);
            setEmail(alteracoes.email !== undefined ? (resposta.email ?? novoEmail) : usuario.email);
            setSucessoDados("Dados atualizados com sucesso!");
        } catch (error) {
            setErroDados(error instanceof Error ? error.message : "Erro ao atualizar seus dados.");
        } finally {
            setSalvandoDados(false);
        }
    }

    async function handleAtualizarSenha(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (salvandoSenha) return;
        setErroSenha("");

        if (novaSenha !== novaSenhaConfirm) {
            setErroSenha("A confirmação deve ser igual à nova senha.");
            return;
        }
        if (
            novaSenha.length < 8 ||
            !/[A-Z]/.test(novaSenha) ||
            !/[0-9]/.test(novaSenha) ||
            !/[^A-Za-z0-9]/.test(novaSenha)
        ) {
            setErroSenha("A nova senha deve ter pelo menos 8 caracteres, uma maiúscula, um número e um símbolo.");
            return;
        }

        setSalvandoSenha(true);
        try {
            await updateSenha({ senhaAntiga, senha: novaSenha, senhaConfirm: novaSenhaConfirm });
            setModal(null);
            setSenhaAntiga("");
            setNovaSenha("");
            setNovaSenhaConfirm("");
            setMostrarSenha(false);
            setErroSenha("");
            setSucessoSenha("Senha alterada com sucesso!");
            try {
                const dados = await getUsuarioInfos();
                setUsuario(dados);
            } catch {
            }
        } catch (error) {
            setErroSenha(error instanceof Error ? error.message : "Não foi possível alterar a senha.");
        } finally {
            setSalvandoSenha(false);
        }
    }

    async function handleExcluirConta(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (excluindo || !senhaExclusao) return;
        setErroExclusao("");
        setExcluindo(true);
        try {
            await deleteConta({ confirm: true, senha: senhaExclusao });
            setModal(null);
            router.replace("/login");
            router.refresh();
        } catch (error) {
            setErroExclusao(error instanceof Error ? error.message : "Não foi possível excluir a conta.");
        } finally {
            setExcluindo(false);
        }
    }

    if (carregando) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#F6F6F2]">
                <div className="flex flex-col items-center gap-3 text-neutral-600">
                    <LoaderCircle className="h-9 w-9 animate-spin text-yellow-500" />
                    <p>Carregando informações do perfil...</p>
                </div>
            </main>
        );
    }

    if (!usuario) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#F6F6F2] px-4">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-600" />
                    <h1 className="text-xl font-bold text-neutral-900">Não foi possível carregar o perfil</h1>
                    <p role="alert" className="mt-3 text-sm text-red-600">{erroCarregamento}</p>
                    <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-neutral-950 hover:bg-yellow-300">Tentar novamente</button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F6F6F2] px-4 py-10 sm:py-14">
            <div className="mx-auto w-full max-w-4xl">
                <button type="button" onClick={() => router.push("/")} className="mb-6 flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-950">
                    <ArrowLeft size={18} /> Voltar para o início
                </button>

                <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">
                    <div className="h-2 bg-yellow-400" />
                    <div className="p-6 sm:p-10">
                        <div className="mb-8 flex items-center gap-4 border-b border-neutral-100 pb-7">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400">
                                <UserRound className="text-neutral-950" size={30} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-neutral-950">Editar perfil</h1>
                                <p className="mt-1 text-sm text-neutral-500">Gerencie seus dados e a segurança da sua conta NutriHub.</p>
                            </div>
                        </div>

                        <form onSubmit={handleAtualizarDados}>
                            <h2 className="mb-5 text-lg font-bold text-neutral-900">Informações pessoais</h2>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="nome" className="mb-2 block text-sm font-medium text-neutral-800">Nome completo</label>
                                    <input id="nome" type="text" minLength={4} maxLength={255} required autoComplete="name" value={nome} onChange={(event) => setNome(event.target.value)} disabled={salvandoDados} className={campoEditavel} />
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-800">E-mail</label>
                                    <input id="email" type="email" maxLength={255} required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={salvandoDados} className={campoEditavel} />
                                </div>
                                <CampoBloqueado label="CPF" valor={formatarCpf(usuario.cpf)} />
                                <CampoBloqueado label="Data de nascimento" valor={formatarData(usuario.dataNascimento)} />
                                <CampoBloqueado label="Sexo" valor={usuario.sexo === "F" ? "Feminino" : usuario.sexo === "M" ? "Masculino" : usuario.sexo} />
                                <CampoBloqueado label="Tipo de conta" valor={usuario.tipo === "COMUM" ? "Usuário comum" : usuario.tipo === "ADMIN" ? "Administrador" : usuario.tipo} />
                                <CampoBloqueado label="Status" valor={usuario.status === "ATIVO" ? "Ativo" : usuario.status} />
                            </div>

                            {erroDados && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroDados}</p>}
                            {sucessoDados && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-neutral-800"><CheckCircle2 size={18} />{sucessoDados}</p>}

                            <div className="mt-6 flex justify-end">
                                <button type="submit" disabled={salvandoDados} className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                                    {salvandoDados ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                                    {salvandoDados ? "Enviando..." : "Enviar alterações"}
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 border-t border-neutral-100 pt-8">
                            <h2 className="mb-5 text-lg font-bold text-neutral-900">Segurança</h2>
                            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto]">
                                <CampoBloqueado label="Senha" valor={"•".repeat(Math.max(0, usuario.qtSenha || 0))} />
                                <button type="button" onClick={() => { setSucessoSenha(""); setModal("senha"); }} className="flex h-[46px] items-center justify-center gap-2 rounded-xl border border-neutral-300 px-5 text-sm font-semibold text-neutral-800 hover:border-yellow-400 hover:bg-yellow-50">
                                    <KeyRound size={18} /> Editar senha
                                </button>
                            </div>
                            {sucessoSenha && <p role="status" className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-neutral-800">{sucessoSenha}</p>}
                        </div>

                        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50/50 p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-red-700"><AlertTriangle size={20} /> Cuidado</h2>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-600">Ao excluir sua conta, você perderá o acesso ao NutriHub. Esta ação exige confirmação e sua senha atual.</p>
                            <button type="button" onClick={() => { setErroExclusao(""); setModal("confirmar-exclusao"); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 sm:w-auto">
                                <Trash2 size={18} /> Excluir conta
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {modal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(event) => { if (event.target === event.currentTarget) fecharModal(); }}
                >
                    <section role="dialog" aria-modal="true" aria-labelledby="modal-titulo" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
                        <div className="mb-6 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`rounded-xl p-3 ${modal === "senha" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
                                    {modal === "senha" ? <LockKeyhole size={23} /> : <Trash2 size={23} />}
                                </div>
                                <h2 id="modal-titulo" className="text-xl font-bold text-neutral-950">
                                    {modal === "senha" ? "Alterar senha" : "Excluir conta"}
                                </h2>
                            </div>
                            <button type="button" onClick={fecharModal} disabled={salvandoSenha || excluindo} aria-label="Fechar janela" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"><X size={20} /></button>
                        </div>

                        {modal === "senha" && (
                            <form onSubmit={handleAtualizarSenha} className="space-y-4">
                                <p className="text-sm text-neutral-600">Informe sua senha atual e escolha uma nova senha.</p>
                                <div>
                                    <label htmlFor="senha-antiga" className="mb-2 block text-sm font-medium text-neutral-800">Senha atual</label>
                                    <input id="senha-antiga" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" required value={senhaAntiga} onChange={(event) => setSenhaAntiga(event.target.value)} className={campoEditavel} />
                                </div>
                                <div>
                                    <label htmlFor="nova-senha" className="mb-2 block text-sm font-medium text-neutral-800">Nova senha</label>
                                    <input id="nova-senha" type={mostrarSenha ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={255} required value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} className={campoEditavel} />
                                </div>
                                <div>
                                    <label htmlFor="confirmar-senha" className="mb-2 block text-sm font-medium text-neutral-800">Confirmar nova senha</label>
                                    <input id="confirmar-senha" type={mostrarSenha ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={255} required value={novaSenhaConfirm} onChange={(event) => setNovaSenhaConfirm(event.target.value)} className={campoEditavel} />
                                </div>
                                <button type="button" onClick={() => setMostrarSenha((valor) => !valor)} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
                                    {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                                    {mostrarSenha ? "Ocultar senhas" : "Mostrar senhas"}
                                </button>
                                <p className="text-xs leading-relaxed text-neutral-500">A nova senha precisa ter ao menos 8 caracteres, uma letra maiúscula, um número e um símbolo.</p>
                                {erroSenha && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroSenha}</p>}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button type="button" onClick={fecharModal} disabled={salvandoSenha} className="rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50">Cancelar</button>
                                    <button type="submit" disabled={salvandoSenha} className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 text-sm font-bold text-neutral-950 hover:bg-yellow-300 disabled:opacity-50">
                                        {salvandoSenha && <LoaderCircle size={17} className="animate-spin" />}
                                        {salvandoSenha ? "Salvando..." : "Salvar senha"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modal === "confirmar-exclusao" && (
                            <div>
                                <p className="text-sm leading-relaxed text-neutral-600">Tem certeza de que deseja excluir sua conta? Para continuar, confirme e depois informe sua senha atual.</p>
                                <div className="mt-7 grid grid-cols-2 gap-3">
                                    <button type="button" onClick={fecharModal} className="rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">Não, cancelar</button>
                                    <button type="button" onClick={() => setModal("senha-exclusao")} className="rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700">OK, continuar</button>
                                </div>
                            </div>
                        )}

                        {modal === "senha-exclusao" && (
                            <form onSubmit={handleExcluirConta} className="space-y-5">
                                <p className="text-sm leading-relaxed text-neutral-600">Para confirmar a exclusão da conta, digite sua senha atual. Esta ação não pode ser desfeita pelo formulário.</p>
                                <div>
                                    <label htmlFor="senha-exclusao" className="mb-2 block text-sm font-medium text-neutral-800">Senha atual</label>
                                    <div className="relative">
                                        <input id="senha-exclusao" type={mostrarSenhaExclusao ? "text" : "password"} autoComplete="current-password" required value={senhaExclusao} onChange={(event) => setSenhaExclusao(event.target.value)} className={`${campoEditavel} pr-12`} />
                                        <button type="button" onClick={() => setMostrarSenhaExclusao((valor) => !valor)} aria-label={mostrarSenhaExclusao ? "Ocultar senha" : "Mostrar senha"} className="absolute inset-y-0 right-3 flex items-center text-neutral-500">
                                            {mostrarSenhaExclusao ? <EyeOff size={19} /> : <Eye size={19} />}
                                        </button>
                                    </div>
                                </div>
                                {erroExclusao && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erroExclusao}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={fecharModal} disabled={excluindo} className="rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50">Cancelar</button>
                                    <button type="submit" disabled={excluindo || !senhaExclusao} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                                        {excluindo && <LoaderCircle size={17} className="animate-spin" />}
                                        {excluindo ? "Excluindo..." : "Excluir conta"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}
