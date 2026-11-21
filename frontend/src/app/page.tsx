import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Dumbbell,
  Eye,
  GraduationCap,
  HeartHandshake,
  Moon,
  Target,
  Utensils,
} from "lucide-react";

export const metadata: Metadata = {
  title: "NutriHub | Alimentação, treino e descanso",
  description:
    "Organize refeições, treinos e horários de descanso em uma rotina semanal que faça sentido para você.",
};

const exemploRotina = [
  { horario: "07:30", atividade: "Café da manhã", categoria: "Alimentação", Icone: Utensils },
  { horario: "18:00", atividade: "Treino de musculação", categoria: "Atividade física", Icone: Dumbbell },
  { horario: "22:30", atividade: "Hora de dormir", categoria: "Descanso", Icone: Moon },
];

const recursos = [
  {
    titulo: "Planeje suas refeições",
    descricao: "Organize as refeições da semana considerando seus horários, preferências e restrições alimentares.",
    Icone: Utensils,
  },
  {
    titulo: "Organize seus treinos",
    descricao: "Distribua seus treinos de musculação pela semana de acordo com sua disponibilidade e seus objetivos.",
    Icone: Dumbbell,
  },
  {
    titulo: "Reserve tempo para descansar",
    descricao: "Inclua os horários de dormir e acordar no mesmo planejamento das refeições e dos treinos.",
    Icone: Moon,
  },
];

const principios = [
  {
    titulo: "Missão",
    descricao: "Facilitar o planejamento de refeições, treinos e descanso em uma rotina que se adapte ao dia a dia de cada pessoa.",
    Icone: Target,
  },
  {
    titulo: "Visão",
    descricao: "Tornar o planejamento integrado da alimentação e da atividade física mais acessível para quem quer organizar seus hábitos.",
    Icone: Eye,
  },
  {
    titulo: "Valores",
    descricao: "Simplicidade no uso, respeito às preferências e restrições de cada pessoa e autonomia para organizar a própria rotina.",
    Icone: HeartHandshake,
  },
];

const linkFoco =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500";

export default function InicioPage() {
  return (
    <main className="bg-[#F7F7F2] text-neutral-950">
      <section aria-labelledby="inicio-titulo" className="relative isolate overflow-hidden bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.20),transparent_55%)]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-10">
          <div>
            <h1 id="inicio-titulo" className="max-w-2xl text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
              Sua rotina, <span className="block text-yellow-400">no seu ritmo.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-300">
              Planeje refeições, treinos e horários de descanso em um só lugar, de acordo com seus objetivos e com o tempo que você tem.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/cadastro" className={`rounded-xl bg-yellow-400 px-5 py-3 font-bold text-neutral-950 transition-colors hover:bg-yellow-300 ${linkFoco}`}>
                Criar conta
              </Link>
              <Link href="#sobre-nos" className={`rounded-xl border border-white/30 px-5 py-3 font-bold text-white transition-colors hover:bg-white/10 ${linkFoco}`}>
                Sobre nós
              </Link>
            </div>
          </div>

          <figure className="rounded-3xl border border-white/15 bg-neutral-900 p-4 shadow-2xl sm:p-6">
            <figcaption className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow-400 text-neutral-950">
                <CalendarDays size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm text-neutral-300">Exemplo de rotina</span>
                <span className="block text-lg font-bold">Segunda-feira</span>
              </span>
            </figcaption>
            <ul className="space-y-2">
              {exemploRotina.map(({ horario, atividade, categoria, Icone }) => (
                <li key={horario} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-4">
                  <time dateTime={horario} className="text-sm font-semibold tabular-nums text-yellow-300">{horario}</time>
                  <Icone size={19} className="shrink-0 text-neutral-300" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{atividade}</p>
                    <p className="text-sm text-neutral-300">{categoria}</p>
                  </div>
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </section>

      <section aria-labelledby="recursos-titulo" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <h2 id="recursos-titulo" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          O que você pode organizar
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {recursos.map(({ titulo, descricao, Icone }) => (
            <div key={titulo} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <Icone size={24} className="text-amber-700" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold">{titulo}</h3>
              <p className="mt-2 leading-relaxed text-neutral-700">{descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="sobre-nos" aria-labelledby="sobre-titulo" className="scroll-mt-20 border-y border-yellow-200 bg-yellow-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[2fr_1fr] lg:items-center lg:px-10">
          <div>
            <h2 id="sobre-titulo" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Sobre nós</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-700">
              O NutriHub nasceu para resolver um problema do dia a dia. Quando refeições, treinos e horários ficam espalhados por planilhas e aplicativos, é mais difícil ter uma visão da semana. Criamos um espaço para reunir essas informações e ajustar o planejamento conforme a rotina muda.
            </p>
          </div>
          <div className="rounded-2xl border border-yellow-200 bg-white p-6">
            <GraduationCap size={26} className="text-amber-700" aria-hidden="true" />
            <p className="mt-3 font-bold">Projeto acadêmico da UFES</p>
            <p className="mt-1 leading-relaxed text-neutral-700">
              Desenvolvido no campus de São Mateus para a disciplina de Projeto de Sistemas de Software.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="mvv-titulo" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <h2 id="mvv-titulo" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Missão, visão e valores
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {principios.map(({ titulo, descricao, Icone }) => (
            <div key={titulo} className="border-t-2 border-yellow-400 pt-5">
              <div className="flex items-center gap-3">
                <Icone size={21} className="text-amber-700" aria-hidden="true" />
                <h3 className="text-lg font-bold">{titulo}</h3>
              </div>
              <p className="mt-3 max-w-sm leading-relaxed text-neutral-700">{descricao}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
