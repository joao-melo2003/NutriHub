
import { apiFetch } from "./api";

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

export async function logout() {
  const response = await apiFetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Erro ao realizar logout");
  }

  return response;
}

