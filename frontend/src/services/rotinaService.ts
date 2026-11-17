import { apiFetch } from "./api";

import type {
    RotinaUsuario,
    VerificarRotinaResult
} from "@/types/padroes_rotina";

export async function verificarRotinaUsuario(): Promise<VerificarRotinaResult> {
  const response = await apiFetch("/api/usuarios/AddRotinaUsuario", {
    method: "GET",
  });

  if (response.status === 404) {
    const errorData = await response.json().catch(() => ({}));
    return {
      status: "SEM_ROTINA",
      message: errorData.message || "usuario sem rotina",
    };
  }

  if (response.status === 409) {
    const errorData = await response.json().catch(() => ({}));
    return {
      status: "CORROMPIDA",
      message: errorData.message || "rotina corrompida",
    };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao verificar rotina do usuário");
  }

  const rotina: RotinaUsuario = await response.json();
  return {
    status: "OK",
    rotina,
  };
}