import type { ReactNode } from "react";

export const DIAS_SEMANA = [
  { value: "SEGUNDA", label: "Segunda-feira", curto: "Seg" },
  { value: "TERCA", label: "Terça-feira", curto: "Ter" },
  { value: "QUARTA", label: "Quarta-feira", curto: "Qua" },
  { value: "QUINTA", label: "Quinta-feira", curto: "Qui" },
  { value: "SEXTA", label: "Sexta-feira", curto: "Sex" },
  { value: "SABADO", label: "Sábado", curto: "Sáb" },
  { value: "DOMINGO", label: "Domingo", curto: "Dom" },
] as const;

export type DiaSelecionavel = (typeof DIAS_SEMANA)[number]["value"];

export const OBJETIVOS = [
  { value: "GANHO_MASSA", label: "Ganho de massa muscular" },
  { value: "PERDA_PESO", label: "Perda de peso" },
  { value: "MANUTENCAO", label: "Manutenção" },
] as const;

export const DIVISOES = [
  { value: "ABC", label: "ABC" },
  { value: "FULL_BODY", label: "Corpo inteiro (Full Body)" },
  { value: "UPPER_LOWER", label: "Superiores e inferiores (Upper/Lower)" },
  { value: "PUSH_PULL_LEGS", label: "Empurrar, puxar e pernas (PPL)" },
  { value: "ABCDE", label: "ABCDE" },
] as const;

export const DISTRIBUICOES = [
  { value: "BALANCEADO", label: "Balanceado" },
  { value: "PRIORIDADE", label: "Prioridade" },
] as const;

export const TIPOS_RESTRICAO: Record<string, string> = {
  ALERGIA: "Alergia",
  INTOLERANCIA: "Intolerância",
  CONDICAO: "Condição",
  RESTRICAO: "Restrição",
};

export const CATEGORIAS_ALIMENTO: Record<string, string> = {
  CEREAIS: "Cereais",
  TUBERCULOS_RAIZES: "Tubérculos e raízes",
  HORTALICAS: "Hortaliças",
  FRUTAS: "Frutas",
  CARNES_OVOS: "Carnes e ovos",
  LATICINEOS: "Laticínios",
  OLEOS_GORDURAS: "Óleos e gorduras",
  ACUCARES: "Açúcares",
};

export const INPUT_CLASSE =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-400/15 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500";

export const LABEL_CLASSE = "mb-2 block text-sm font-semibold text-neutral-700";

export function completarHora(hora: string): string {
  if (!/^\d{2}:\d{2}$/.test(hora)) throw new Error("Informe um horário válido.");
  return `${hora}:00`;
}

export function textoErro(erro: unknown, alternativa: string) {
  return erro instanceof Error ? erro.message : alternativa;
}

export function Campo({
  titulo,
  htmlFor,
  children,
}: {
  titulo: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={LABEL_CLASSE}>{titulo}</label>
      {children}
    </div>
  );
}

export function Paginacao({
  pagina,
  totalPaginas,
  carregando,
  onMudar,
}: {
  pagina: number;
  totalPaginas: number;
  carregando: boolean;
  onMudar: (pagina: number) => void;
}) {
  const ultima = Math.max(0, totalPaginas - 1);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
      <span className="text-xs text-neutral-500">Página {totalPaginas ? pagina + 1 : 0} de {totalPaginas}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina <= 0 || carregando}
          onClick={() => onMudar(Math.max(0, pagina - 1))}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-neutral-700 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-40"
        >‹</button>
        <button
          type="button"
          aria-label="Próxima página"
          disabled={pagina >= ultima || carregando}
          onClick={() => onMudar(Math.min(ultima, pagina + 1))}
          className="rounded-xl border border-neutral-200 px-3 py-2 text-neutral-700 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-40"
        >›</button>
      </div>
    </div>
  );
}
