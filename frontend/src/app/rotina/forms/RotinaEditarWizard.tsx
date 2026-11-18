"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, Save, X } from "lucide-react";
import {
  getRotinaUpdateForms1, getRotinaUpdateForms2, getRotinaUpdateForms3,
  getRotinaUpdateForms4, getRotinaUpdateForms5,
  updateRotinaForms1, updateRotinaForms2, updateRotinaForms3,
  updateRotinaForms4, updateRotinaForms5,
  finalizaRotina,
} from "@/services/rotinaService";
import Formulario1, { type DadosFormulario1, prioridadesMuscularesValidas } from "./Formulario1";
import Formulario2, { type DadosFormulario2 } from "./Formulario2";
import Formulario3, { DADOS_SONO_INICIAIS, type DadosFormulario3, type HorariosDia } from "./Formulario3";
import Formulario4 from "./Formulario4";
import Formulario5 from "./Formulario5";
import { completarHora, DIAS_SEMANA, textoErro, type DiaSelecionavel } from "./formUtils";

type Passo = 1 | 2 | 3 | 4 | 5;
const ETAPAS = ["Objetivos", "Treinos", "Sono", "Restrições", "Alimentos"] as const;

function somenteHora(hora: string | undefined) { return (hora ?? "").slice(0, 5); }

function prioridadesValidasDaAPI(entrada: Record<string, number | undefined> | undefined) {
  const valido = (n: number | undefined): n is 1 | 2 | 3 => n === 1 || n === 2 || n === 3;
  if (!entrada) return undefined;
  return {
    ...(valido(entrada.SUPERIORES) ? { SUPERIORES: entrada.SUPERIORES } : {}),
    ...(valido(entrada.ABDOMINAL) ? { ABDOMINAL: entrada.ABDOMINAL } : {}),
    ...(valido(entrada.INFERIORES) ? { INFERIORES: entrada.INFERIORES } : {}),
  };
}

interface Props {
  onFechar: () => void;
  onAtualizado: () => Promise<void> | void;
}

