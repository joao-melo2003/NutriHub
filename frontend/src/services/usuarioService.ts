
import { apiFetch } from "./api";

export interface CadastroUsuario {
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  senhaConfirm: string;
  dataNascimento: string;
  sexo: "M" | "F";
}

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

  if (!response.ok) {
    throw new Error("Erro ao realizar login");
  }

  return response.json();
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