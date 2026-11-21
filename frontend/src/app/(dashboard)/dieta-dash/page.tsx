import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  Brain,
  HeartPulse,
  Scale,
  ShieldCheck,
  Zap,
  Moon,
} from "lucide-react";
import DietaSlider, { type SlideDieta } from "@/components/dieta-slider";

export const metadata: Metadata = {
  title: "Dieta | NutriHub",
  description: "Entenda por que manter uma dieta equilibrada é importante e quais são os seus benefícios.",
};

const slides: SlideDieta[] = [
  {
    src: "/dieta/prato-equilibrado.jpg",
    alt: "Prato com ovo cozido, abacate, tomate, folhas verdes e rabanete sobre uma mesa de madeira",
    titulo: "Prato equilibrado",
    texto: "Combine proteínas, gorduras boas, legumes e verduras para obter nutrientes variados em cada refeição.",
  },
  {
    src: "/dieta/bowl-colorido.jpg",
    alt: "Bowl com abacate, tomate, grão-de-bico, batata-doce, repolho roxo e folhas",
    titulo: "Quanto mais cores, melhor",
    texto: "Alimentos de cores diferentes trazem vitaminas, minerais e antioxidantes distintos.",
  },
  {
    src: "/dieta/variedade-vegetais.jpg",
    alt: "Mesa com vários recipientes de vegetais, leguminosas e grãos",
    titulo: "Variedade no dia a dia",
    texto: "Vegetais, leguminosas e fibras ajudam a manter a saciedade e a saúde do intestino.",
  },
  {
    src: "/dieta/refeicao-proteina.jpg",
    alt: "Marmita com tofu grelhado, milho, tomate, repolho roxo e folhas verdes",
    titulo: "Proteína em qualquer refeição",
    texto: "Fontes de proteína, de origem animal ou vegetal, apoiam a recuperação e a manutenção dos músculos.",
  },
];

const importancia = [
  "Fornece a energia e os nutrientes que o corpo precisa para funcionar bem.",
  "Ajuda a prevenir doenças crônicas, como diabetes tipo 2, hipertensão e doenças do coração.",
  "Apoia seus objetivos, seja emagrecer, ganhar massa muscular ou manter o peso.",
  "Cria hábitos que se mantêm ao longo do tempo, ao contrário de soluções temporárias.",
];

const beneficios = [
  {
    titulo: "Mais energia",
    texto: "Refeições equilibradas mantêm a glicose estável e reduzem a sensação de cansaço ao longo do dia.",
    icone: Zap,
  },
  {
    titulo: "Saúde do coração",
    texto: "Menos sódio e gorduras ruins e mais fibras ajudam a controlar pressão e colesterol.",
    icone: HeartPulse,
  },
  {
    titulo: "Controle de peso",
    texto: "Comer bem e na quantidade adequada facilita alcançar e manter um peso saudável.",
    icone: Scale,
  },
  {
    titulo: "Imunidade mais forte",
    texto: "Vitaminas e minerais, como C, D e zinco, contribuem para as defesas do organismo.",
    icone: ShieldCheck,
  },
  {
    titulo: "Foco e humor",
    texto: "Uma alimentação de qualidade está associada a melhor concentração, memória e bem-estar emocional.",
    icone: Brain,
  },
  {
    titulo: "Sono melhor",
    texto: "Refeições regulares e leves à noite tendem a favorecer um sono mais reparador.",
    icone: Moon,
  },
];

export default function DietaPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 text-neutral-950 sm:px-8 sm:py-12 lg:px-10">
      <section
        aria-labelledby="titulo-dieta"
        className="grid overflow-hidden rounded-3xl bg-neutral-950 text-white md:grid-cols-2"
      >
        <div className="flex flex-col items-start justify-center p-7 sm:p-12">
          <h1 id="titulo-dieta" className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Guia de dieta
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-neutral-300 sm:text-lg">
            Entenda por que comer bem faz diferença na sua saúde, no seu desempenho e na sua rotina.
          </p>
          <a
            href="#galeria"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-neutral-950 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
          >
            Ver exemplos
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="relative aspect-[3/2] md:aspect-auto md:min-h-96">
          <Image
            src="/dieta/prato-equilibrado.jpg"
            alt="Prato colorido com ovo, abacate, tomate e folhas verdes"
            fill
            priority
            sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section id="galeria" aria-labelledby="titulo-galeria" className="mt-12 scroll-mt-28 sm:mt-16">
        <h2 id="titulo-galeria" className="text-3xl font-extrabold tracking-tight">
          Comer bem na prática
        </h2>
        <p className="mt-2 max-w-2xl leading-7 text-neutral-700">
          Veja ideias de refeições variadas e coloridas. Passe os slides para conhecer cada uma.
        </p>
        <div className="mt-6">
          <DietaSlider slides={slides} />
        </div>
      </section>

      <section aria-labelledby="titulo-importancia" className="mt-12 sm:mt-16">
        <div className="flex justify-center align-middle">
          <h2 id="titulo-importancia" className="text-3xl font-extrabold tracking-tight align">
          Por que ter uma dieta é importante
        </h2>
        </div>
        <p className="mt-2 leading-7 text-neutral-700">
          Dieta, aqui, não significa passar fome. É o conjunto de alimentos que você consome no dia a dia,
          e escolher bem esse conjunto é um dos pilares da saúde, junto com atividade física e sono.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {importancia.map((item) => (
            <li
              key={item}
              className="rounded-2xl border text-base border-neutral-200 bg-white p-5 leading-6 text-neutral-700 sm:p-6"
            >
              <span className="mb-3 block h-1.5 w-10 rounded-full bg-yellow-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-beneficios" className="mt-12 sm:mt-16">
        <h2 id="titulo-beneficios" className="text-3xl font-extrabold tracking-tight">
          Benefícios de uma boa alimentação
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beneficios.map(({ titulo, texto, icone: Icone }) => (
            <article key={titulo} className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                <Icone size={22} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">{titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{texto}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
