"use client";

import { Campo, DIAS_SEMANA, INPUT_CLASSE, type DiaSelecionavel } from "./formUtils";

export interface DadosFormulario2 {
  dias: DiaSelecionavel[];
  inicio: string;
  fim: string;
}

export default function Formulario2({
  dados,
  onChange,
  bloqueado,
}: {
  dados: DadosFormulario2;
  onChange: (dados: DadosFormulario2) => void;
  bloqueado: boolean;
}) {
  function alternarDia(dia: DiaSelecionavel) {
    onChange({ ...dados, dias: dados.dias.includes(dia) ? dados.dias.filter((valor) => valor !== dia) : [...dados.dias, dia] });
  }

  function alternarTodos() {
    onChange({ ...dados, dias: dados.dias.length === DIAS_SEMANA.length ? [] : DIAS_SEMANA.map((dia) => dia.value) });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-950">Horários de treino</h3>
        <p className="mt-1 text-sm text-neutral-500">Selecione os dias e o intervalo de horário que será aplicado a eles.</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-700">Dias da semana</p>
        <button type="button" disabled={bloqueado} onClick={alternarTodos} className="text-sm font-semibold text-yellow-700 hover:underline disabled:opacity-50">
          {dados.dias.length === DIAS_SEMANA.length ? "Desmarcar todos" : "Selecionar todos"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {DIAS_SEMANA.map((dia) => {
          const marcado = dados.dias.includes(dia.value);
          return (
            <button key={dia.value} type="button" disabled={bloqueado} aria-pressed={marcado} onClick={() => alternarDia(dia.value)}
              className={`min-h-16 rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${marcado ? "border-yellow-400 bg-yellow-50 text-neutral-900" : "border-neutral-200 bg-white text-neutral-600 hover:border-yellow-200"}`}>
              {marcado ? "✓ " : ""}{dia.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo titulo="Horário de início" htmlFor="treinoInicio">
          <input id="treinoInicio" type="time" value={dados.inicio} onChange={(e) => onChange({ ...dados, inicio: e.target.value })} required disabled={bloqueado} className={INPUT_CLASSE}/>
        </Campo>
        <Campo titulo="Horário de término" htmlFor="treinoFim">
          <input id="treinoFim" type="time" value={dados.fim} onChange={(e) => onChange({ ...dados, fim: e.target.value })} required disabled={bloqueado} className={INPUT_CLASSE}/>
        </Campo>
      </div>
    </div>
  );
}
