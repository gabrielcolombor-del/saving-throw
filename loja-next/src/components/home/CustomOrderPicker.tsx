"use client";

import { useState } from 'react';

const OPTIONS = [
  { value: '49,90', label: 'Sem Pintura (Modelo cinza pronto para pintar)' },
  { value: '99,90', label: 'Com Pintura Artística (Pintura feita à mão)' },
  { value: '119,90', label: 'Com Pintura Artística + Caixa MDF de Luxo' },
];

export function CustomOrderPicker() {
  const [preco, setPreco] = useState(OPTIONS[0].value);

  return (
    <div className="border-t border-amber-200 pt-6 mb-8 text-left">
      <label htmlFor="opcao-pintura" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
        Opção de Pintura:
      </label>
      <select
        id="opcao-pintura"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        className="w-full p-3 bg-white border border-amber-200 rounded text-sm font-semibold focus:outline-none focus:border-amber-600 transition-colors cursor-pointer mb-6"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div className="flex justify-between items-baseline mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Valor do Pedido:</span>
        <span className="text-3xl font-black text-amber-700">R$ {preco}</span>
      </div>
      <a
        href="https://wa.me/5527997947604"
        target="_blank"
        rel="noreferrer"
        className="w-full bg-black hover:bg-zinc-800 text-[#EBE3CB] font-bold uppercase text-sm py-4 px-4 rounded transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-md hover:shadow-lg"
      >
        <i className="fa-solid fa-wand-magic-sparkles text-lg group-hover:text-amber-500 transition-colors"></i> Encomendar Meu Herói
      </a>
    </div>
  );
}
