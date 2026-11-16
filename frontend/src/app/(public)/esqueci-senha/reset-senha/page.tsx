
"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/services/usuarioService";

function ResetarSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const token = searchParams.get("token") ?? "";

  const [novaSenha, setNovaSenha] = useState("");
  const [novaSenhaConfirm, setNovaSenhaConfirm] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErro("");

    if (!token) {
      setErro("Token de recuperação não encontrado.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A senha deve conter no mínimo 8 caracteres.");
      return;
    }

    const senhaValida =
      /[A-Z]/.test(novaSenha) &&
      /[0-9]/.test(novaSenha) &&
      /[^A-Za-z0-9]/.test(novaSenha);

    if (!senhaValida) {
      setErro(
        "A senha deve conter uma letra maiúscula, um número e um símbolo."
      );
      return;
    }

    if (novaSenha !== novaSenhaConfirm) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(
        token,
        novaSenha,
        novaSenhaConfirm
      );

      setNovaSenha("");
      setNovaSenhaConfirm("");

      setSucesso(true);

      window.history.replaceState(
        null,
        "",
        "/resetar-senha"
      );

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir sua senha."
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

            {!sucesso ? (
              <>
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
                      <rect
                        width="18"
                        height="11"
                        x="3"
                        y="11"
                        rx="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      <circle cx="12" cy="16" r="1" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Redefinir sua senha
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  Crie uma nova senha segura para acessar sua conta.
                </p>
              </>
            ) : (
              <>
                <div className="mb-5 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-yellow-600"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m8 12 3 3 5-6" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-neutral-900">
                  Senha redefinida!
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  Sua senha foi alterada com sucesso.
                  Agora você pode entrar usando sua nova senha.
                </p>
              </>
            )}

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
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-all duration-200 hover:bg-yellow-300 hover:shadow-md"
            >
              Ir para login →
            </button>
          ) : !token ? (

            <div className="space-y-5">

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
                <p className="text-sm font-semibold text-neutral-900">
                  Link de recuperação inválido
                </p>

                <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                  O link não contém um token de recuperação.
                  Solicite um novo link para redefinir sua senha.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/esqueci-senha")}
                className="w-full rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-all hover:bg-yellow-300"
              >
                Solicitar novo link
              </button>
            </div>

          ) : (

            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >

              <div>
                <label
                  htmlFor="novaSenha"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Nova senha
                </label>

                <div className="relative">

                  <input
                    id="novaSenha"
                    type={mostrarSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={255}
                    required
                    className={`${inputStyle} pr-12`}
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
                    className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-neutral-700"
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

              <div>
                <label
                  htmlFor="novaSenhaConfirm"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Confirmar nova senha
                </label>

                <div className="relative">

                  <input
                    id="novaSenhaConfirm"
                    type={mostrarConfirmacao ? "text" : "password"}
                    value={novaSenhaConfirm}
                    onChange={(e) =>
                      setNovaSenhaConfirm(e.target.value)
                    }
                    placeholder="Confirme sua nova senha"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={255}
                    required
                    className={`${inputStyle} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarConfirmacao(!mostrarConfirmacao)
                    }
                    aria-label={
                      mostrarConfirmacao
                        ? "Ocultar confirmação"
                        : "Mostrar confirmação"
                    }
                    aria-pressed={mostrarConfirmacao}
                    className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-neutral-700"
                  >
                    {mostrarConfirmacao ? (
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

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">

                <p className="mb-2 text-xs font-semibold text-yellow-800">
                  Sua senha deve conter:
                </p>

                <ul className="space-y-1 text-xs text-neutral-600">
                  <li>• No mínimo 8 caracteres</li>
                  <li>• Pelo menos uma letra maiúscula</li>
                  <li>• Pelo menos um número</li>
                  <li>• Pelo menos um símbolo</li>
                </ul>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-all duration-200 hover:bg-yellow-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
                    Redefinindo...
                  </>
                ) : (
                  <>Redefinir senha →</>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
              >
                ← Voltar para o login
              </button>

            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ResetarSenhaPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F2]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
      </main>
    }>
      <ResetarSenhaContent />
    </Suspense>
  );
}
