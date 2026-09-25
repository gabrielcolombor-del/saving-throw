// @ts-nocheck

import React, { useEffect } from 'react';

export function Oneshots() {
  useEffect(() => {
    try {
      
        function atualizarPrecoKit() {
            var select = document.getElementById('select-kit');
            var precoExibicao = document.getElementById('preco-kit');
            var opcaoSelecionada = select.options[select.selectedIndex];
            
            if(opcaoSelecionada && opcaoSelecionada.dataset.preco) {
                precoExibicao.innerText = 'R$ ' + opcaoSelecionada.dataset.preco;
                precoExibicao.classList.add('text-amber-600', 'scale-110');
                setTimeout(() => {
                    precoExibicao.classList.remove('text-amber-600', 'scale-110');
                }, 300);
            }
        }

        function enviarPedidoKit() {
            var numeroWhatsApp = "5527997947604";
            var select = document.getElementById('select-kit');
            var opcaoSelecionada = select.options[select.selectedIndex];
            var textoOpcao = opcaoSelecionada.text;
            var preco = opcaoSelecionada.dataset.preco;
            
            var textoOpcaoLimpo = textoOpcao.split('(')[0].trim();
            
            var mensagem = `Olá Saving Throw! 🎲\n\nGostaria de encomendar o *Kit de Aventura Completo: O Preço do Herdeiro*.\n\n*Opção Selecionada:* ${textoOpcaoLimpo}\n*Preço:* R$ ${preco}\n\nComo procedemos com o pagamento e envio?`;
            var urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            window.open(urlWhatsApp, '_blank');
        }

        // Menu Hamburguer Responsivo
        document.getElementById('menu-btn')?.addEventListener('click', function() {
            var navContent = document.getElementById('nav-content');
            var menuIcon = this.querySelector('i');
            navContent.classList.toggle('hidden');
            if (navContent.classList.contains('hidden')) {
                menuIcon.classList.replace('fa-xmark', 'fa-bars');
            } else {
                menuIcon.classList.replace('fa-bars', 'fa-xmark');
            }
        });
    

      (window as any).atualizarPrecoKit = atualizarPrecoKit;
(window as any).enviarPedidoKit = enviarPedidoKit;

    } catch(e) {
      console.error("Error in legacy script for Oneshots:", e);
    }
  }, []);

  return (
    <div className="font-sans" dangerouslySetInnerHTML={{ __html: `
        <section class="relative bg-cover text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style="background-image: url('./assets/imagens/one shots.jpg'); background-position: center 70%;">
            <div class="absolute inset-0 bg-black/60"></div>
            <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                <h1 class="text-4xl md:text-6xl font-title uppercase tracking-tight mb-6">Kits de Aventura</h1>
                <p class="text-[#EBE3CB]/80 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
                    Módulos "One Shot" prontos para jogar. Incluem a história impressa, mapas e todas as miniaturas necessárias.
                </p>
            </div>
        </section>

        <section class="py-20 bg-white text-black">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="flex flex-col md:flex-row gap-12 items-center">
                    <div class="w-full md:w-1/2">
                        <img src="./assets/imagens/preco_herdeiro.png" class="w-full rounded-xl shadow-xl border border-zinc-200" alt="Capa da Aventura O Preço do Herdeiro">
                    </div>
                    <div class="w-full md:w-1/2 flex flex-col justify-center">
                        <span class="text-amber-600 font-bold uppercase tracking-widest text-xs mb-2">Aventura Completa</span>
                        <h2 class="font-title text-4xl md:text-5xl mb-6">O Preço do Herdeiro</h2>
                        <p class="text-zinc-600 mb-6">Uma trama sombria de traição e espionagem. Este kit inclui o folheto físico impresso da aventura contendo os mapas e a história completa, além das miniaturas em resina dos monstros/NPCs da campanha e dos heróis para o seu tabuleiro.</p>
                        
                        <div class="bg-zinc-50 p-6 rounded-xl border border-zinc-200 mb-8 shadow-sm">
                            <h3 class="font-bold uppercase tracking-wide mb-4 text-sm text-zinc-500">Conteúdo do Combo:</h3>
                            <ul class="space-y-2 mb-6 text-zinc-700">
                                <li>✔️ 1x Livreto Físico da Aventura (Impresso)</li>
                                <li>✔️ 4x Miniaturas de Monstros & NPCs da Aventura (3x Cultistas + 1x Boss)</li>
                                <li>✔️ 4x Miniaturas de Heróis (Padrão ou Customizados, conforme o Kit)</li>
                            </ul>
                            
                            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Escolha seu Kit:</label>
                            <select id="select-kit" onchange="atualizarPrecoKit()" class="w-full p-3 bg-white border border-zinc-300 rounded text-sm font-semibold focus:outline-none focus:border-black transition-colors cursor-pointer mb-6">
                                <option value="kit-classico" data-preco="169,90">Kit Clássico (4 Heróis Padrão + Monstros/NPCs - Tudo Sem Pintura)</option>
                                <option value="kit-lendario" data-preco="349,90">⚔️ Kit Lendário (4 Heróis Personalizados + Monstros/NPCs Pintados)</option>
                            </select>
                            
                            <div class="flex justify-between items-baseline mb-4">
                                <span class="text-xs font-bold uppercase tracking-wider text-zinc-500">Valor do Pedido:</span>
                                <span id="preco-kit" class="text-3xl font-black">R\$ 169,90</span>
                            </div>
                            <button disabled class="w-full bg-zinc-600 text-zinc-300 font-bold uppercase text-sm py-4 px-4 rounded flex items-center justify-center gap-2 cursor-not-allowed shadow-none">
                                <i class="fa-solid fa-ban text-lg"></i> Indisponível
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    ` }} />
  );
}
