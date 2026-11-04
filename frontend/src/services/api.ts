
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não foi configurada.");
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_URL}/api/auth/csrf`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível obter o token CSRF");
  }

  const data: { token?: string } = await response.json();

  if (!data.token) {
    throw new Error("O backend não retornou um token CSRF válido");
  }

  return data.token;
}

export async function apiFetch(endpoint: string,options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const token = await getCsrfToken();

    headers.set("X-XSRF-TOKEN", token);
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });
}
