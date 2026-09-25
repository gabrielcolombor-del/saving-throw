import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => prev === 1 ? 2 : 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hidden md:block bg-amber-600 text-black text-xs md:text-sm font-bold text-center py-2 px-4 uppercase tracking-wider">
        🛡️ Produção Artesanal Premium: Peças sob encomenda com envio em até 7 dias úteis.
      </div>
      <section 
        className="relative w-full max-w-[1920px] mx-auto min-h-[680px] py-12 md:py-0 md:h-[850px] bg-cover bg-center overflow-hidden border-b border-zinc-800 flex items-center justify-center" 
        style={{ backgroundImage: "url('/assets/imagens/banner.png')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-4xl">
          <span className="text-[#EBE3CB] text-xs font-black tracking-widest uppercase mb-6 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
            Boutique Premium de RPG
          </span>
          <img src="/assets/imagens/logo quadrada2.png" alt="Saving Throw Logo" className="w-32 md:w-40 h-auto mb-6 drop-shadow-2xl" />
          <h1 className="text-4xl md:text-6xl uppercase tracking-tight leading-none mb-6 text-white font-title">
            Leve a imersão da sua mesa para o próximo nível
          </h1>
          <p className="text-[#EBE3CB] text-base md:text-lg max-w-2xl mb-10 font-medium drop-shadow-md font-sans">
            Miniaturas de resina com pintura artística profissional e artefatos de corte a laser esculpidos em alto relevo. Tudo pronto para ir direto para o seu mapa de combate.
          </p>
          <div className="flex flex-wrap justify-center gap-4 font-sans">
            <a href="#loja" className="bg-[#EBE3CB] text-black font-bold uppercase text-sm tracking-wider px-8 py-4 rounded hover:bg-white transition-all shadow-lg hover:scale-105">
              Explorar Catálogo
            </a>
            <Link to="/sistema" className="bg-zinc-900 text-white border border-zinc-700 font-bold uppercase text-sm tracking-wider px-8 py-4 rounded hover:bg-zinc-800 transition-all hover:scale-105">
              Conheça o Sistema
            </Link>
          </div>
        </div>
      </section>

      <section id="personalizada" className="bg-parchment text-black py-24 border-b border-black/10">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 max-w-6xl">
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-amber-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              
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
              
              <div className="absolute -bottom-6 -right-6 bg-black text-[#EBE3CB] p-4 rounded shadow-xl border border-zinc-800 rotate-3 transform group-hover:-rotate-3 transition-all duration-500 z-10">
                <span className="block font-title text-xl">Caixa MDF Personalizada</span>
                <span className="text-xs uppercase tracking-widest font-bold font-sans">Escala 50mm</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 text-center lg:text-left font-sans">
            <span className="text-amber-700 text-xs font-black tracking-widest uppercase mb-4 block">Serviço Exclusivo</span>
            <h2 className="text-4xl md:text-5xl font-title uppercase tracking-tight mb-6 text-parchment-dark">Dê vida ao seu personagem</h2>
            <p className="text-zinc-700 text-lg mb-6">
              Você não precisa mais jogar com um modelo genérico. Envie uma imagem de referência do seu personagem e nós cuidamos do resto: buscamos ou adaptamos o modelo ideal, imprimimos em Resina Premium e aplicamos uma pintura artística profissional.
            </p>
            <p className="text-zinc-700 text-lg mb-10">
              Sua miniatura será entregue acompanhada de uma <strong>Caixa de MDF de Luxo</strong>, cortada e gravada a laser com o nome, classe e os símbolos do seu herói. É o baú do tesouro definitivo para guardar o seu avatar.
            </p>
            <a href="https://wa.me/5527997947604" target="_blank" rel="noreferrer" className="inline-flex bg-black text-[#EBE3CB] hover:bg-zinc-800 transition-all px-8 py-4 rounded shadow-xl items-center gap-3 group font-bold uppercase text-sm tracking-wider">
              <i className="fa-solid fa-wand-magic-sparkles text-lg group-hover:text-amber-500 transition-colors"></i> Encomendar Meu Herói
            </a>
          </div>
        </div>
      </section>

      <section id="loja" className="bg-white text-black py-20 font-sans">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-title">Nossos Artefatos</h2>
            <div className="w-16 h-1 bg-black mx-auto mt-3"></div>
            <p className="text-zinc-600 mt-4 text-sm font-medium">Selecione as opções do seu combo diretamente no card e finalize o fechamento personalizado da encomenda conosco pelo WhatsApp.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div>
                <div className="w-full h-56 bg-zinc-300 rounded-lg flex items-center justify-center text-zinc-500 mb-6 font-bold uppercase text-xs tracking-wider border border-zinc-400 overflow-hidden relative group">
                  <img src="/assets/imagens/one shots.jpg" alt="Kit Aventura" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <span className="text-white text-xs font-bold tracking-widest uppercase border border-white px-3 py-1 rounded">Ver Detalhes</span>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">One Shots & Campanhas</span>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 font-title">Kits de Aventura</h3>
                <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
                  Módulos de campanha prontos para rolar dados. Cada kit inclui a história impressa com mapas e encontros detalhados, além das miniaturas em resina dos monstros, vilões e heróis.
                </p>
              </div>
              <div className="border-t border-zinc-200 pt-4 mt-4">
                <Link to="/oneshots" className="w-full bg-black hover:bg-zinc-800 text-white font-bold uppercase text-sm py-3 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                  <i className="fa-solid fa-eye text-base"></i> Ver Detalhes dos Kits
                </Link>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div>
                <div className="w-full h-56 bg-zinc-300 rounded-lg flex items-center justify-center text-zinc-500 mb-6 font-bold uppercase text-xs tracking-wider border border-zinc-400 overflow-hidden group">
                  <img src="/assets/imagens/minis.png" alt="Miniaturas Pintadas" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">Bestiário & Heróis Avulsos</span>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 font-title">Miniaturas de Resina</h3>
                <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
                  Modelos impressos em resina de altíssima definição. Peças entregues sem suportes, totalmente curadas e finalizadas com pintura técnica e contrastes marcantes.
                </p>
              </div>
              <div className="border-t border-zinc-200 pt-4 mt-4">
                <Link to="/miniaturas" className="w-full bg-black hover:bg-zinc-800 text-white font-bold uppercase text-sm py-3 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                  <i className="fa-solid fa-eye text-base"></i> Ver Detalhes
                </Link>
              </div>
            </div>
            
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div>
                <div className="w-full h-56 bg-zinc-300 rounded-lg flex items-center justify-center text-zinc-500 mb-6 font-bold uppercase text-xs tracking-wider border border-zinc-400 overflow-hidden group">
                  <img src="/assets/imagens/escudo_mestre.png" alt="Arsenal de RPG" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">Arsenal de RPG</span>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2 font-title">Artefatos & Suportes</h3>
                <p className="text-zinc-600 text-sm mb-6 leading-relaxed">
                  Escudos do mestre, torres de dados e bandejas personalizadas em MDF de alta precisão para enriquecer suas sessões.
                </p>
              </div>
              <div className="border-t border-zinc-200 pt-4 mt-4">
                <Link to="/arsenal" className="w-full bg-black hover:bg-zinc-800 text-white font-bold uppercase text-sm py-3 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                  <i className="fa-solid fa-eye text-base"></i> Ver Catálogo Completo
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
