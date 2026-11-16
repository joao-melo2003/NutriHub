"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cadastrarUsuario } from "@/services/usuarioService";

type Sexo = "M" | "F" | "";

export default function CadastroPage() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState<Sexo>("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function formatarCpf(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    return numeros
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})\.(\d{3})(\d)/, ".$1.$2-$3");
  }

  async function handleCadastro(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      setErro("O CPF deve conter 11 números.");
      return;
    }

    if (senha !== senhaConfirm) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (!sexo) {
      setErro("Selecione o sexo.");
      return;
    }

    setLoading(true);

    try {
      await cadastrarUsuario({
        cpf: cpfLimpo,
        nome: nome.trim(),
        email: email.trim(),
        senha,
        senhaConfirm,
        dataNascimento,
        sexo,
      });

      setCpf("");
      setNome("");
      setEmail("");
      setSenha("");
      setSenhaConfirm("");
      setDataNascimento("");
      setSexo("");

  
      router.push("/cadastro/sucesso");

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao realizar o cadastro."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = `
    w-full rounded-xl border border-neutral-200
    bg-neutral-50 px-4 py-3
    text-sm text-neutral-900
    placeholder:text-neutral-400
    outline-none transition-all duration-200
    focus:border-yellow-400
    focus:bg-white
    focus:ring-4 focus:ring-yellow-400/15
  `;

  const labelStyle =
    "mb-2 block text-sm font-medium text-neutral-800";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F6F2] px-4 py-10">

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-yellow-400/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">

        <div className="h-2 w-full bg-yellow-400" />

        <div className="px-6 py-8 sm:px-10 sm:py-10">

          <header className="mb-9 text-center">

            <div className="mb-5 flex items-center justify-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-950"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950">
                Nutri<span className="text-yellow-500">Hub</span>
              </h1>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Crie sua conta
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Comece sua jornada de saúde e bem-estar.
            </p>
          </header>

          {erro && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {erro}
            </div>
          )}
        
          <form
            onSubmit={handleCadastro}
            className="space-y-5"
          >

            <div>
              <label htmlFor="nome" className={labelStyle}>
                Nome completo
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite seu nome completo"
                minLength={4}
                maxLength={255}
                autoComplete="name"
                required
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label htmlFor="cpf" className={labelStyle}>
                  CPF
                </label>

                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) =>
                    setCpf(formatarCpf(e.target.value))
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="dataNascimento"
                  className={labelStyle}
                >
                  Data de nascimento
                </label>

                <input
                  id="dataNascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) =>
                    setDataNascimento(e.target.value)
                  }
                  max={new Date().toLocaleDateString("en-CA")}
                  required
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelStyle}>
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                maxLength={255}
                autoComplete="email"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="sexo" className={labelStyle}>
                Sexo
              </label>

              <select
                id="sexo"
                value={sexo}
                onChange={(e) =>
                  setSexo(e.target.value as Sexo)
                }
                required
                className={inputStyle}
              >
                <option value="">Selecione uma opção</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="senha"
                  className={labelStyle}
                >
                  Senha
                </label>

                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  minLength={8}
                  maxLength={255}
                  autoComplete="new-password"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="senhaConfirm"
                  className={labelStyle}
                >
                  Confirmar senha
                </label>

                <input
                  id="senhaConfirm"
                  type="password"
                  value={senhaConfirm}
                  onChange={(e) =>
                    setSenhaConfirm(e.target.value)
                  }
                  placeholder="Confirme sua senha"
                  minLength={8}
                  maxLength={255}
                  autoComplete="new-password"
                  required
                  className={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 shadow-sm transition-all duration-200 hover:bg-yellow-300 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
                  Cadastrando...
                </>
              ) : (
                <>
                  Criar minha conta
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">
              OU
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="font-bold text-neutral-950 underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors hover:text-yellow-600"
              >
                Entrar
              </Link>
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}