
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
  const response = await apiFetch("/api/usuarios", {
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


