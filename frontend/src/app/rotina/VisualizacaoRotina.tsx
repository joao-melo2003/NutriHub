"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Apple, BedDouble, ChevronRight, Clock3, Dumbbell, UtensilsCrossed, X } from "lucide-react";
import type { RotinaCompleta, RefeicaoRotina } from "@/types/padroes_rotina";
import { DIAS_SEMANA, DIVISOES, DISTRIBUICOES, OBJETIVOS } from "./forms/formUtils";

type TipoEvento = "sono" | "treino" | "refeicao";
type Evento = {
  id: string;
  hora: string;
  titulo: string;
  subtitulo: string;
  tipo: TipoEvento;
  detalhe?: RefeicaoRotina["alimentos"];
  diaSemana?: string;
};

const ESTILOS: Record<TipoEvento, string> = {
  sono: "border-rose-200 bg-rose-50 text-rose-900",
  treino: "border-amber-200 bg-amber-50 text-amber-900",
  refeicao: "border-emerald-200 bg-emerald-50 text-emerald-900",
};


function exibirHora(valor?: string | null) {
  return typeof valor === "string" && valor.trim() ? valor.slice(0, 5) : "--:--";
}
function exibirNumero(valor: number | null | undefined, unidade: string) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return "Não informado";
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unidade}`;
}
function nomeAmigavel(valor?: string | null) {
  if (typeof valor !== "string" || !valor.trim()) return "Não informado";
  return valor.replaceAll("_", " ").toLowerCase().replace(/^./, c => c.toUpperCase());
}
function textoOpcao(valor: string | null | undefined, opcoes: ReadonlyArray<{ readonly value: string; readonly label: string }>) {
  return opcoes.find(o => o.value === valor)?.label ?? nomeAmigavel(valor);
}

function montarEventos(rotina: RotinaCompleta, diaSemana: string): Evento[] {
  const eventos: Evento[] = [];
  for (const sono of rotina.horariosSono ?? []) {
    if (sono.diaSemana !== diaSemana) continue;
    eventos.push({ id: `acordar-${diaSemana}`, hora: sono.horarioAcordar ?? "", titulo: "Acordar", subtitulo: "Horário de despertar", tipo: "sono" });
    eventos.push({ id: `dormir-${diaSemana}`, hora: sono.horarioDormir ?? "", titulo: "Dormir", subtitulo: "Início do descanso", tipo: "sono" });
  }
  (rotina.treinos ?? []).forEach((treino, indice) => {
    if (treino.diaSemana !== diaSemana) return;
    eventos.push({
      id: `treino-${diaSemana}-${indice}`, hora: treino.horarioInicio ?? "",
      titulo: "Treino · " + nomeAmigavel(treino.grupoMuscular),
      subtitulo: `${exibirHora(treino.horarioInicio)} – ${exibirHora(treino.horarioFim)}`,
      tipo: "treino",
    });
  });
  (rotina.refeicoes ?? []).forEach((refeicao, indice) => {
    if (refeicao.diaSemana !== diaSemana) return;
    eventos.push({
      id: refeicao.id || `refeicao-${diaSemana}-${indice}`, hora: refeicao.horario ?? "",
      titulo: refeicao.nome || "Refeição",
      subtitulo: `${refeicao.alimentos?.length ?? 0} alimento(s)`,
      detalhe: refeicao.alimentos ?? [], tipo: "refeicao", diaSemana,
    });
  });
  return eventos.sort((a, b) => (a.hora || "99:99:99").localeCompare(b.hora || "99:99:99"));
}

function EventoCard({
  evento,
  compacto = false,
  onSelecionarRefeicao,
}: {
  evento: Evento;
  compacto?: boolean;
  onSelecionarRefeicao: (evento: Evento) => void;
}) {
  const Icone = evento.tipo === "sono" ? BedDouble : evento.tipo === "treino" ? Dumbbell : UtensilsCrossed;

  // Mantém o mesmo conteúdo visual dos cards anteriores.
  const conteudo = (
    <div className="flex items-start gap-2">
      <Icone size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold tabular-nums">{exibirHora(evento.hora)}</p>
        <p className={`mt-1 font-semibold leading-snug ${compacto ? "text-xs" : "text-sm"}`}>{evento.titulo}</p>
        <p className="mt-1 text-xs opacity-75">{evento.subtitulo}</p>
        {!compacto && evento.tipo === "refeicao" && !!evento.detalhe?.length && (
          <ul className="mt-3 space-y-1 border-t border-current/15 pt-2 text-xs">
            {evento.detalhe.map((alimento, i) => (
              <li className="flex justify-between gap-2" key={`${alimento.idAlimento}-${i}`}>
                <span>{alimento.nome || "Alimento não informado"}</span>
                <span className="shrink-0 font-semibold tabular-nums">{exibirNumero(alimento.quantidade, "g")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {evento.tipo === "refeicao" && (
        <ChevronRight size={16} className="mt-1 shrink-0 opacity-60" aria-hidden="true" />
      )}
    </div>
  );

  if (evento.tipo === "refeicao") {
    return (
      <button
        type="button"
        onClick={() => onSelecionarRefeicao(evento)}
        aria-label={`Ver alimentos de ${evento.titulo} às ${exibirHora(evento.hora)}`}
        className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${ESTILOS[evento.tipo]}`}
      >
        {conteudo}
      </button>
    );
  }

  return (
    <article className={`rounded-xl border p-3 ${ESTILOS[evento.tipo]}`}>
      {conteudo}
    </article>
  );
}

