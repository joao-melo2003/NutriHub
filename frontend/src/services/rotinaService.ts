import { apiFetch } from "./api";

import type {
    RotinaUsuario,
    VerificarRotinaResult,
    RotinaForms1Request,
    RotinaForms1Response,
    RotinaForms2Request,
    RotinaForms3Request,
    RotinaForms4Request,
    RotinaForms5Request,
    RotinaUpdateForms1Response,
    RotinaUpdateForms1Request,
    RotinaUpdateForms2Response,
    RotinaUpdateForms2Request,
    RotinaUpdateForms3Response,
    RotinaUpdateForms3Request,
    RotinaUpdateForms4Response,
    RotinaUpdateForms4Request,
    RotinaUpdateForms5Response,
    RotinaUpdateForms5Request,
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

export async function submitRotinaForms1(
  data: RotinaForms1Request
): Promise<RotinaForms1Response> {
  const response = await apiFetch("/RotinaForms1", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao salvar dados iniciais da rotina");
  }

  return response.json();
}

export async function submitRotinaForms2(
  data: RotinaForms2Request
): Promise<void> {
  const response = await apiFetch("/RotinaForms2", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao salvar horários de treino");
  }
}

export async function submitRotinaForms3(
  data: RotinaForms3Request
): Promise<void> {
  const response = await apiFetch("/RotinaForms3", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao salvar horários de sono");
  }
}

export async function submitRotinaForms4(
  data: RotinaForms4Request = {}
): Promise<void> {
  const response = await apiFetch("/RotinaForms4", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao salvar restrições alimentares");
  }
}

export async function submitRotinaForms5(
  data: RotinaForms5Request
): Promise<void> {
  const response = await apiFetch("/RotinaForms5", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao salvar alimentos preferidos");
  }
}

export async function finalizaRotina(): Promise<void> {
  const response = await apiFetch("/api/usuarios/finalizaRotina", {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao finalizar e gerar a rotina");
  }
}

export async function getRotinaUpdateForms1(): Promise<RotinaUpdateForms1Response> {
  const response = await apiFetch("/RotinaUpdateForms1", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar dados da etapa 1 da rotina");
  }

  return response.json();
}

export async function updateRotinaForms1(
  data: RotinaUpdateForms1Request
): Promise<void> {
  const response = await apiFetch("/RotinaUpdateForms1", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao atualizar dados da etapa 1 da rotina");
  }
}

export async function getRotinaUpdateForms2(): Promise<RotinaUpdateForms2Response> {
  const response = await apiFetch("/RotinaUpdateForms2", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar horários de treino");
  }

  return response.json();
}

export async function updateRotinaForms2(
  data: RotinaUpdateForms2Request
): Promise<void> {
  const response = await apiFetch("/RotinaUpdateForms2", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao atualizar horários de treino");
  }
}

export async function getRotinaUpdateForms3(): Promise<RotinaUpdateForms3Response> {
  const response = await apiFetch("/RotinaUpdateForms3", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar horários de sono");
  }

  return response.json();
}

export async function updateRotinaForms3(
  data: RotinaUpdateForms3Request
): Promise<void> {
  const response = await apiFetch("/RotinaUpdateForms3", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao atualizar horários de sono");
  }
}

export async function getRotinaUpdateForms4(): Promise<RotinaUpdateForms4Response> {
  const response = await apiFetch("/RotinaUpdateForms4", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar restrições alimentares");
  }

  return response.json();
}

export async function updateRotinaForms4(
  data: RotinaUpdateForms4Request = {}
): Promise<void> {
  const response = await apiFetch("/RotinaUpdateForms4", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao atualizar restrições alimentares");
  }
}

export async function getRotinaUpdateForms5(): Promise<RotinaUpdateForms5Response> {
  const response = await apiFetch("/RotinaUpdateForms5", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar alimentos preferidos");
  }

  return response.json();
}

export async function updateRotinaForms5(
  data: RotinaUpdateForms5Request
): Promise<void> {
  const response = await apiFetch("/RotinaUpdateForms5", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao atualizar alimentos preferidos");
  }
}

export async function deletarRotinaUsuario(confirmar: boolean): Promise<void> {
  const searchParams = new URLSearchParams({
    confirmar: String(confirmar),
  });

  const response = await apiFetch(
    `/api/usuarios/DeletaRotinaUsuario?${searchParams.toString()}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao excluir a rotina do usuário");
  }
}