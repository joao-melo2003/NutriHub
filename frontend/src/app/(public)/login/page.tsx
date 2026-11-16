
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/services/usuarioService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {

      await login(email.trim(), senha);
      router.push("/dashboard");

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o login."
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F6F2] px-4 py-10">

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-yellow-400/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">

        <div className="h-2 w-full bg-yellow-400" />

        <div className="px-6 py-10 sm:px-10 sm:py-12">

          <header className="mb-9 text-center">

            <div className="mb-6 flex items-center justify-center gap-3">

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
                Nutri
                <span className="text-yellow-500">Hub</span>
              </h1>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Bem-vindo de volta!
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Entre na sua conta para continuar sua jornada.
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
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                E-mail
              </label>

              <div className="relative">

                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neutral-400"
                  >
                    <rect
                      width="20"
                      height="16"
                      x="2"
                      y="4"
                      rx="2"
                    />
                    <path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  autoComplete="email"
                  maxLength={255}
                  required
                  className={`${inputStyle} pl-12`}
                />
              </div>
            </div>

            <div>

              <div className="mb-2 flex items-center justify-between gap-3">

                <label
                  htmlFor="senha"
                  className="text-sm font-medium text-neutral-800"
                >
                  Senha
                </label>

                <Link
                  href="/esqueci-senha"
                  className="text-xs font-semibold text-yellow-600 transition-colors hover:text-yellow-700 hover:underline"
                >
                  Esqueceu a senha?
                </Link>

              </div>

              <div className="relative">

                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neutral-400"
                  >
                    <rect
                      width="18"
                      height="11"
                      x="3"
                      y="11"
                      rx="2"
                    />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>

                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                  className={`${inputStyle} pl-12 pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  aria-pressed={mostrarSenha}
                  className="absolute inset-y-0 right-4 flex items-center text-neutral-400 transition-colors hover:text-neutral-700"
                >
                  {mostrarSenha ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 3 18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a15.1 15.1 0 0 1-4.07 5.03" />
                      <path d="M6.61 6.61C3.62 8.31 2 12 2 12s3 7 10 7a10.4 10.4 0 0 0 4.23-.85" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>

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
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na minha conta
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">
              OU
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              Ainda não possui uma conta?{" "}
              <Link
                href="/cadastro"
                className="font-bold text-neutral-950 underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors hover:text-yellow-600"
              >
                Cadastre-se
              </Link>
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
