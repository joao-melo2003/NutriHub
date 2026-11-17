"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Apple, ShieldAlert, UsersRound } from "lucide-react";

const secoes = [
    {
        titulo: "Gerenciar usuários",
        descricao: "Consulte contas, visualize informações e gerencie banimentos.",
        rota: "/admin/usuarios",
        Icone: UsersRound,
    },
    {
        titulo: "Gerenciar alimentos",
        descricao: "Organize os alimentos e suas informações nutricionais.",
        rota: "/admin/alimentos",
        Icone: Apple,
    },
    {
        titulo: "Gerenciar restrições",
        descricao: "Administre restrições e classificações alimentares.",
        rota: "/admin/restricoes",
        Icone: ShieldAlert,
    },
];

export default function AdminPage() {
    const router = useRouter();

    return (
        <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#F6F6F2] px-4 py-12 sm:px-6">
            <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-yellow-300/20 blur-3xl" />

            <section className="relative z-10 mx-auto w-full max-w-6xl">
                <header className="mb-10 text-center">
                    <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-yellow-800">
                        Painel administrativo
                    </span>
                    <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
                        Gerenciar <span className="text-yellow-500">NutriHub</span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
                        Escolha o que deseja administrar.
                    </p>
                </header>

                <div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3">
                    {secoes.map(({ titulo, descricao, rota, Icone }) => (
                        <button
                            key={rota}
                            type="button"
                            onClick={() => router.push(rota)}
                            className="group flex aspect-square w-full max-w-[320px] flex-col items-start justify-between rounded-[28px] border border-neutral-200 bg-white p-7 text-left shadow-[0_14px_50px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-yellow-400 hover:shadow-[0_20px_55px_rgba(0,0,0,0.11)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
                        >
                            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700 transition-colors group-hover:bg-yellow-400 group-hover:text-neutral-950">
                                <Icone size={30} strokeWidth={1.9} />
                            </span>
                            <span className="block">
                                <span className="block text-xl font-extrabold text-neutral-950">{titulo}</span>
                                <span className="mt-3 block text-sm leading-6 text-neutral-500">{descricao}</span>
                            </span>
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-neutral-900">
                                Acessar <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </span>
                        </button>
                    ))}
                </div>
            </section>
        </main>
    );
}
