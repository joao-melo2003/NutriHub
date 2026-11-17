import { apiFetch } from "./api";

import type {
  CadastroUsuario,
  UpdateUsuarioPayload,
  UsuarioUpdateResponse,
  ExcluirContaPayload,
  UpdateSenhaPayload,
  UsuarioResponse,
  PageResponse,
  UsuariosPorStatusResponse,
  IndexUsuariosParams,
  BanirRequest,
  AlimentoUpdateRequest,
  AlimentoResponse,
  AlimentoRequest,
  RestricaoRequest,
  RestricaoUpdateRequest,
  RestricaoResponse,
  BuscaRestricaoParams
} from "@/types/padroes";

export async function cadastrarUsuario(dados: CadastroUsuario) {
  const response = await apiFetch("/api/usuarios/cadastrar", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "Não foi possível realizar o cadastro."
    );
  }

  return data;
}


export async function login(email: string, senha: string) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.detail ||
      data?.error ||
      "Erro ao realizar login"
    );
  }

  return data;
}


export async function checkSession(): Promise<boolean> {
  try {
    const response = await apiFetch("/api/usuarios/sessao", {
      method: "GET",
    });
    return response.ok;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export async function forgotPassword(email: string) {
  const response = await apiFetch("/api/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Erro ao solicitar recuperação de senha");
  }

  return response.json();
}

export async function resetPassword(token: string, novaSenha: string, novaSenhaConfirm: string) {
  const response = await apiFetch("/api/auth/password/reset", {
    method: "POST",
    body: JSON.stringify({ token, novaSenha, novaSenhaConfirm }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao redefinir a senha");
  }

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
}

export async function confirmEmail(token: string) {
  const response = await apiFetch("/api/auth/email/confirmar", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao confirmar o e-mail");
  }

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
}

export async function logout() {
  const response = await apiFetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Erro ao realizar logout");
  }

  return response;
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const response = await apiFetch("/api/admin/tipo-usuario", {
      method: "GET",
    });

    return response.ok;
  // Não exclua o comentário abaixo ele serve para impedir o eslint se aplicar o erro
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export async function updateUsuario(
  data: UpdateUsuarioPayload
): Promise<UsuarioUpdateResponse> {
  const response = await apiFetch("/api/usuarios/update", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao atualizar dados do usuário");
  }

  return response.json();
}

export async function updateSenha(data: UpdateSenhaPayload): Promise<void> {
  const response = await apiFetch("/api/usuarios/updateSenha", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao alterar a senha");
  }
}

export async function deleteConta(data: ExcluirContaPayload): Promise<void> {
  const response = await apiFetch("/api/usuarios/delete", {
    method: "DELETE",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao excluir a conta");
  }
}

export async function getUsuarioInfos(infoUser?: string): Promise<UsuarioResponse> {
  const query = infoUser ? `?infoUser=${encodeURIComponent(infoUser)}` : "";

  const response = await apiFetch(`/api/usuarios/infos${query}`, {
    method: "GET",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Usuário não encontrado ou parâmetro infoUser não informado");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar informações do usuário");
  }

  return response.json();
}

export async function getIndexUsuarios(
  params: IndexUsuariosParams = {}
): Promise<UsuariosPorStatusResponse> {
  const searchParams = new URLSearchParams();

  if (params.paginaAtivos !== undefined) {
    searchParams.set("paginaAtivos", String(params.paginaAtivos));
  }
  if (params.paginaBanidos !== undefined) {
    searchParams.set("paginaBanidos", String(params.paginaBanidos));
  }
  if (params.paginaDesativados !== undefined) {
    searchParams.set("paginaDesativados", String(params.paginaDesativados));
  }

  const queryString = searchParams.toString();
  const url = `/api/admin/indexUsuarios${queryString ? `?${queryString}` : ""}`;

  const response = await apiFetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao listar usuários");
  }

  return response.json();
}

export async function filtraUsuariosPorNome(
  nome: string,
  pagina: number = 0
): Promise<PageResponse<UsuarioResponse>> {
  const searchParams = new URLSearchParams({
    nome,
    pagina: String(pagina),
  });

  const response = await apiFetch(
    `/api/admin/filtraNomes?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao filtrar usuários por nome");
  }

  return response.json();
}

export async function banirUsuario(cpfUser: string): Promise<void> {
  const payload: BanirRequest = { cpfUser };

  const response = await apiFetch("/api/admin/banir", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao banir a conta do usuário");
  }
}

export async function addAlimento(data: AlimentoRequest): Promise<void> {
  const response = await apiFetch("/api/admin/addAlimentos", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao adicionar alimento");
  }
}

export async function getIndexAlimentos(pagina: number = 0): Promise<PageResponse<AlimentoResponse>> {
  const searchParams = new URLSearchParams({
    pagina: String(pagina),
  });

  const response = await apiFetch(
    `/api/admin/indexAlimento?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao listar alimentos");
  }

  return response.json();
}

export async function getInfoAlimento(id: string): Promise<AlimentoResponse> {
  const response = await apiFetch(
    `/api/admin/infoAlimento/${encodeURIComponent(id)}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar informações do alimento");
  }

  return response.json();
}

export async function editarAlimento(
  id: string,
  data: AlimentoUpdateRequest
): Promise<void> {
  const response = await apiFetch(
    `/api/admin/editarAlimento/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao editar alimento");
  }
}

export async function deletarAlimento(id: string): Promise<void> {
  const response = await apiFetch(
    `/api/admin/deletarAlimento/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao deletar alimento");
  }
}

export async function buscaAlimentoNome(
  nome: string
): Promise<AlimentoResponse[]> {
  const searchParams = new URLSearchParams({ nome });

  const response = await apiFetch(
    `/api/admin/buscaAlimentoNome?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar alimentos por nome");
  }

  return response.json();
}

export async function addRestricao(data: RestricaoRequest): Promise<void> {
  const response = await apiFetch("/api/admin/addRestricao", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao adicionar restrição");
  }
}

export async function getIndexRestricoes(
  pagina: number = 0
): Promise<PageResponse<RestricaoResponse>> {
  const searchParams = new URLSearchParams({
    pagina: String(pagina),
  });

  const response = await apiFetch(
    `/api/admin/indexRestricao?${searchParams.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao listar restrições");
  }

  return response.json();
}

export async function getInfoRestricao(id: string): Promise<RestricaoResponse> {
  const response = await apiFetch(
    `/api/admin/infoRestricao/${encodeURIComponent(id)}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar informações da restrição");
  }

  return response.json();
}

export async function editarRestricao(
  id: string,
  data: RestricaoUpdateRequest
): Promise<void> {
  const response = await apiFetch(
    `/api/admin/editarRestricao/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao editar restrição");
  }
}

export async function deletarRestricao(id: string): Promise<void> {
  const response = await apiFetch(
    `/api/admin/deletarRestricao/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao deletar restrição");
  }
}

export async function buscaRestricao(
  params: BuscaRestricaoParams = {}
): Promise<PageResponse<RestricaoResponse>> {
  const searchParams = new URLSearchParams();

  if (params.nome) {
    searchParams.set("nome", params.nome);
  }
  if (params.tipo) {
    searchParams.set("tipo", params.tipo);
  }
  if (params.pagina !== undefined) {
    searchParams.set("pagina", String(params.pagina));
  }

  const queryString = searchParams.toString();
  const url = `/api/admin/buscaRestricao${queryString ? `?${queryString}` : ""}`;

  const response = await apiFetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro ao buscar restrições");
  }

  return response.json();
}