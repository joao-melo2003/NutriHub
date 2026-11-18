"use client";

import { Campo, DIAS_SEMANA, INPUT_CLASSE, type DiaSelecionavel } from "./formUtils";

export interface HorariosDia { dormir: string; acordar: string }
export interface DadosFormulario3 {
  iguais: boolean | null;
  mesmoHorario: HorariosDia;
  dias: Record<DiaSelecionavel, HorariosDia>;
}

export const DADOS_SONO_INICIAIS: DadosFormulario3 = {
  iguais: null,
  mesmoHorario: { dormir: "22:30", acordar: "07:00" },
  dias: {
    SEGUNDA: { dormir: "22:30", acordar: "07:00" },
    TERCA: { dormir: "22:30", acordar: "07:00" },
    QUARTA: { dormir: "22:30", acordar: "07:00" },
    QUINTA: { dormir: "22:30", acordar: "07:00" },
    SEXTA: { dormir: "22:30", acordar: "07:00" },
    SABADO: { dormir: "22:30", acordar: "08:00" },
    DOMINGO: { dormir: "22:30", acordar: "08:00" },
  },
};

export default function Formulario3({
  dados,
  onChange,
  bloqueado,
}: {
  dados: DadosFormulario3;
  onChange: (dados: DadosFormulario3) => void;
  bloqueado: boolean;
}) {
  function mudarDia(dia: DiaSelecionavel, patch: Partial<HorariosDia>) {
    onChange({ ...dados, dias: { ...dados.dias, [dia]: { ...dados.dias[dia], ...patch } } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-950">Rotina de sono</h3>
        <p className="mt-1 text-sm text-neutral-500">Os horários de dormir e acordar podem variar conforme o dia da semana.</p>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Você dorme e acorda nos mesmos horários todos os dias?</p>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Sim", value: true }, { label: "Não", value: false }].map((op) => (
            <button key={op.label} type="button" disabled={bloqueado} aria-pressed={dados.iguais === op.value}
              onClick={() => onChange({ ...dados, iguais: op.value })}
              className={`rounded-xl text-black border-2 px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${dados.iguais === op.value ? "border-yellow-400 bg-yellow-50" : "border-neutral-200 hover:border-yellow-200"}`}>
              {op.label}
            </button>
          ))}
        </div>
      </div>
      {dados.iguais === true && (
        <div className="grid gap-4 rounded-2xl border border-yellow-200 bg-yellow-50/40 p-4 sm:grid-cols-2">
          <Campo titulo="Horário de dormir" htmlFor="sonoIgualDormir">
            <input id="sonoIgualDormir" type="time" value={dados.mesmoHorario.dormir} required disabled={bloqueado} className={INPUT_CLASSE}
              onChange={(e) => onChange({ ...dados, mesmoHorario: { ...dados.mesmoHorario, dormir: e.target.value } })}/>
          </Campo>
          <Campo titulo="Horário de acordar" htmlFor="sonoIgualAcordar">
            <input id="sonoIgualAcordar" type="time" value={dados.mesmoHorario.acordar} required disabled={bloqueado} className={INPUT_CLASSE}
              onChange={(e) => onChange({ ...dados, mesmoHorario: { ...dados.mesmoHorario, acordar: e.target.value } })}/>
          </Campo>
        </div>
      )}
      {dados.iguais === false && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">Configure cada dia. Se preferir, copie o horário de segunda para todos os dias.</p>
          <button type="button" disabled={bloqueado} onClick={() => {
            const padrao = dados.dias.SEGUNDA;
            onChange({ ...dados, dias: Object.fromEntries(DIAS_SEMANA.map((dia) => [dia.value, { ...padrao }])) as Record<DiaSelecionavel, HorariosDia> });
          }} className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-800 hover:bg-yellow-100 disabled:opacity-50">
            Copiar segunda para todos
          </button>
          <div className="grid gap-3">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia.value} className="grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:grid-cols-[minmax(110px,1fr)_minmax(130px,1.1fr)_minmax(130px,1.1fr)] sm:items-end">
                <span className="pb-3 text-sm font-bold text-neutral-800">{dia.label}</span>
                <Campo titulo="Dormir" htmlFor={`dormir-${dia.value}`}>
                  <input id={`dormir-${dia.value}`} type="time" value={dados.dias[dia.value].dormir} disabled={bloqueado} required className={INPUT_CLASSE}
                    onChange={(e) => mudarDia(dia.value, { dormir: e.target.value })}/>
                </Campo>
                <Campo titulo="Acordar" htmlFor={`acordar-${dia.value}`}>
                  <input id={`acordar-${dia.value}`} type="time" value={dados.dias[dia.value].acordar} disabled={bloqueado} required className={INPUT_CLASSE}
                    onChange={(e) => mudarDia(dia.value, { acordar: e.target.value })}/>
                </Campo>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
