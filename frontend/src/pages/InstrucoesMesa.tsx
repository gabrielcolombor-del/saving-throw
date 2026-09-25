
import React, { useEffect } from 'react';

export function InstrucoesMesa() {
  useEffect(() => {
    

    
// Expose to window for inline React handlers

  }, []);

  return (
    <div className="font-sans">
      
        <div className="container mx-auto px-4 max-w-4xl">
            
            <div className="text-center mb-12 relative">
                {/*  Decorativo  */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>
                
                <h1 className="text-3xl sm:text-5xl text-amber-500 font-title uppercase tracking-wide mb-4 relative z-10">
                    <i className="fa-solid fa-book-open"></i> Guia do Mestre: Estúdio Sonoro
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base relative z-10 max-w-2xl mx-auto">
                    Aprenda a dominar o painel de som passo a passo e eleve a imersão das suas sessões de RPG a outro nível.
                </p>
            </div>

            {/*  1. Login e Salvamento em Nuvem  */}
            <section className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        1
                    </div>
                    <h2 className="text-2xl text-amber-400 font-title uppercase tracking-wider">Login e Salvamento em Nuvem</h2>
                </div>
                <div className="pl-13 text-zinc-300 text-sm mb-6">
                    <p className="mb-2 text-zinc-300">O <strong>primeiro e mais importante passo</strong> é fazer o seu login! Isso garante que todas as suas configurações sejam salvas.</p>
                    <ul className="list-disc ml-5 space-y-2 text-zinc-400">
                        <li>Clique no botão <strong className="text-amber-500">Minha Conta</strong> no topo da página do Estúdio Sonoro.</li>
                        <li>Faça login de forma rápida usando seu <strong>Google</strong> ou e-mail.</li>
                        <li>Uma vez logado, todas as suas mesas, cenas, atalhos e favoritos serão <strong className="text-white">salvos na nuvem em tempo real</strong> e restaurados na próxima sessão!</li>
                    </ul>
                </div>
                
                {/*  Mockup Visual  */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg mx-auto md:w-5/6 pointer-events-none flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl"></div>
                    
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 w-full max-w-md flex flex-col gap-4 shadow-inner relative z-10">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <span className="text-amber-500 font-title tracking-wide text-lg"><i className="fa-solid fa-dice-d20"></i> Estúdio Sonoro</span>
                            <div className="relative">
                                <div className="bg-zinc-800 text-[#EBE3CB] border border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] z-10 relative">
                                    <i className="fa-solid fa-user-gear text-amber-400"></i> Minha Conta
                                </div>
                                <div className="absolute -bottom-8 -right-4 text-white text-3xl drop-shadow-md transform -rotate-12 z-20">
                                    <i className="fa-solid fa-arrow-pointer"></i>
                                </div>
                                {/*  Onda de clique  */}
                                <div className="absolute inset-0 rounded-lg border border-amber-500 animate-ping opacity-50"></div>
                            </div>
                        </div>
                        
                        <div className="bg-zinc-900 border border-amber-600/30 rounded-xl p-4 text-center mt-2 relative">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center text-xl mb-3 shadow-inner">
                                <i className="fa-solid fa-user-shield"></i>
                            </div>
                            <h4 className="text-xl font-title text-amber-400 uppercase mb-1">Conta de Mestre</h4>
                            <p className="text-[10px] text-zinc-400 mb-4">Faça login para salvar seus atalhos e favoritos.</p>
                            
                            <div className="bg-white text-black border border-zinc-300 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-2 w-3/4 mx-auto">
                                <i className="fa-brands fa-google text-red-500"></i> Continuar com Google
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-zinc-800/60 mb-14" />

            {/*  2. Criação de Nova Mesa  */}
            <section className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        2
                    </div>
                    <h2 className="text-2xl text-white font-title uppercase tracking-wider">Perfis de Mesa (Sua Campanha)</h2>
                </div>
                <div className="pl-13 text-zinc-300 text-sm mb-6">
                    <p className="mb-2">Você pode gerenciar diferentes perfis para cada uma das suas campanhas (ex: "Mesa Cyberpunk", "Mesa Fantasia"). Cada perfil salva seus próprios <strong>atalhos</strong>, <strong>favoritos</strong> e <strong>cenas</strong> isoladamente.</p>
                    <ul className="list-disc ml-5 space-y-2 text-zinc-400">
                        <li>Clique no botão <strong className="text-amber-400">Nova Mesa</strong> para criar um perfil do zero.</li>
                        <li>Alterne entre as mesas usando a lista suspensa. Todos os seus atalhos e sons mudarão instantaneamente.</li>
                    </ul>
                </div>
                
                {/*  Mockup Visual  */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg mx-auto md:w-5/6 pointer-events-none relative">
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm border border-amber-500/40">
                                <i className="fa-solid fa-dice-d20"></i>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Perfil de Mesa Ativa</span>
                                <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold w-full md:w-64 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)] flex justify-between items-center">
                                    Minha Campanha de Vampiro <i className="fa-solid fa-chevron-down text-[10px]"></i>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="bg-amber-600/20 text-amber-300 border border-amber-500/40 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ring-2 ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] z-10 relative">
                                    <i className="fa-solid fa-plus text-amber-400"></i> Nova Mesa
                                </div>
                                <div className="absolute -bottom-6 -right-3 text-white text-2xl drop-shadow-md transform -rotate-12 z-20">
                                    <i className="fa-solid fa-arrow-pointer"></i>
                                </div>
                            </div>
                            <div className="bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs px-2.5 py-1.5 rounded-lg opacity-60">
                                <i className="fa-solid fa-pen"></i>
                            </div>
                            <div className="bg-red-950/40 text-red-400 border border-red-800/40 font-bold text-xs px-2.5 py-1.5 rounded-lg opacity-60">
                                <i className="fa-solid fa-trash"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-zinc-800/60 mb-14" />

            {/*  3. Criação de Cenas  */}
            <section className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        3
                    </div>
                    <h2 className="text-2xl text-white font-title uppercase tracking-wider">Cenas da Mesa (Crossfade e Transições)</h2>
                </div>
                <div className="pl-13 text-zinc-300 text-sm mb-6">
                    <p className="mb-2">Cenas são grupos de Músicas Ambientes que tocam ao mesmo tempo, já com o volume que você configurou perfeitamente. Crie presets para Tavernas, Combates e Exploração.</p>
                    <ul className="list-disc ml-5 space-y-2 text-zinc-400 mb-4">
                        <li>Deixe tocando os ambientes desejados (Ex: "Chuva" em 30% e "Combate" em 80%).</li>
                        <li>Clique em <strong className="text-amber-400">Salvar Cena Atual</strong>.</li>
                        <li>Para <strong>trocar de cena</strong>, basta clicar em qualquer cena salva. O sistema fará um <strong>Crossfade Automático de 4 Segundos</strong> (diminuindo o som atual e subindo o novo gradativamente) de forma extremamente suave para os jogadores!</li>
                    </ul>
                </div>
                
                {/*  Mockup Visual  */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg mx-auto md:w-5/6 flex flex-col gap-5 pointer-events-none relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10">
                        <span className="text-amber-500 font-title uppercase text-xl md:text-2xl"><i className="fa-solid fa-masks-theater text-amber-400"></i> Cenas Sonoras</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/*  Cena Ativa  */}
                        <div className="bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-950 border-2 border-amber-500 rounded-2xl p-4 shadow-[0_0_25px_rgba(245,158,11,0.2)] relative overflow-hidden">
                            {/*  Efeito de pulso crossfade  */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                            
                            <div className="flex justify-between mb-3">
                                <span className="bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                                    <i className="fa-solid fa-arrows-rotate animate-spin" style={{animationDuration: '3s'}}></i> Transicionando
                                </span>
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-black/50 px-2 py-0.5 rounded">4.0s</span>
                            </div>
                            <div className="flex items-center gap-3 my-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex justify-center items-center text-lg"><i className="fa-solid fa-cloud-showers-heavy"></i></div>
                                <div><h3 className="text-base md:text-lg font-bold text-white font-title">Tempestade em Alto Mar</h3></div>
                            </div>
                            <div className="w-full bg-zinc-950 rounded-full h-2 mt-4 overflow-hidden border border-zinc-800"><div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full w-2/3"></div></div>
                        </div>
                        
                        {/*  Fileira de Cenas Salvas  */}
                        <div className="flex flex-col gap-3 justify-center">
                            <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center transition-all">
                                        <i className="fa-solid fa-beer-mug-empty text-amber-500"></i>
                                    </div>
                                    <div><h4 className="font-bold text-sm text-white">Taverna Aconchegante</h4><span className="text-[10px] text-zinc-500 block mt-0.5">2 Músicas</span></div>
                                </div>
                                <i className="fa-solid fa-play text-zinc-600 text-sm"></i>
                            </div>
                            <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center transition-all">
                                        <i className="fa-solid fa-compass text-amber-500"></i>
                                    </div>
                                    <div><h4 className="font-bold text-sm text-white">Exploração Misteriosa</h4><span className="text-[10px] text-zinc-500 block mt-0.5">1 Música</span></div>
                                </div>
                                <i className="fa-solid fa-play text-zinc-600 text-sm"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="border-zinc-800/60 mb-14" />

            {/*  4. Sons Personalizados na Nuvem  */}
            <section className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        4
                    </div>
                    <h2 className="text-2xl text-white font-title uppercase tracking-wider">Sons Personalizados na Nuvem</h2>
                </div>
                <div className="pl-13 text-zinc-300 text-sm mb-6">
                    <p className="mb-2">A biblioteca oficial não é o limite! Você pode adicionar suas próprias faixas épicas diretamente do YouTube.</p>
                    <ul className="list-disc ml-5 space-y-2 text-zinc-400">
                        <li>Vá até a seção <strong>Ambientes Personalizados</strong>, logo abaixo das músicas da biblioteca oficial.</li>
                        <li>Cole um link de uma música do YouTube, dê um nome para a faixa e clique em <strong className="text-amber-500">Adicionar</strong>.</li>
                        <li><strong>Salvamento Global:</strong> As faixas que você adiciona ficam <strong>salvas na sua conta na nuvem</strong>! Ao fazer login em qualquer outro navegador ou PC, toda a sua biblioteca pessoal é restaurada instantaneamente.</li>
                    </ul>
                </div>
            </section>

            <hr className="border-zinc-800/60 mb-14" />

            {/*  5. Adicionando Hotkeys  */}
            <section className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        5
                    </div>
                    <h2 className="text-2xl text-white font-title uppercase tracking-wider">Atalhos de Teclado Rápidos (Hotkeys)</h2>
                </div>
                <div className="pl-13 text-zinc-300 text-sm mb-6">
                    <p className="mb-2">Os atalhos permitem que você pressione os números <strong>de 1 a 9</strong> no seu teclado (no PC) para disparar efeitos sonoros (SFX) instantaneamente, sem precisar usar o mouse durante a narração. Há duas maneiras de definir:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                            <h4 className="text-amber-400 font-bold mb-1 flex items-center gap-2"><i className="fa-solid fa-hand-holding-hand"></i> 1. Drag and Drop</h4>
                            <p className="text-xs text-zinc-400">Arraste e solte o card de um Efeito Sonoro diretamente sobre um dos slots vazios (T1, T2...) na barra de Atalhos Rápidos.</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                            <h4 className="text-amber-400 font-bold mb-1 flex items-center gap-2"><i className="fa-solid fa-keyboard"></i> 2. Botão de Teclado</h4>
                            <p className="text-xs text-zinc-400">Clique no botão de teclado no canto superior esquerdo de qualquer efeito sonoro e digite o número do atalho que você quer (1 a 9).</p>
                        </div>
                    </div>
                </div>
                
                {/*  Mockup Visual Drag and Drop  */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg mx-auto md:w-5/6 pointer-events-none flex flex-col items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
                    
                    <h3 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-6 relative z-10 border border-zinc-800 px-3 py-1 rounded-full">Exemplo de Drag & Drop</h3>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative w-full max-w-lg z-10">
                        
                        {/*  Simulação do Card de Efeito Origem  */}
                        <div className="w-40 bg-zinc-900 border border-zinc-700 shadow-lg rounded-xl p-4 flex flex-col items-center text-center relative opacity-50 scale-95 transition-all">
                            <div className="absolute top-2 left-2 p-1 bg-zinc-800 rounded-full text-zinc-400">
                                <i className="fa-solid fa-keyboard px-1 text-xs"></i>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700 flex items-center justify-center text-xl mb-1.5 mt-2">
                                <i className="fa-solid fa-hand-fist"></i>
                            </div>
                            <span className="font-bold text-sm text-zinc-400">Soco</span>
                        </div>

                        {/*  Caminho do arraste animado (Simulado com CSS)  */}
                        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 justify-center items-center text-amber-500/50">
                            <svg className="w-full h-8" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path d="M 0,10 Q 50,-10 100,10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4,4" className="animate-pulse" />
                            </svg>
                        </div>
                        
                        {/*  Seta para mobile  */}
                        <div className="md:hidden text-amber-500/50 text-2xl">
                            <i className="fa-solid fa-arrow-down animate-bounce block"></i>
                        </div>

                        {/*  Card sendo arrastado (Flutuando)  */}
                        <div className="absolute md:left-[40%] top-[40%] md:top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 bg-zinc-900 border-2 border-amber-500 shadow-[0_20px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.3)] rounded-xl p-4 flex flex-col items-center text-center z-20 scale-105 rotate-3">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 text-amber-500 border border-zinc-700 flex items-center justify-center text-xl mb-1.5 mt-2">
                                <i className="fa-solid fa-hand-fist"></i>
                            </div>
                            <span className="font-bold text-sm text-white">Soco</span>
                            
                            {/*  Ícone de mão agarrando  */}
                            <div className="absolute -bottom-6 -right-2 text-amber-300 text-3xl drop-shadow-lg z-30">
                                <i className="fa-solid fa-hand-back-fist"></i>
                            </div>
                        </div>

                        {/*  Simulação de Slot Destino  */}
                        <div className="w-24 h-28 bg-amber-500/10 border-2 border-dashed border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] rounded-xl p-2.5 flex flex-col items-center justify-center text-center relative ring-4 ring-amber-500/20">
                            <span className="absolute top-1 right-1.5 bg-amber-500 text-black text-[9px] font-bold px-1 rounded animate-pulse">T1</span>
                            <i className="fa-solid fa-plus text-amber-500/50 text-2xl mb-1 mt-2"></i>
                            <span className="text-[10px] text-amber-500/80 font-bold uppercase mt-2">Solte Aqui</span>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    
    </div>
  );
}