export default function RotinaEditarWizard({ onFechar, onAtualizado }: Props) {
  const [passo, setPasso] = useState<Passo>(1);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [catalogoOcupado, setCatalogoOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [alterado, setAlterado] = useState(false);
  const [falhaCarregamento, setFalhaCarregamento] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const trava = useRef(false);

  const [form1, setForm1] = useState<DadosFormulario1>({ objetivo: "", peso: 0, altura: 0, divisao: "", distribuicao: "" });
  const [form2, setForm2] = useState<DadosFormulario2>({ dias: [], inicio: "08:00", fim: "09:30" });
  const [form3, setForm3] = useState<DadosFormulario3>(DADOS_SONO_INICIAIS);
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [alimentos, setAlimentos] = useState<string[]>([]);

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; };
  }, []);

  useEffect(() => {
    function tecla(event: KeyboardEvent) {
      if (event.key === "Escape" && !trava.current) onFechar();
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [onFechar]);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setFalhaCarregamento(false);
    setErro("");
    setAviso("");
    setAlterado(false);

    async function carregarEtapa() {
      try {
        if (passo === 1) {
          const r = await getRotinaUpdateForms1();
          if (ativo) setForm1({
            objetivo: r.objetivo, peso: r.peso, altura: r.altura,
            divisao: r.divisao, distribuicao: r.distribuicao,
            preferenciasMusculares: prioridadesValidasDaAPI(r.preferenciasMusculares),
          });
        } else if (passo === 2) {
          const r = await getRotinaUpdateForms2();
          if (ativo) setForm2({
            dias: r.diaSemanas.filter((dia): dia is DiaSelecionavel => DIAS_SEMANA.some(d => d.value === dia)),
            inicio: somenteHora(r.horarioInicio), fim: somenteHora(r.horarioFim),
          });
        } else if (passo === 3) {
          const r = await getRotinaUpdateForms3();
          if (ativo) {
            const dias = Object.fromEntries(DIAS_SEMANA.map(d => [d.value, { ...DADOS_SONO_INICIAIS.dias[d.value] }])) as Record<DiaSelecionavel, HorariosDia>;
            r.horarios.forEach(h => {
              if (h.diaSemana && h.diaSemana in dias) {
                dias[h.diaSemana as DiaSelecionavel] = {
                  dormir: somenteHora(h.horarioDormir),
                  acordar: somenteHora(h.horarioAcordar),
                };
              }
            });
            const padrao = r.horarios[0];
            setForm3({
              iguais: r.horariosIguais,
              mesmoHorario: padrao ? {
                dormir: somenteHora(padrao.horarioDormir), acordar: somenteHora(padrao.horarioAcordar),
              } : { ...DADOS_SONO_INICIAIS.mesmoHorario },
              dias,
            });
          }
        } else if (passo === 4) {
          const r = await getRotinaUpdateForms4();
          if (ativo) setRestricoes(r.restricoes.map(item => String(item.id)));
        } else {
          const r = await getRotinaUpdateForms5();
          if (ativo) setAlimentos(r.alimentos.map(item => String(item.id)));
        }
      } catch (e) {
        if (ativo) {
          setFalhaCarregamento(true);
          setErro(textoErro(e, "Não foi possível carregar os dados desta etapa."));
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregarEtapa();
    return () => { ativo = false; };
  }, [passo, tentativa]);

  function mudarEtapa(destino: Passo) {
    if (destino < 1 || destino > 5 || carregando || salvando || catalogoOcupado) return;
    if (alterado && !window.confirm("Você possui alterações não salvas. Deseja descartá-las e mudar de etapa?")) return;
    setPasso(destino);
  }

  function mudarForm1(d: DadosFormulario1) { setForm1(d); setAlterado(true); }
  function mudarForm2(d: DadosFormulario2) { setForm2(d); setAlterado(true); }
  function mudarForm3(d: DadosFormulario3) { setForm3(d); setAlterado(true); }
  function mudarRestricoes(d: string[]) { setRestricoes(d); setAlterado(true); }
  function mudarAlimentos(d: string[]) { setAlimentos(d); setAlterado(true); }

  function validar() {
    if (passo === 1) {
      if (!form1.objetivo || !form1.divisao || !form1.distribuicao) return "Selecione objetivo, divisão e distribuição.";
      if (form1.altura <= 0 || !Number.isFinite(form1.altura)) return "Informe uma altura válida.";
      if (form1.peso <= 0 || !Number.isFinite(form1.peso)) return "Informe um peso válido.";
      if (form1.distribuicao === "PRIORIDADE" && !prioridadesMuscularesValidas(form1.preferenciasMusculares)) return "Defina alta (1), média (2) e baixa (3) sem repetir prioridades.";
    } else if (passo === 2) {
      if (!form2.dias.length || !form2.inicio || !form2.fim) return "Selecione pelo menos um dia e os dois horários de treino.";
    } else if (passo === 3) {
      if (form3.iguais === null) return "Indique se os horários de sono são iguais todos os dias.";
      const valores = form3.iguais ? [form3.mesmoHorario] : DIAS_SEMANA.map(d => form3.dias[d.value]);
      if (valores.some(v => !v?.dormir || !v?.acordar)) return "Informe os horários de dormir e acordar.";
    } else if (passo === 5 && alimentos.length < 5) {
      return "Selecione pelo menos cinco alimentos.";
    }
    return null;
  }

  async function salvar() {
    if (trava.current || carregando || falhaCarregamento || catalogoOcupado) return;
    const problema = validar();
    if (problema) { setErro(problema); return; }
    trava.current = true;
    setSalvando(true);
    setErro(""); setAviso("");
    let etapaAtualizada = false;
    let rotinaFinalizada = false;
    try {
      if (passo === 1) {
        await updateRotinaForms1({
          objetivo: form1.objetivo, peso: form1.peso, altura: form1.altura,
          divisao: form1.divisao, distribuicao: form1.distribuicao,
          ...(form1.distribuicao === "PRIORIDADE" && prioridadesMuscularesValidas(form1.preferenciasMusculares)
            ? { preferenciasMusculares: form1.preferenciasMusculares } : {}),
        });
      } else if (passo === 2) {
        await updateRotinaForms2({
          diaSemanas: form2.dias,
          horarioInicio: completarHora(form2.inicio),
          horarioFim: completarHora(form2.fim),
        });
      } else if (passo === 3) {
        await updateRotinaForms3({
          horariosIguais: form3.iguais === true,
          horarios: form3.iguais === true
            ? [{ diaSemana: null, horarioDormir: completarHora(form3.mesmoHorario.dormir), horarioAcordar: completarHora(form3.mesmoHorario.acordar) }]
            : DIAS_SEMANA.map(d => ({
              diaSemana: d.value,
              horarioDormir: completarHora(form3.dias[d.value].dormir),
              horarioAcordar: completarHora(form3.dias[d.value].acordar),
            })),
        });
      } else if (passo === 4) {
        await updateRotinaForms4({ restricoes });
      } else {
        await updateRotinaForms5({ alimentos });
      }

      etapaAtualizada = true;
      await finalizaRotina();
      rotinaFinalizada = true;

      setAlterado(false);
      setAviso("Alterações salvas e rotina atualizada com sucesso!");
      await onAtualizado();
    } catch (e) {
      const motivo = textoErro(e, "Erro ao atualizar a rotina.");
      if (!etapaAtualizada) {
        setErro(motivo);
      } else if (!rotinaFinalizada) {
        setErro(`Os dados da etapa foram salvos, mas houve um erro ao finalizar a rotina: ${motivo}. Tente salvar novamente.`);
      } else {
        setErro(`A rotina foi finalizada, mas não foi possível atualizar a visualização: ${motivo}`);
      }
    } finally {
      setSalvando(false);
      trava.current = false;
    }
  }

  const bloqueado = carregando || falhaCarregamento || salvando || catalogoOcupado;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={e => { if (e.target === e.currentTarget && !trava.current) { if (!alterado || window.confirm("Descartar alterações não salvas e fechar?")) onFechar(); } }}>
      <section role="dialog" aria-modal="true" aria-labelledby="editar-rotina-titulo"
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-[popIn_.22s_ease-out]">
        <div className="h-2 shrink-0 bg-yellow-400" />
        <header className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">NutriHub · Minha rotina</p>
            <h2 id="editar-rotina-titulo" className="mt-1 text-2xl font-extrabold text-neutral-950">Editar minha rotina</h2>
            <p className="mt-1 text-xs text-neutral-500">Etapa {passo} de 5 — {ETAPAS[passo - 1]}</p>
          </div>
          <button type="button" aria-label="Fechar edição" disabled={salvando} onClick={() => { if (!alterado || window.confirm("Descartar alterações não salvas e fechar?")) onFechar(); }}
            className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"><X size={22} /></button>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-neutral-100 px-5 py-4 sm:px-8" aria-label="Etapas da edição">
          {ETAPAS.map((nome, indice) => (
            <button key={nome} type="button" disabled={carregando || salvando || catalogoOcupado} onClick={() => mudarEtapa((indice + 1) as Passo)}
              className={`min-w-[110px] flex-1 rounded-xl px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${passo === indice + 1 ? "bg-yellow-400 text-neutral-950" : "bg-neutral-100 text-neutral-600 hover:bg-yellow-50"}`}>
              {indice + 1}. {nome}
            </button>
          ))}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          {carregando ? <div role="status" className="flex min-h-52 items-center justify-center gap-3 text-sm text-neutral-500"><LoaderCircle className="animate-spin text-yellow-600" /> Buscando informações...</div>
            : falhaCarregamento ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-sm font-semibold text-red-800">Não foi possível carregar esta etapa. A edição está bloqueada para evitar alterações indevidas.</p>
                <button type="button" onClick={() => setTentativa(t => t + 1)} className="mt-4 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-neutral-900 hover:bg-yellow-300">Tentar novamente</button>
              </div>
            ) : <>
              {passo === 1 && <Formulario1 dados={form1} onChange={mudarForm1} bloqueado={bloqueado} />}
              {passo === 2 && <Formulario2 dados={form2} onChange={mudarForm2} bloqueado={bloqueado} />}
              {passo === 3 && <Formulario3 dados={form3} onChange={mudarForm3} bloqueado={bloqueado} />}
              {passo === 4 && <Formulario4 selecionadas={restricoes} onChange={mudarRestricoes} bloqueado={bloqueado} />}
              {passo === 5 && <Formulario5 selecionados={alimentos} onChange={mudarAlimentos} bloqueado={bloqueado} onBusyChange={setCatalogoOcupado} />}
            </>}
          {erro && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
          {aviso && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} />{aviso}</p>}
        </div>
        <footer className="flex shrink-0 flex-col gap-3 border-t border-neutral-100 bg-white px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
          <button type="button" disabled={passo === 1 || carregando || salvando || catalogoOcupado} onClick={() => mudarEtapa((passo - 1) as Passo)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 disabled:opacity-40"><ChevronLeft size={17} /> Voltar</button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" disabled={carregando || falhaCarregamento || salvando || catalogoOcupado} onClick={() => void salvar()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-neutral-950 hover:bg-yellow-300 disabled:opacity-50">
              {salvando ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />} {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
            <button type="button" disabled={passo === 5 || carregando || salvando || catalogoOcupado} onClick={() => mudarEtapa((passo + 1) as Passo)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 disabled:opacity-40">Próxima <ChevronRight size={17} /></button>
          </div>
        </footer>
      </section>
    </div>
  );
}
