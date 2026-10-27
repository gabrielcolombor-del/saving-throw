"use client";

import { useState } from 'react';

const KITS = [
  { value: 'kit-classico', preco: '169,90', label: 'Kit Clássico (4 Heróis Padrão + Monstros/NPCs - Tudo Sem Pintura)' },
  { value: 'kit-lendario', preco: '349,90', label: '⚔️ Kit Lendário (4 Heróis Personalizados + Monstros/NPCs Pintados)' },
];

// O kit está marcado como indisponível no site atual; mude para true para reabrir as encomendas.
const DISPONIVEL = false;

export function KitPicker() {
  const [kit, setKit] = useState(KITS[0]);

  const encomendar = () => {
    const opcao = kit.label.split('(')[0].trim();
    const msg = `Olá Saving Throw! 🎲\n\nGostaria de encomendar o *Kit de Aventura Completo: O Preço do Herdeiro*.\n\n*Opção Selecionada:* ${opcao}\n*Preço:* R$ ${kit.preco}\n\nComo procedemos com o pagamento e envio?`;
    window.open(`https://wa.me/5527997947604?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      <label htmlFor="select-kit" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
        Escolha seu Kit:
      </label>
      <select
        id="select-kit"
        value={kit.value}
        onChange={(e) => setKit(KITS.find((k) => k.value === e.target.value) ?? KITS[0])}
        className="w-full p-3 bg-white border border-zinc-300 rounded text-sm font-semibold focus:outline-none focus:border-black transition-colors cursor-pointer mb-6"
      >
        {KITS.map((k) => (
          <option key={k.value} value={k.value}>
            {k.label}
          </option>
        ))}
      </select>

      <div className="flex justify-between items-baseline mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Valor do Pedido:</span>
        <span className="text-3xl font-black">R$ {kit.preco}</span>
      </div>

      {DISPONIVEL ? (
        <button
          onClick={encomendar}
          className="w-full bg-black hover:bg-zinc-800 text-[#EBE3CB] font-bold uppercase text-sm py-4 px-4 rounded flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <i className="fa-brands fa-whatsapp text-lg"></i> Encomendar via WhatsApp
        </button>
      ) : (
        <button
          disabled
          className="w-full bg-zinc-600 text-zinc-300 font-bold uppercase text-sm py-4 px-4 rounded flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
        >
          <i className="fa-solid fa-ban text-lg"></i> Indisponível
        </button>
      )}
    </>
  );
}
