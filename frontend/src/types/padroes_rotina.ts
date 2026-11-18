export interface RotinaUsuario {
  id: string;
  [key: string]: unknown;
}

export type VerificarRotinaResult =
  | { status: "OK"; rotina: RotinaUsuario }
  | { status: "SEM_ROTINA"; message: string }
  | { status: "CORROMPIDA"; message: string };

export type DiaSemana =
  | "DOMINGO"
  | "SEGUNDA"
  | "TERCA"
  | "QUARTA"
  | "QUINTA"
  | "SEXTA"
  | "SABADO"
  | string;



export interface RotinaForms1Request {
  objetivo: string;
  altura: number;
  peso: number;
  divisao: string;
  distribuicao: string;

  preferenciasMusculares?: {
    SUPERIORES: 1 | 2 | 3;
    ABDOMINAL: 1 | 2 | 3;
    INFERIORES: 1 | 2 | 3;
  };
}


export interface RotinaForms1Response {
  idRotina: string;
}


export interface RotinaForms2Request {
  idRotina: string;
  diaSemanas: DiaSemana[];
  horarioInicio: string; 
  horarioFim: string;    
}


export interface HorarioSonoItem {
  diaSemana: DiaSemana | null;
  horarioDormir: string; 
  horarioAcordar: string;
}

export interface RotinaForms3Request {
  idRotina: string;
  horariosIguais: boolean;
  horarios: HorarioSonoItem[];
}

export interface RotinaForms4Request {
  restricoes?: string[];
}

export interface RotinaForms5Request {
  alimentos: string[];
}
export interface PreferenciasMusculares {
  INFERIORES?: number;
  SUPERIORES?: number;
  ABDOMINAL?: number;
  [key: string]: number | undefined;
}

export interface RotinaUpdateForms1Response {
  objetivo: string;
  peso: number;
  altura: number;
  divisao: string;
  distribuicao: string;
  preferenciasMusculares?: PreferenciasMusculares;
}

export interface RotinaUpdateForms1Request {
  objetivo: string;
  peso: number;
  altura: number;
  divisao: string;
  distribuicao: string;
  preferenciasMusculares?: PreferenciasMusculares;
}

export interface RotinaUpdateForms2Response {
  diaSemanas: DiaSemana[];
  horarioInicio: string; 
  horarioFim: string;   
}

export interface RotinaUpdateForms2Request {
  idRotina?: string;
  diaSemanas: DiaSemana[];
  horarioInicio: string;
  horarioFim: string;
}

export interface RotinaUpdateForms3Response {
  idRotina?: string;
  horariosIguais: boolean;
  horarios: HorarioSonoItem[];
}

export interface RotinaUpdateForms3Request {
  idRotina?: string;
  horariosIguais: boolean;
  horarios: HorarioSonoItem[];
}

export interface ItemResumoResponse {
  id: string;
  nome: string;
}

export interface RotinaUpdateForms4Response {
  restricoes: ItemResumoResponse[];
}

export interface RotinaUpdateForms4Request {
  restricoes?: string[];
}
export interface RotinaUpdateForms5Response {
  alimentos: ItemResumoResponse[];
}

export interface RotinaUpdateForms5Request {
  alimentos: string[];
}

//aqui2
export interface ItemResumoRotina {
  id: string;
  nome: string;
}

export interface TreinoRotina {
  diaSemana: string;
  horarioInicio: string;
  horarioFim: string;
  grupoMuscular: string;
}

export interface SonoRotina {
  diaSemana: string;
  horarioDormir: string;
  horarioAcordar: string;
}

export interface AlimentoRefeicaoRotina {
  idAlimento: string;
  nome: string;
  quantidade: number; 
}

export interface RefeicaoRotina {
  id: string;
  diaSemana: string;
  nome: string;
  horario: string;
  alimentos: AlimentoRefeicaoRotina[];
}

export interface RotinaCompleta {
  idRotina: string;
  objetivo: string;
  peso: number;
  altura: number;
  divisao: string;
  distribuicao: string;
  preferenciasMusculares?: Record<string, number>;
  treinos: TreinoRotina[];
  horariosSono: SonoRotina[];
  restricoesAlimentares: ItemResumoRotina[];
  alimentosPreferidos: ItemResumoRotina[];
  refeicoes: RefeicaoRotina[];
}