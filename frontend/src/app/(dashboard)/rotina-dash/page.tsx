import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Dumbbell, Moon, Utensils } from "lucide-react";

export const metadata: Metadata = {
  title: "Rotina semanal | NutriHub",
  description:
    "Veja como organizar refeições, musculação e horários de sono em uma rotina semanal no NutriHub.",
};

const atividades = [
  { titulo: "Alimentação", Icone: Utensils, estilo: "bg-amber-100 text-amber-900" },
  { titulo: "Treino", Icone: Dumbbell, estilo: "bg-neutral-900 text-white" },
  { titulo: "Sono", Icone: Moon, estilo: "bg-indigo-100 text-indigo-900" },
] as const;

const diasExemplo = [
  { nome: "Segunda", horarios: ["07:30 · Café da manhã", "18:00 · Superiores", "22:30 · Dormir"] },
  { nome: "Terça", horarios: ["07:30 · Café da manhã", "Dia sem treino", "22:30 · Dormir"] },
  { nome: "Quarta", horarios: ["07:30 · Café da manhã", "18:00 · Inferiores", "22:30 · Dormir"] },
];

const etapas = [
  { titulo: "Objetivos", descricao: "Defina seu objetivo e como prefere dividir os treinos." },
  { titulo: "Treinos", descricao: "Escolha os dias e os horários em que pode treinar." },
  { titulo: "Sono", descricao: "Informe quando costuma dormir e acordar em cada dia." },
  { titulo: "Restrições", descricao: "Indique as restrições alimentares que se aplicam a você." },
  { titulo: "Alimentos", descricao: "Selecione os alimentos que gostaria de incluir no planejamento." },
];

const foco =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600";

export default function RotinaDashboardPage() {
  return (
    <main className="bg-[#F7F7F2] text-neutral-950">
      <section aria-labelledby="rotina-titulo" className="border-b border-yellow-200 bg-yellow-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-16">
          <div>
            <CalendarDays size={32} className="mb-5 text-amber-800" aria-hidden="true" />
            <h1 id="rotina-titulo" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Sua rotina semanal
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-700">
              Veja como refeições, treinos e horários de sono se encaixam na mesma agenda. Monte seu planejamento a partir do tempo que você tem e dos hábitos que quer manter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/rotina"
              className={`rounded-xl bg-yellow-400 px-5 py-3 font-bold transition-colors hover:bg-yellow-300 ${foco}`}
            >
              Abrir minha rotina
            </Link>
            <Link href="/login" className={`rounded font-semibold underline underline-offset-4 ${foco}`}>
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="agenda-titulo" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h2 id="agenda-titulo" className="text-3xl font-extrabold tracking-tight">
          Exemplo de agenda
        </h2>
        <p className="mt-2 text-neutral-700">
          Um recorte de três dias para mostrar como o planejamento fica organizado.
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {diasExemplo.map(({ nome, horarios }) => (
            <li key={nome} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <h3 className="bg-neutral-950 px-5 py-3 text-lg font-bold text-white">{nome}</h3>
              <dl className="divide-y divide-neutral-100 px-5">
                {atividades.map(({ titulo, Icone, estilo }, indice) => (
                  <div key={titulo} className="relative py-3 pl-12">
                    <dt className="text-sm font-medium text-neutral-600">
                      <span className={`absolute left-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg ${estilo}`} aria-hidden="true">
                        <Icone size={17} />
                      </span>
                      {titulo}
                    </dt>
                    <dd className="font-semibold tabular-nums">{horarios[indice]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="etapas-titulo" className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_2fr] lg:px-10">
          <div>
            <h2 id="etapas-titulo" className="text-3xl font-extrabold tracking-tight">
              Como montar sua rotina
            </h2>
            <p className="mt-3 max-w-sm leading-relaxed text-neutral-700">
              Em <strong>Minha rotina</strong>, você preenche cinco etapas para gerar sua agenda. Depois, pode consultar ou editar o planejamento conforme sua semana mudar.
            </p>
          </div>
          <ol className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 px-4 sm:px-6">
            {etapas.map(({ titulo, descricao }, indice) => (
              <li key={titulo} className="flex items-start gap-3 py-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-yellow-100 font-bold text-amber-900" aria-hidden="true">
                  {indice + 1}
                </span>
                <div>
                  <h3 className="font-bold">{titulo}</h3>
                  <p className="mt-1 text-neutral-700">{descricao}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
