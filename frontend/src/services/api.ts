const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não foi configurada.");
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });
}