'use client';

import { useEffect, useRef } from 'react';

/**
 * Fundo para fotos exibidas inteiras (object-contain): estica a última coluna/linha de pixels de
 * cada lado da foto até a borda do quadro, para as sobras terem o mesmo tom e degradê da foto.
 * Fica atrás da <img>; não lê pixels (só desenha), então não depende de CORS.
 */
export function EdgeFill({ src, className = '' }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    const img = new Image();
    let cancelled = false;

    const draw = () => {
      if (cancelled || !img.naturalWidth) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.max(1, Math.round(rect.width * dpr));
      const H = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.min(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;

      ctx.imageSmoothingEnabled = true;
      // Laterais: 1 coluna de pixels esticada; topo/base: 1 linha esticada. +1 evita fresta na emenda.
      if (dx > 0) {
        ctx.drawImage(img, 0, 0, 1, ih, 0, dy, dx + 1, dh);
        ctx.drawImage(img, iw - 1, 0, 1, ih, dx + dw - 1, dy, W - (dx + dw) + 1, dh);
      }
      if (dy > 0) {
        ctx.drawImage(img, 0, 0, iw, 1, dx, 0, dw, dy + 1);
        ctx.drawImage(img, 0, ih - 1, iw, 1, dx, dy + dh - 1, dw, H - (dy + dh) + 1);
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    img.onload = draw;
    img.src = src;
    if (img.complete) draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [src]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`absolute inset-0 w-full h-full ${className}`} />;
}
