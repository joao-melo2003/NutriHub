export interface RotinaUsuario {
  id: string;
  [key: string]: unknown;
}

export type VerificarRotinaResult =
  | { status: "OK"; rotina: RotinaUsuario }
  | { status: "SEM_ROTINA"; message: string }
  | { status: "CORROMPIDA"; message: string };
