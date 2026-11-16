
"use client";

import { useRouter } from "next/navigation";

export default function CadastroSucessoPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F6F2] px-4 py-10">

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-yellow-400/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">

        <div className="h-2 w-full bg-yellow-400" />

        <div className="px-6 py-10 sm:px-10">

          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="42"
                height="42"
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

          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Cadastro realizado com sucesso!
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Sua conta foi criada com sucesso.
              Enviamos um link de confirmação para o seu e-mail.
            </p>
          </div>

          <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

            <div className="flex items-start gap-3">

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
                className="mt-0.5 shrink-0 text-yellow-600"
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

              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Confirme seu e-mail
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  Acesse sua caixa de entrada e clique no link
                  de confirmação para ativar sua conta antes
                  de realizar o login.
                </p>
              </div>

            </div>
          </div>

          <div className="space-y-3">

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-all duration-200 hover:bg-yellow-300 hover:shadow-md active:scale-[0.99]"
            >
              Ir para login
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/cadastro")}
              className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3.5 text-sm font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50"
            >
              Voltar ao cadastro
            </button>

          </div>

          <p className="mt-7 text-center text-xs text-neutral-400">
            Não encontrou o e-mail? Verifique sua pasta de spam.
          </p>

        </div>
      </section>
    </main>
  );
}
