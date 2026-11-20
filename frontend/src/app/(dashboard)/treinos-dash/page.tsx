import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowDown, ArrowRight, Dumbbell, Footprints } from "lucide-react";
import { DIVISOES } from "@/app/rotina/forms/formUtils";

export const metadata: Metadata = {
  title: "Treinos | NutriHub",
  description: "Conheça as divisões de treino e os grupos musculares usados na sua rotina.",
};

const guias = {
  ABC: {
    descricao: "Distribui o treino em três sessões, cada uma com foco em uma região do corpo.",
    sessoes: ["Superiores", "Inferiores", "Abdômen"],
  },
  FULL_BODY: {
    descricao: "Trabalha os principais grupos musculares do corpo na mesma sessão.",
    sessoes: ["Superiores, inferiores e abdômen"],
  },
  UPPER_LOWER: {
    descricao: "Alterna uma sessão para membros superiores com outra para membros inferiores.",
    sessoes: ["Superiores", "Inferiores"],
  },
  PUSH_PULL_LEGS: {
    descricao: "Organiza o treino em movimentos de empurrar, movimentos de puxar e exercícios de pernas.",
    sessoes: ["Empurrar (peito, ombros e tríceps)", "Puxar (costas e bíceps)", "Pernas"],
  },
  ABCDE: {
    descricao: "Divide a sequência em cinco sessões, com um grupo muscular em destaque em cada uma.",
    sessoes: ["Peito", "Costas", "Pernas", "Ombros", "Braços"],
  },
} satisfies Record<(typeof DIVISOES)[number]["value"], { descricao: string; sessoes: string[] }>;

const grupos = [
  {
    nome: "Membros superiores",
    musculos: "Peito, costas, ombros, bíceps e tríceps",
    exemplos: "Flexão de braços e remada com halter",
    icone: Dumbbell,
  },
  {
    nome: "Membros inferiores",
    musculos: "Quadríceps, posteriores da coxa, glúteos e panturrilhas",
    exemplos: "Agachamento e elevação de panturrilhas",
    icone: Footprints,
  },
  {
    nome: "Abdômen e core",
    musculos: "Reto abdominal, oblíquos e outros estabilizadores do tronco",
    exemplos: "Prancha frontal e prancha lateral",
    icone: Activity,
  },
];

export default function TreinosPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 text-neutral-950 sm:px-8 sm:py-12 lg:px-10">
      <section
        aria-labelledby="titulo-treinos"
        className="grid overflow-hidden rounded-3xl bg-neutral-950 text-white md:grid-cols-2"
      >
        <div className="flex flex-col items-start justify-center p-7 sm:p-12">
          <h1 id="titulo-treinos" className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Guia de treinos
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-neutral-300 sm:text-lg">
            Veja como cada divisão organiza as sessões e quais músculos entram em cada grupo.
          </p>
          <a
            href="#divisoes"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-neutral-950 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
          >
            Comparar divisões
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="relative aspect-[3/2] md:aspect-auto md:min-h-96">
          <Image
            src="/treinos/remada.webp"
            alt="Pessoa fazendo remada unilateral com halter, apoiada em um banco"
            fill
            priority
            sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section id="divisoes" aria-labelledby="titulo-divisoes" className="mt-12 scroll-mt-28 sm:mt-16">
        <h2 id="titulo-divisoes" className="text-3xl font-extrabold tracking-tight">
          Divisões de treino
        </h2>
        <p className="mt-2 max-w-2xl leading-7 text-neutral-700">
          Estes exemplos mostram a sequência balanceada do NutriHub. As prioridades musculares
          da sua rotina podem mudar a ordem ou o foco das sessões.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIVISOES.map(({ value, label }) => {
            const { descricao, sessoes } = guias[value];

            return (
              <article key={value} className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-bold leading-snug">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{descricao}</p>
                <ol aria-label="Sequência de sessões" className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                  {sessoes.map((sessao, indice) => (
                    <li key={sessao} className="flex items-start gap-2 text-sm leading-6 text-neutral-800">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-yellow-100 text-xs font-bold"
                      >
                        {String.fromCharCode(65 + indice)}
                      </span>
                      {sessao}
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="titulo-grupos" className="mt-12 sm:mt-16">
        <h2 id="titulo-grupos" className="text-3xl font-extrabold tracking-tight">
          Grupos musculares
        </h2>
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
          <figure className="overflow-hidden rounded-2xl bg-neutral-950 text-white">
            <div className="relative aspect-[3/2]">
              <Image
                src="/treinos/prancha.webp"
                alt="Pessoa mantendo o corpo alinhado em uma prancha sobre os antebraços"
                fill
                sizes="(min-width: 1280px) 590px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="px-5 py-3 text-sm">Prancha frontal, um exercício para o core.</figcaption>
          </figure>
          <ul className="grid gap-3">
            {grupos.map(({ nome, musculos, exemplos, icone: Icone }) => (
              <li key={nome} className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                  <Icone size={21} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{nome}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-700">{musculos}</p>
                  <p className="text-sm leading-6 text-neutral-700">
                    <span className="font-semibold">Exemplos </span>· {exemplos}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/rotina"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-500"
        >
          Acessar minha rotina
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