export default function VisualizacaoRotina({ rotina }: { rotina: RotinaCompleta }) {
  const [modo, setModo] = useState<"semana" | "dia">("semana");
  const [diaAtivo, setDiaAtivo] = useState<string>("SEGUNDA");
  const [refeicaoSelecionada, setRefeicaoSelecionada] = useState<Evento | null>(null);
  const fecharModalRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!refeicaoSelecionada) return;

    // Acessibilidade: move o foco para o modal e permite fechá-lo com Escape.
    const elementoAnterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharModalRef.current?.focus();

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setRefeicaoSelecionada(null);
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("keydown", fecharComEscape);
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus();
    };
  }, [refeicaoSelecionada]);

  const agenda = useMemo(() => {
    return Object.fromEntries(DIAS_SEMANA.map(d => [d.value, montarEventos(rotina, d.value)])) as Record<string, Evento[]>;
  }, [rotina]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700"><Activity size={23} /></span>
          <div>
            <h2 className="text-xl font-extrabold text-neutral-950">Seu planejamento</h2>
            <p className="mt-1 text-sm text-neutral-500">Atividades organizadas ao longo dos sete dias da semana.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Objetivo", textoOpcao(rotina.objetivo, OBJETIVOS)],
            ["Divisão", textoOpcao(rotina.divisao, DIVISOES)],
            ["Distribuição", textoOpcao(rotina.distribuicao, DISTRIBUICOES)],
            ["Medidas", `${exibirNumero(rotina.peso, "kg")} · ${exibirNumero(rotina.altura, "m")}`],
          ].map(([titulo, valor]) => (
            <div key={titulo} className="rounded-xl bg-neutral-50 px-4 py-3">
              <p className="text-xs font-semibold text-neutral-500">{titulo}</p>
              <p className="mt-1 text-sm font-bold text-neutral-900">{valor}</p>
            </div>
          ))}
        </div>
        {rotina.distribuicao === "PRIORIDADE" && rotina.preferenciasMusculares && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-neutral-600">Prioridades musculares:</span>
            {(["SUPERIORES", "ABDOMINAL", "INFERIORES"] as const).map(grupo => {
              const nivel = rotina.preferenciasMusculares?.[grupo];
              return <span key={grupo} className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-900">
                {nomeAmigavel(grupo)} · {nivel === 1 ? "Alta" : nivel === 2 ? "Média" : nivel === 3 ? "Baixa" : "Não definida"}
              </span>;
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Agenda da semana</h2>
            <p className="mt-1 text-xs text-neutral-500">Eventos ordenados por horário em cada dia.</p>
          </div>
          <div className="flex rounded-xl border border-neutral-200 bg-neutral-50 p-1" aria-label="Tipo de visualização">
            <button type="button" aria-pressed={modo === "semana"} onClick={() => setModo("semana")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${modo === "semana" ? "bg-yellow-400 text-neutral-950" : "text-neutral-600"}`}>Semana</button>
            <button type="button" aria-pressed={modo === "dia"} onClick={() => setModo("dia")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${modo === "dia" ? "bg-yellow-400 text-neutral-950" : "text-neutral-600"}`}>Dia</button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-neutral-700">
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-rose-200" /> Sono</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-300" /> Treinos</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-200" /> Refeições</span>
        </div>

        {modo === "semana" ? (
          <div className="mt-5 overflow-x-auto pb-3" tabIndex={0} aria-label="Agenda semanal com rolagem horizontal">
            <div className="grid min-w-[1190px] grid-cols-7 gap-3">
              {DIAS_SEMANA.map(dia => (
                <div key={dia.value} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-2.5">
                  <div className="mb-3 rounded-xl bg-neutral-900 px-2 py-3 text-center text-sm font-bold text-white">{dia.label}</div>
                  <div className="space-y-2">
                    {agenda[dia.value].length > 0
                      ? agenda[dia.value].map(evento => <EventoCard key={evento.id} evento={evento} compacto onSelecionarRefeicao={setRefeicaoSelecionada} />)
                      : <p className="rounded-xl bg-white p-3 text-center text-xs text-neutral-400">Sem eventos cadastrados</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              {DIAS_SEMANA.map(dia => (
                <button key={dia.value} type="button" onClick={() => setDiaAtivo(dia.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${diaAtivo === dia.value ? "bg-yellow-400 text-neutral-950" : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-yellow-50"}`}>
                  {dia.curto}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {agenda[diaAtivo].length ? agenda[diaAtivo].map(evento => <EventoCard key={evento.id} evento={evento} onSelecionarRefeicao={setRefeicaoSelecionada} />)
                : <p className="col-span-full rounded-xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">Não há eventos cadastrados neste dia.</p>}
            </div>
          </>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-neutral-900"><Apple size={19} className="text-emerald-600" /> Alimentos preferidos</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(rotina.alimentosPreferidos ?? []).length ? rotina.alimentosPreferidos.map(item => (
              <span key={item.id} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">{item.nome || "Não informado"}</span>
            )) : <p className="text-sm text-neutral-500">Nenhum alimento selecionado.</p>}
          </div>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-neutral-900"><Clock3 size={19} className="text-yellow-700" /> Restrições alimentares</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(rotina.restricoesAlimentares ?? []).length ? rotina.restricoesAlimentares.map(item => (
              <span key={item.id} className="rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-900">{item.nome || "Não informado"}</span>
            )) : <p className="text-sm text-neutral-500">Nenhuma restrição informada.</p>}
          </div>
        </div>
      </section>

      {refeicaoSelecionada?.tipo === "refeicao" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/55 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRefeicaoSelecionada(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="refeicao-modal-titulo"
            aria-describedby="refeicao-modal-descricao"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl animate-[entradaModalRefeicao_200ms_ease-out_both]"
          >
            <div className="h-2 bg-emerald-400" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <UtensilsCrossed size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Detalhes da refeição</p>
                    <h2 id="refeicao-modal-titulo" className="mt-1 text-xl font-extrabold text-neutral-950">
                      {refeicaoSelecionada.titulo}
                    </h2>
                  </div>
                </div>
                <button
                  ref={fecharModalRef}
                  type="button"
                  onClick={() => setRefeicaoSelecionada(null)}
                  aria-label="Fechar detalhes da refeição"
                  className="rounded-xl p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <X size={21} />
                </button>
              </div>

              <p id="refeicao-modal-descricao" className="mt-4 text-sm text-neutral-500">
                {DIAS_SEMANA.find(d => d.value === refeicaoSelecionada.diaSemana)?.label ?? "Dia não informado"}
                {" · "}
                {exibirHora(refeicaoSelecionada.hora)}
                {" · "}
                {refeicaoSelecionada.detalhe?.length ?? 0} alimento(s)
              </p>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-neutral-800">Alimentos e quantidades</h3>
                {refeicaoSelecionada.detalhe?.length ? (
                  <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                    {refeicaoSelecionada.detalhe.map((alimento, indice) => (
                      <li
                        key={`${alimento.idAlimento}-${indice}`}
                        className="flex items-center justify-between gap-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3"
                      >
                        <span className="min-w-0 break-words text-sm font-semibold text-neutral-800">
                          {alimento.nome || "Alimento não informado"}
                        </span>
                        <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-extrabold tabular-nums text-emerald-800">
                          {exibirNumero(alimento.quantidade, "g")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl bg-neutral-50 p-4 text-sm text-neutral-500">
                    Nenhum alimento informado para esta refeição.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setRefeicaoSelecionada(null)}
                className="mt-7 w-full rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-colors hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600 focus-visible:ring-offset-2"
              >
                Fechar
              </button>
            </div>
          </section>
          <style>{`
            @keyframes entradaModalRefeicao {
              from { opacity: 0; transform: translateY(10px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
