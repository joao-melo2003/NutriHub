
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmEmail } from "@/services/usuarioService";

type Status = "loading" | "sucesso" | "erro";

type ConfirmacaoResponse = {
  message?: string;
  success?: boolean;
};

function ConfirmarEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [mensagem, setMensagem] = useState("");

  const requisicaoRef = useRef<{
    token: string;
    promise: Promise<ConfirmacaoResponse>;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setMensagem("Token de confirmação não encontrado.");
      setStatus("erro");
      return;
    }

    let ativo = true;

    setStatus("loading");
    setMensagem("");

    if (requisicaoRef.current?.token !== token) {
      requisicaoRef.current = {
        token,
        promise: confirmEmail(token),
      };
    }

    const requisicao = requisicaoRef.current.promise;

    requisicao
      .then((response) => {
        if (!ativo) return;

        const resposta = response as ConfirmacaoResponse | string;

        const mensagemBackend =
          typeof resposta === "string"
            ? resposta
            : resposta?.message;

        setMensagem(
          mensagemBackend ||
            "Sua conta foi validada com sucesso! Agora você pode construir sua rotina."
        );

        setStatus("sucesso");
      })
      .catch((error) => {
        if (!ativo) return;

        setMensagem(
          error instanceof Error
            ? error.message
            : "Não foi possível confirmar seu e-mail."
        );

        setStatus("erro");
      });

    return () => {

      ativo = false;
    };
  }, [token]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F6F2] px-4 py-10">

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-yellow-400/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.07)]">

        <div className="h-2 w-full bg-yellow-400" />

        <div className="px-6 py-10 sm:px-10 sm:py-12">

          <div className="mb-8 flex items-center justify-center gap-3">

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

          <div
            className="flex flex-col items-center text-center"
            role="status"
            aria-live="polite"
          >

            {status === "loading" && (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-600" />
                </div>

                <h2 className="text-2xl font-bold text-neutral-900">
                  Confirmando seu e-mail...
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  Estamos validando seu link de confirmação.
                </p>
              </>
            )}

            {status === "sucesso" && (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">

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

                <h2 className="text-2xl font-bold text-neutral-900">
                  E-mail confirmado!
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  {mensagem}
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-all duration-200 hover:bg-yellow-300 hover:shadow-md active:scale-[0.99]"
                >
                  Ir para login
                  <span>→</span>
                </button>
              </>
            )}

            {status === "erro" && (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">

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
                    className="text-red-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6" />
                    <path d="m9 9 6 6" />
                  </svg>

                </div>

                <h2 className="text-2xl font-bold text-neutral-900">
                  Não foi possível confirmar
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                  Ocorreu um problema ao validar seu e-mail.
                </p>

                <div
                  role="alert"
                  className="mt-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {mensagem}
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-6 w-full rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-neutral-950 transition-all duration-200 hover:bg-yellow-300 hover:shadow-md"
                >
                  Voltar para login
                </button>
              </>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F6F6F2]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
        </main>
      }
    >
      <ConfirmarEmailContent />
    </Suspense>
  );
}
