"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type SlideDieta = {
  src: string;
  alt: string;
  titulo: string;
  texto: string;
};

export default function DietaSlider({ slides }: { slides: SlideDieta[] }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = slides.length;

  const anterior = useCallback(() => setAtual((i) => (i - 1 + total) % total), [total]);
  const proximo = useCallback(() => setAtual((i) => (i + 1) % total), [total]);

  useEffect(() => {
    if (pausado) return;
    const timer = setInterval(proximo, 5000);
    return () => clearInterval(timer);
  }, [pausado, proximo]);

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Galeria de alimentação saudável"
      className="relative overflow-hidden rounded-3xl bg-neutral-950"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${atual * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <figure
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}`}
            aria-hidden={i !== atual}
            className="relative aspect-[4/5] w-full shrink-0 sm:aspect-[16/9]"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 pb-16 text-white sm:p-10 sm:pb-16">
              <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{slide.titulo}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-200 sm:text-base">
                {slide.texto}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <button
        type="button"
        onClick={anterior}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 sm:left-5"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={proximo}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 sm:right-5"
      >
        <ChevronRight size={22} aria-hidden="true" />
      </button>

      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setAtual(i)}
            aria-label={`Ir para o slide ${i + 1}`}
            aria-current={i === atual}
            className={`h-2.5 rounded-full transition-all ${
              i === atual ? "w-8 bg-yellow-400" : "w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
