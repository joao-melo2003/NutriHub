
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/usuarioService";

export default function EsqueciSenhaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setSucesso(false);
    setLoading(true);

    try {
      await forgotPassword(email.trim());

      setSucesso(true);

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível solicitar a recuperação de senha."
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

          <header className="mb-8 text-center">

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

            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-yellow-600"
                >
                  <circle cx="7.5" cy="15.5" r="5.5" />
                  <path d="m21 2-9.6 9.6" />
                  <path d="m15.5 7.5 3 3L22 7l-3-3" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Esqueceu sua senha?
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Informe seu e-mail cadastrado e enviaremos
              um link para redefinir sua senha.
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

          {sucesso ? (
            <div className="space-y-6">

              <div
                role="status"
                className="rounded-xl border border-yellow-200 bg-yellow-50 p-5"
              >
                <div className="mb-3 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-yellow-700"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </div>

                  <h3 className="font-semibold text-neutral-900">
                    Solicitação realizada!
                  </h3>
                </div>

                <p className="text-sm leading-relaxed text-neutral-600">
                  Se o e-mail informado estiver associado
                  a uma conta elegível, você receberá um link
                  para redefinir sua senha.
                </p>

                <p className="mt-3 text-xs text-neutral-500">
                  Verifique também sua pasta de spam.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-all duration-200 hover:bg-yellow-300 hover:shadow-md active:scale-[0.99]"
              >
                Voltar para o login
              </button>

              <button
                type="button"
                onClick={() => setSucesso(false)}
                className="w-full text-center text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Tentar novamente
              </button>

            </div>
          ) : (

            <form
              onSubmit={handleForgotPassword}
              className="space-y-6"
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

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 shadow-sm transition-all duration-200 hover:bg-yellow-300 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar link de recuperação
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
              >
                <span>←</span>
                Voltar para o login
              </button>

            </form>
          )}

        </div>
      </section>
    </main>
  );
}
