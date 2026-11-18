"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, ClipboardList, LoaderCircle, Pencil, Plus, RefreshCw, Trash2} from "lucide-react";
import { deletarRotinaUsuario, verificarRotinaUsuario } from "@/services/rotinaService";
import type { RotinaCompleta } from "@/types/padroes_rotina";
import RotinaWizard from "./forms/RotinaWizard";
import RotinaEditarWizard from "./forms/RotinaEditarWizard";
import VisualizacaoRotina from "./VisualizacaoRotina";

type VerificarResultado = Awaited<ReturnType<typeof verificarRotinaUsuario>>;
type Estado = "carregando" | "ok" | "sem-rotina" | "corrompida" | "erro";

export default function RotinaPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("carregando");
  const [rotina, setRotina] = useState<RotinaCompleta | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [modalCorrompida, setModalCorrompida] = useState(false);
  const [modo, setModo] = useState<"criar" | "editar" | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");
  const consultaInicial = useRef<Promise<VerificarResultado> | null>(null);

  const aplicar = useCallback((resultado: VerificarResultado) => {
    if (resultado.status === "OK") {
      // O backend devolve idRotina (e não apenas id), além dos arrays da agenda.
      setRotina(resultado.rotina as unknown as RotinaCompleta);
      setEstado("ok");
      setModalCorrompida(false);
      setMensagem("");
    } else {
      setRotina(null);
      setMensagem(resultado.message);
      if (resultado.status === "SEM_ROTINA") {
        setEstado("sem-rotina");
        setModalCorrompida(false);
      } else {
        setEstado("corrompida");
        setModalCorrompida(true);
      }
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    if (!consultaInicial.current) consultaInicial.current = verificarRotinaUsuario();
    consultaInicial.current
      .then(r => { if (ativo) aplicar(r); })
      .catch(e => {
        if (ativo) {
          setMensagem(e instanceof Error ? e.message : "Erro ao consultar rotina.");
          setEstado("erro");
        }
      });
    return () => { ativo = false; };
  }, [aplicar]);


  const recarregar = useCallback(async (exibirCarregamento = true) => {
    if (exibirCarregamento) setEstado("carregando");
    try {
      aplicar(await verificarRotinaUsuario());
    } catch (e) {
      if (exibirCarregamento) {
        setMensagem(e instanceof Error ? e.message : "Erro ao consultar rotina.");
        setEstado("erro");
      }
    }
  }, [aplicar]);

  async function excluirRotina() {
    if (excluindo) return;
    setExcluindo(true);
    setErroExclusao("");
    try {
      await deletarRotinaUsuario(true);
      setConfirmarExclusao(false);
      await recarregar();
    } catch (e) {
      setErroExclusao(e instanceof Error ? e.message : "Não foi possível excluir a rotina.");
    } finally {
      setExcluindo(false);
    }
  }

  useEffect(() => {
    function tecla(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (modalCorrompida) setModalCorrompida(false);
      if (confirmarExclusao && !excluindo) setConfirmarExclusao(false);
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [modalCorrompida, confirmarExclusao, excluindo]);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#F6F6F2] px-4 py-9 sm:px-6">
      <style>{`@keyframes popIn { from { opacity: 0; transform: scale(.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-yellow-400/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 shadow-sm">
              <ClipboardList size={28} className="text-neutral-950" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-950 sm:text-3xl">Minha rotina</h1>
              <p className="mt-1 text-sm text-neutral-500">Seu planejamento semanal de sono, treino e alimentação.</p>
            </div>
          </div>
          {estado === "ok" && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setModo("editar")}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-neutral-950 hover:bg-yellow-300">
                <Pencil size={17}/> Editar rotina
              </button>
              <button type="button" onClick={() => { setErroExclusao(""); setConfirmarExclusao(true); }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100">
                <Trash2 size={17}/> Excluir rotina
              </button>
            </div>
          )}
        </header>

        {estado === "carregando" && (
          <section role="status" className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-sm">
            <LoaderCircle size={42} className="animate-spin text-yellow-500" />
            <p className="mt-4 font-bold text-neutral-800">Carregando sua rotina...</p>
          </section>
        )}

        {estado === "sem-rotina" && (
          <button type="button" onClick={() => setModo("criar")}
            className="group flex min-h-72 w-full flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-yellow-300 bg-white px-6 py-12 text-center shadow-sm transition hover:-translate-y-1 hover:border-yellow-400 hover:shadow-lg">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 transition-transform group-hover:scale-110">
              <Plus size={38} className="text-neutral-950" />
            </span>
            <span className="text-2xl font-extrabold text-neutral-950">Crie sua rotina de treino</span>
            <span className="max-w-md text-sm text-neutral-500">Configure seus objetivos, horários, restrições e alimentos em cinco etapas.</span>
            <span className="flex items-center gap-2 text-sm font-bold text-yellow-700">Começar agora <ArrowRight size={17}/></span>
          </button>
        )}

        {estado === "ok" && rotina && <VisualizacaoRotina rotina={rotina} />}

        {estado === "corrompida" && (
          <section className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm">
            <AlertTriangle size={38} className="text-amber-600" />
            <h2 className="mt-4 text-xl font-bold text-neutral-900">Não foi possível exibir sua rotina</h2>
            <p className="mt-2 max-w-lg text-sm text-neutral-500">{mensagem}</p>
          </section>
        )}
        {estado === "erro" && (
          <section className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm">
            <AlertTriangle size={38} className="text-red-500" />
            <h2 className="mt-4 text-xl font-bold">Erro ao carregar a rotina</h2>
            <p role="alert" className="mt-2 text-sm text-neutral-600">{mensagem}</p>
            <button type="button" onClick={() => void recarregar()} className="mt-6 flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold hover:bg-yellow-300"><RefreshCw size={16}/> Tentar novamente</button>
          </section>
        )}
      </div>

      {modalCorrompida && estado === "corrompida" && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
          onMouseDown={e => { if (e.target === e.currentTarget) setModalCorrompida(false); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="titulo-corrompida"
            className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl animate-[popIn_.22s_ease-out]">
            <AlertTriangle size={42} className="mx-auto text-amber-600" />
            <h2 id="titulo-corrompida" className="mt-5 text-xl font-extrabold text-neutral-900">Problema com sua rotina</h2>
            <p className="mt-3 text-sm text-neutral-600">{mensagem}</p>
            <button type="button" autoFocus onClick={() => setModalCorrompida(false)}
              className="mt-7 w-full rounded-xl bg-yellow-400 px-5 py-3 font-bold text-neutral-900 hover:bg-yellow-300">OK</button>
          </section>
        </div>
      )}

      {confirmarExclusao && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
          onMouseDown={e => { if (e.target === e.currentTarget && !excluindo) setConfirmarExclusao(false); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="titulo-excluir"
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-[popIn_.22s_ease-out]">
            <div className="h-2 bg-red-500" />
            <div className="p-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><Trash2 size={32} className="text-red-600"/></div>
              <h2 id="titulo-excluir" className="mt-5 text-xl font-extrabold text-neutral-950">Excluir sua rotina?</h2>
              <p className="mt-3 text-sm text-neutral-600">Esta ação excluirá os dados da rotina. Deseja realmente continuar?</p>
              {erroExclusao && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{erroExclusao}</p>}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button type="button" disabled={excluindo} onClick={() => setConfirmarExclusao(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">Não, cancelar</button>
                <button type="button" disabled={excluindo} onClick={() => void excluirRotina()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                  {excluindo && <LoaderCircle size={16} className="animate-spin"/>}{excluindo ? "Excluindo..." : "Sim, excluir"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <RotinaWizard
        aberto={modo === "criar"}
        onFechar={() => setModo(null)}
        onConcluido={async () => {
          setModo(null);
          await recarregar();
          router.push("/rotina");
        }}
      />

      {modo === "editar" && (
        <RotinaEditarWizard
          onFechar={() => setModo(null)}
          onAtualizado={() => recarregar(false)}
        />
      )}
    </main>
  );
}
