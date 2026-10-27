"use client";

import { useEffect, useState } from 'react';

/** Alterna as duas fotos da miniatura personalizada a cada 6s (igual ao Home.tsx do Vite). */
export function HeroSlides() {
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev === 1 ? 2 : 1)), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <img
        src="/assets/imagens/capapersonagem1.png"
        alt="Miniatura Personalizada - Imagem 1"
        className={`relative rounded-lg shadow-2xl border border-black/10 transform group-hover:scale-[1.02] transition-opacity duration-1000 ease-in-out z-0 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}
      />
      <img
        src="/assets/imagens/capapersonagem2.png"
        alt="Miniatura Personalizada - Imagem 2"
        className={`absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl border border-black/10 transform group-hover:scale-[1.02] transition-opacity duration-1000 ease-in-out pointer-events-none z-0 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );
}
