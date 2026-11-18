"use client";

import type { RotinaForms1Request } from "@/types/padroes_rotina";
import { Campo, DISTRIBUICOES, DIVISOES, INPUT_CLASSE, OBJETIVOS } from "./formUtils";


export type GrupoMuscular = "SUPERIORES" | "ABDOMINAL" | "INFERIORES";
export type NivelPrioridade = 1 | 2 | 3;
export type PreferenciasMusculares = Partial<Record<GrupoMuscular, NivelPrioridade>>;
export type PreferenciasCompletas = Record<GrupoMuscular, NivelPrioridade>;

export type DadosFormulario1 = Omit<RotinaForms1Request, "preferenciasMusculares"> & {
  preferenciasMusculares?: PreferenciasMusculares;
};

const GRUPOS_MUSCULARES: { value: GrupoMuscular; label: string; descricao: string }[] = [
  { value: "SUPERIORES", label: "Membros superiores", descricao: "Peito, costas, braços e ombros" },
  { value: "ABDOMINAL", label: "Abdômen", descricao: "Região abdominal e core" },
  { value: "INFERIORES", label: "Membros inferiores", descricao: "Pernas e glúteos" },
];

const OPCOES_PRIORIDADE: { value: NivelPrioridade; label: string }[] = [
  { value: 1, label: "Alta" },
  { value: 2, label: "Média" },
  { value: 3, label: "Baixa " },
];

export function prioridadesMuscularesValidas(
  preferencias: PreferenciasMusculares | undefined
): preferencias is PreferenciasCompletas {
  if (!preferencias) return false;
  const prioridades = GRUPOS_MUSCULARES.map((grupo) => preferencias[grupo.value]);
  return (
    prioridades.every((valor) => valor === 1 || valor === 2 || valor === 3) &&
    new Set(prioridades).size === GRUPOS_MUSCULARES.length
  );
}

export default function Formulario1({
  dados,
  onChange,
  bloqueado,
}: {
  dados: DadosFormulario1;
  onChange: (dados: DadosFormulario1) => void;
  bloqueado: boolean;
}) {
  const alterar = (patch: Partial<DadosFormulario1>) => onChange({ ...dados, ...patch });

  function alterarPrioridade(grupo: GrupoMuscular, valor: string) {
    const preferencias = { ...(dados.preferenciasMusculares ?? {}) };

    if (valor === "") {
      delete preferencias[grupo];
    } else {
      preferencias[grupo] = Number(valor) as NivelPrioridade;
    }

    alterar({ preferenciasMusculares: preferencias });
  }

  const prioridades = dados.preferenciasMusculares;
  const selecionadas = GRUPOS_MUSCULARES.map((grupo) => prioridades?.[grupo.value]);
  const duplicadas = selecionadas.filter((valor): valor is NivelPrioridade => valor !== undefined);
  const existeRepeticao = new Set(duplicadas).size !== duplicadas.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-neutral-950">Seus objetivos</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Conte sobre seu corpo e sobre como pretende organizar seus treinos.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo titulo="Objetivo" htmlFor="objetivo">
          <select id="objetivo" value={dados.objetivo} onChange={(e) => alterar({ objetivo: e.target.value })} required disabled={bloqueado} className={INPUT_CLASSE}>
            <option value="">Selecione seu objetivo</option>
            {OBJETIVOS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
          </select>
        </Campo>
        <Campo titulo="Divisão do treino" htmlFor="divisao">
          <select id="divisao" value={dados.divisao} onChange={(e) => alterar({ divisao: e.target.value })} required disabled={bloqueado} className={INPUT_CLASSE}>
            <option value="">Selecione a divisão</option>
            {DIVISOES.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
          </select>
        </Campo>
        <Campo titulo="Altura (m)" htmlFor="altura">
          <input id="altura" type="number" min="0.01" step="0.01" placeholder="Ex.: 1,80" value={dados.altura || ""} onChange={(e) => alterar({ altura: Number(e.target.value) })} required disabled={bloqueado} className={INPUT_CLASSE} />
        </Campo>
        <Campo titulo="Peso (kg)" htmlFor="peso">
          <input id="peso" type="number" min="0.01" step="0.01" placeholder="Ex.: 78,50" value={dados.peso || ""} onChange={(e) => alterar({ peso: Number(e.target.value) })} required disabled={bloqueado} className={INPUT_CLASSE} />
        </Campo>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-700">Distribuição do treino</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DISTRIBUICOES.map((op) => (
            <button
              key={op.value}
              type="button"
              disabled={bloqueado}
              aria-pressed={dados.distribuicao === op.value}
              onClick={() => alterar({ distribuicao: op.value })}
              className={`rounded-xl border-2 px-4 py-4 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${dados.distribuicao === op.value ? "border-yellow-400 bg-yellow-50 text-neutral-950" : "border-neutral-200 bg-white text-neutral-600 hover:border-yellow-200"}`}
            >
              <span className="mr-2 inline-block h-3 w-3 rounded-full border-2 border-yellow-500" style={{ background: dados.distribuicao === op.value ? "#eab308" : "transparent" }} />
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {dados.distribuicao === "PRIORIDADE" && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50/70 p-5 sm:p-6">
          <div className="mb-4">
            <h4 className="text-base font-bold text-neutral-950">Prioridades musculares</h4>
            <p className="mt-1 text-sm text-neutral-600">
              Defina a importância de cada grupo muscular. Use cada prioridade uma única vez:
              alta (1), média (2) e baixa (3).
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {GRUPOS_MUSCULARES.map((grupo) => (
              <div key={grupo.value} className="rounded-xl border border-yellow-100 bg-white p-3">
                <Campo titulo={grupo.label} htmlFor={`prioridade-${grupo.value}`}>
                  <select
                    id={`prioridade-${grupo.value}`}
                    value={prioridades?.[grupo.value] ?? ""}
                    disabled={bloqueado}
                    required
                    onChange={(e) => alterarPrioridade(grupo.value, e.target.value)}
                    className={INPUT_CLASSE}
                  >
                    <option value="">Selecione</option>
                    {OPCOES_PRIORIDADE.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </Campo>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">{grupo.descricao}</p>
              </div>
            ))}
          </div>

          {existeRepeticao && (
            <p role="alert" className="mt-4 rounded-lg border border-amber-300 bg-amber-100 p-3 text-sm font-medium text-amber-900">
              As prioridades não podem se repetir. Selecione alta, média e baixa em grupos diferentes.
            </p>
          )}
          {prioridadesMuscularesValidas(prioridades) && (
            <p className="mt-4 text-sm font-semibold text-amber-800">Prioridades definidas corretamente.</p>
          )}
        </div>
      )}
    </div>
  );
}
