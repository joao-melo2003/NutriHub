import Link from "next/link";
import {
    Activity,
    ArrowRight,
    CalendarDays,
    Dumbbell,
    HeartPulse,
    Leaf,
    ShieldCheck,
    UtensilsCrossed,
    UsersRound,
} from "lucide-react";

const marcasDemonstrativas = [
    "Growth Supplements",
    "Max Titanium",
    "Integralmédica",
    "DUX Nutrition",
];

const linksPlataforma = [
    { nome: "Início", href: "/" },
    { nome: "Dieta", href: "/dieta" },
    { nome: "Treinos", href: "/treinos" },
    { nome: "Minha rotina", href: "/rotina" },
];

const linksConta = [
    { nome: "Entrar", href: "/login" },
    { nome: "Criar conta", href: "/cadastro" },
];

export default function Footer() {
    return (
        <footer className="w-full bg-neutral-950 text-neutral-100">
            <div className="bg-yellow-400 text-neutral-950">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
                    <div>
                        <p className="text-lg font-extrabold tracking-tight sm:text-xl">
                            Uma rotina saudável começa com organização.
                        </p>
                        <p className="mt-1 text-sm text-neutral-800">
                            Planeje seus treinos, refeições e horários de descanso.
                        </p>
                    </div>

                    <Link
                        href="/rotina"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-neutral-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        Acessar minha rotina
                        <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
                <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4">
                        <Link
                            href="/"
                            aria-label="NutriHub — voltar ao início"
                            className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-neutral-950">
                                <Activity size={27} strokeWidth={2.5} aria-hidden="true" />
                            </span>
                            <span className="text-3xl font-extrabold tracking-tight">
                                Nutri<span className="text-yellow-400">Hub</span>
                            </span>
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-400">
                            Um espaço para organizar alimentação, atividades físicas e
                            descanso de forma simples, em uma única rotina semanal.
                        </p>
                    </div>

                    <nav aria-label="Links da plataforma" className="lg:col-span-2">
                        <h2 className="mb-5 text-sm font-bold text-white">Plataforma</h2>
                        <ul className="space-y-3">
                            {linksPlataforma.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-neutral-400 transition-colors hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                                    >
                                        {link.nome}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Links de acesso" className="lg:col-span-2">
                        <h2 className="mb-5 text-sm font-bold text-white">Minha conta</h2>
                        <ul className="space-y-3">
                            {linksConta.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-neutral-400 transition-colors hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                                    >
                                        {link.nome}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <section id="nutricionistas" aria-labelledby="nutricionistas-titulo" className="lg:col-span-4">
                        <div className="mb-4 flex items-center gap-2">
                            <UsersRound size={19} className="text-yellow-400" aria-hidden="true" />
                            <h2 id="nutricionistas-titulo" className="text-sm font-bold text-white">
                                Nutricionistas
                            </h2>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200">
                                <Dumbbell size={14} className="text-yellow-400" aria-hidden="true" />
                                Nutrição esportiva
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200">
                                <UtensilsCrossed size={14} className="text-yellow-400" aria-hidden="true" />
                                Planejamento alimentar
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200">
                                <HeartPulse size={14} className="text-yellow-400" aria-hidden="true" />
                                Educação nutricional
                            </span>
                        </div>
                    </section>
                </div>

                <section className="border-t border-white/10 py-8" aria-labelledby="marcas-titulo">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2">
                                <Leaf size={18} className="text-yellow-400" aria-hidden="true" />
                                <h2 id="marcas-titulo" className="text-sm font-bold text-white">
                                    Patrocinadores · Simulação acadêmica
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Marcas ilustrativas">
                            {marcasDemonstrativas.map((marca) => (
                                <div
                                    key={marca}
                                    className="flex min-h-14 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-xs font-extrabold tracking-wide text-neutral-200 transition-colors hover:border-yellow-400/50 hover:bg-yellow-400/10 sm:text-sm"
                                >
                                    {marca}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} NutriHub.</p>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck size={15} className="text-yellow-400" aria-hidden="true" />
                            Conteúdo auxiliar, não substitui orientação profissional.
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} className="text-yellow-400" aria-hidden="true" />
                            Organização de hábitos e rotina
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
