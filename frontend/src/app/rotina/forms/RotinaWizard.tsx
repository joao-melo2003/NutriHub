"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import {
  submitRotinaForms1,
  submitRotinaForms2,
  submitRotinaForms3,
  submitRotinaForms4,
  submitRotinaForms5,
  finalizaRotina,
} from "@/services/rotinaService";
import type {
  RotinaForms1Request,
  RotinaForms2Request,
  RotinaForms3Request,
  RotinaForms4Request,
  RotinaForms5Request,
} from "@/types/padroes_rotina";
import Formulario1, { type DadosFormulario1, prioridadesMuscularesValidas } from "./Formulario1";
import Formulario2, { type DadosFormulario2 } from "./Formulario2";
import Formulario3, { DADOS_SONO_INICIAIS, type DadosFormulario3 } from "./Formulario3";
import Formulario4 from "./Formulario4";
import Formulario5 from "./Formulario5";
import { completarHora, DIAS_SEMANA, textoErro } from "./formUtils";

type Passo = 1 | 2 | 3 | 4 | 5;

const TITULOS = ["Objetivos", "Treinos", "Sono", "Restrições", "Alimentos"] as const;

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onConcluido: () => Promise<void> | void;
}

export default function RotinaWizard({ aberto, onFechar, onConcluido }: Props) {
  const [passo, setPasso] = useState<Passo>(1);
  const [salvos, setSalvos] = useState<boolean[]>([false, false, false, false, false]);
  const [idRotina, setIdRotina] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);
  const travaEnvio = useRef(false);

  const [form1, setForm1] = useState<DadosFormulario1>({
    objetivo: "",
    altura: 0,
    peso: 0,
    divisao: "",
    distribuicao: "",
  });
  const [form2, setForm2] = useState<DadosFormulario2>({ dias: [], inicio: "08:00", fim: "09:30" });
  const [form3, setForm3] = useState<DadosFormulario3>(DADOS_SONO_INICIAIS);
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [alimentos, setAlimentos] = useState<string[]>([]);

  const etapaBloqueada = salvos[passo - 1] || enviando;
  const proximaLiberada = salvos.findIndex((salvo) => !salvo) + 1;
  const maximoAcessivel = proximaLiberada === 0 ? 5 : proximaLiberada;

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    function aoPressionarTecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !travaEnvio.current) onFechar();
    }
    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto, onFechar]);

  function navegarPara(etapa: Passo) {
    if (enviando || carregandoCatalogo || etapa > maximoAcessivel) return;
    setErro("");
    setPasso(etapa);
  }

  function validarPasso(): string | null {
    if (passo === 1) {
      if (!form1.objetivo || !form1.divisao || !form1.distribuicao) return "Escolha objetivo, divisão e distribuição.";
      if (!Number.isFinite(form1.altura) || form1.altura <= 0) return "Informe uma altura válida em metros.";
      if (!Number.isFinite(form1.peso) || form1.peso <= 0) return "Informe um peso válido em quilogramas.";
      if (form1.distribuicao === "PRIORIDADE" && !prioridadesMuscularesValidas(form1.preferenciasMusculares)) {
        return "Defina prioridades diferentes para superiores, abdominal e inferiores: alta (1), média (2) e baixa (3).";
      }
    }
    if (passo === 2) {
      if (form2.dias.length === 0) return "Selecione pelo menos um dia de treino.";
      if (!form2.inicio || !form2.fim) return "Informe os horários de início e término do treino.";
    }
    if (passo === 3) {
      if (form3.iguais === null) return "Informe se seus horários de sono são iguais todos os dias.";
      const valores = form3.iguais ? [form3.mesmoHorario] : DIAS_SEMANA.map((dia) => form3.dias[dia.value]);
      if (valores.some((item) => !item.dormir || !item.acordar)) return "Preencha os horários de dormir e acordar de todos os dias necessários.";
    }
    if (passo === 5 && alimentos.length < 5) return "Selecione pelo menos cinco alimentos antes de finalizar.";
    return null;
  }

  async function salvarPasso() {
    if (travaEnvio.current || carregandoCatalogo || concluido) return;

    if (salvos[passo - 1]) {
      if (passo < 5) navegarPara((passo + 1) as Passo);
      else await finalizar();
      return;
    }

    const validacao = validarPasso();
    if (validacao) { setErro(validacao); return; }

    travaEnvio.current = true;
    setEnviando(true);
    setErro("");
    try {
      if (passo === 1) {
        const payloadBase: RotinaForms1Request = {
          objetivo: form1.objetivo,
          altura: form1.altura,
          peso: form1.peso,
          divisao: form1.divisao,
          distribuicao: form1.distribuicao,
        };

        let payload: RotinaForms1Request = payloadBase;
        if (form1.distribuicao === "PRIORIDADE") {
          if (!prioridadesMuscularesValidas(form1.preferenciasMusculares)) {
            throw new Error("Selecione alta, média e baixa sem repetir prioridades.");
          }
          const comPrioridades = { ...payloadBase, preferenciasMusculares: form1.preferenciasMusculares };
          payload = comPrioridades;
        }

        const resultado = await submitRotinaForms1(payload);
        if (!resultado?.idRotina) throw new Error("O backend não retornou o idRotina no primeiro formulário.");
        setIdRotina(resultado.idRotina);
      } else {
        if (!idRotina) throw new Error("ID da rotina indisponível. Volte ao primeiro formulário.");
        if (passo === 2) {
          const payload: RotinaForms2Request = {
            idRotina,
            diaSemanas: form2.dias,
            horarioInicio: completarHora(form2.inicio),
            horarioFim: completarHora(form2.fim),
          };
          await submitRotinaForms2(payload);
        } else if (passo === 3) {
          const payload: RotinaForms3Request = {
            idRotina,
            horariosIguais: form3.iguais === true,
            horarios: form3.iguais === true
              ? [{ diaSemana: null, horarioDormir: completarHora(form3.mesmoHorario.dormir), horarioAcordar: completarHora(form3.mesmoHorario.acordar) }]
              : DIAS_SEMANA.map((dia) => ({
                diaSemana: dia.value,
                horarioDormir: completarHora(form3.dias[dia.value].dormir),
                horarioAcordar: completarHora(form3.dias[dia.value].acordar),
              })),
          };
          await submitRotinaForms3(payload);
        } else if (passo === 4) {
          const payload: RotinaForms4Request = { restricoes };
          await submitRotinaForms4(payload);
        } else if (passo === 5) {
          const payload: RotinaForms5Request = { alimentos };
          await submitRotinaForms5(payload);
        }
      }

      setSalvos((anterior) => anterior.map((salvo, indice) => indice === passo - 1 ? true : salvo));
      if (passo < 5) {
        setPasso((passo + 1) as Passo);
      }

    } catch (error) {
      setErro(textoErro(error, "Não foi possível salvar esta etapa."));
      return;
    } finally {
      travaEnvio.current = false;
      setEnviando(false);
    }

    if (passo === 5) await finalizar();
  }

  async function finalizar() {
    if (travaEnvio.current || concluido) return;
    travaEnvio.current = true;
    setEnviando(true);
    setErro("");
    try {
      await finalizaRotina();
      setConcluido(true);
      await onConcluido();
    } catch (error) {
      setErro(textoErro(error, "Falha ao finalizar a rotina. Você pode tentar novamente sem reenviar os formulários."));
    } finally {
      travaEnvio.current = false;
      setEnviando(false);
    }
  }

  return (
    <div
      style={{ display: aberto ? "flex" : "none" }}
      className="fixed inset-0 z-[100] items-center justify-center bg-black/60 px-3 py-6 backdrop-blur-sm sm:px-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget && !travaEnvio.current) onFechar(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="wizard-titulo" className="flex max-h-[93vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="h-2 shrink-0 bg-yellow-400" />
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">NutriHub · Minha rotina</p>
            <h2 id="wizard-titulo" className="mt-1 text-xl font-extrabold text-neutral-950 sm:text-2xl">Criar minha rotina</h2>
            <p className="mt-1 text-xs text-neutral-500">Etapa {passo} de 5 — {TITULOS[passo - 1]}</p>
          </div>
          <button type="button" disabled={enviando} onClick={onFechar} aria-label="Fechar formulários" className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"><X size={22} /></button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-neutral-100 px-5 py-4 sm:px-8">
          {TITULOS.map((titulo, indice) => {
            const numero = (indice + 1) as Passo;
            const selecionado = numero === passo;
            const salvo = salvos[indice];
            return (
              <button type="button" key={titulo} disabled={numero > maximoAcessivel || enviando || carregandoCatalogo} onClick={() => navegarPara(numero)}
                className={`flex min-w-[110px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selecionado ? "bg-yellow-400 text-neutral-950" : salvo ? "bg-yellow-50 text-yellow-900" : "bg-neutral-100 text-neutral-500"}`}>
                {salvo ? <CheckCircle2 size={15} /> : <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current">{numero}</span>}
                {titulo}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {salvos[passo - 1] && (
            <p className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
              Esta etapa já foi enviada ao backend. Ela está em modo de leitura para evitar criar registros duplicados. A edição será habilitada quando conectarmos as rotas de atualização.
            </p>
          )}
          {passo === 1 && <Formulario1 dados={form1} onChange={setForm1} bloqueado={etapaBloqueada} />}
          {passo === 2 && <Formulario2 dados={form2} onChange={setForm2} bloqueado={etapaBloqueada} />}
          {passo === 3 && <Formulario3 dados={form3} onChange={setForm3} bloqueado={etapaBloqueada} />}
          {passo === 4 && <Formulario4 selecionadas={restricoes} onChange={setRestricoes} bloqueado={etapaBloqueada} />}
          {passo === 5 && <Formulario5 selecionados={alimentos} onChange={setAlimentos} bloqueado={etapaBloqueada} onBusyChange={setCarregandoCatalogo} />}
          {erro && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-neutral-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <button type="button" onClick={() => navegarPara((passo - 1) as Passo)} disabled={passo === 1 || enviando || carregandoCatalogo}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronLeft size={18} /> Voltar
          </button>
          <button type="button" onClick={() => void salvarPasso()} disabled={enviando || carregandoCatalogo || concluido}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-neutral-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50">
            {enviando ? <><LoaderCircle size={17} className="animate-spin" /> Salvando...</> : passo === 5 ? <>{salvos[4] ? "Tentar finalizar" : "Salvar e finalizar rotina"} <CheckCircle2 size={18} /></> : <>{salvos[passo - 1] ? "Próxima etapa" : "Salvar e continuar"} <ChevronRight size={18} /></>}
          </button>
        </footer>
      </section>
    </div>
  );
}
