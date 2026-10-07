"use client";

import React, { useState, useEffect, useRef } from 'react';

function formatPrice(val: any) {
  return Number(val || 0).toFixed(2).replace('.', ',');
}

export default function ProductInteractive({ product, images }: { product: any, images: string[] }) {
  const WHATSAPP_NUMBER = "5527997947604";
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'unpainted' | 'painted'>('unpainted');
  const [isAnimatingPrice, setIsAnimatingPrice] = useState(false);

  const hasTriPrice = product.price_painted_box !== undefined && product.price_painted_box !== null;
  const hasDualPrice = product.price_unpainted !== undefined && product.price_unpainted !== null && product.price_painted !== undefined && product.price_painted !== null;
  const isBundle = product.type === 'pacote' || product.type === 'bundle';
  
  const frameRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length > 1) {
        if (e.key === 'ArrowRight') setCurrentSlide(s => (s + 1) % images.length);
        if (e.key === 'ArrowLeft') setCurrentSlide(s => (s - 1 + images.length) % images.length);
      }
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, isModalOpen]);

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (images.length <= 1) return;
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) setCurrentSlide(s => (s + 1) % images.length);
      else setCurrentSlide(s => (s - 1 + images.length) % images.length);
    }
  };

  const handleOptionChange = (opt: 'unpainted' | 'painted') => {
    if (selectedOption !== opt) {
        setSelectedOption(opt);
        setIsAnimatingPrice(true);
        setTimeout(() => setIsAnimatingPrice(false), 250);
    }
  };

  const currentPrice = isBundle 
    ? (product.price || 0)
    : hasDualPrice 
        ? (selectedOption === 'unpainted' ? (product.price_unpainted || product.price || 0) : (product.price_painted || 0))
        : (product.price || product.price_unpainted || 0);

  const selectedTitle = isBundle 
    ? 'PACOTE ESPECIAL' 
    : hasDualPrice 
        ? (selectedOption === 'unpainted' ? 'Sem Pintura (Resina Cinza)' : 'Com Pintura Artística Feita à Mão')
        : '';

  const getWhatsAppLink = () => {
    let message = `Olá Saving Throw! 🎲\n\nTenho interesse em encomendar o produto:\n*Item:* ${product.name}\n`;
    if (selectedTitle && selectedTitle.trim() !== '') {
        message += `*Opção:* ${selectedTitle}\n`;
    }
    message += `*Preço:* R$ ${formatPrice(currentPrice)}\n\nGostaria de saber mais informações e combinar o pagamento e envio!`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link do produto copiado para a área de transferência!");
  };

  return (
    <>
      {/* LADO ESQUERDO: GALERIA DE IMAGENS */}
      <div className="w-full lg:w-[45%] flex flex-col gap-4 select-none">
          <div 
            ref={frameRef} 
            className="relative w-full rounded-2xl overflow-hidden bg-zinc-200 border border-zinc-300 shadow-sm transition-all duration-300 group flex items-center justify-center aspect-[4/5] md:aspect-auto md:min-h-[500px]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
              {/* Botão de Expandir */}
              <button onClick={() => setIsModalOpen(true)} className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-md text-zinc-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer">
                  <i className="fa-solid fa-expand"></i>
              </button>

              {images.length > 1 && (
                  <>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentSlide(s => (s - 1 + images.length) % images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-md text-zinc-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer">
                          <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentSlide(s => (s + 1) % images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-md text-zinc-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer">
                          <i className="fa-solid fa-chevron-right"></i>
                      </button>
                  </>
              )}

              {/* IMAGEM PRINCIPAL */}
              <img src={images[currentSlide]} alt={`${product.name} - ${currentSlide + 1}`} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" />
              
              {/* Bolinhas */}
              {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                      {images.map((_, i) => (
                          <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? 'bg-amber-500 w-6' : 'bg-white/50 hover:bg-white/80 w-2.5'}`} aria-label={`Ir para foto ${i + 1}`}></button>
                      ))}
                  </div>
              )}
          </div>

          {/* THUMBNAILS */}
          {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
                  {images.map((imgSrc, i) => (
                      <button key={i} onClick={() => setCurrentSlide(i)} className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${i === currentSlide ? 'border-amber-600 scale-105 shadow-md ring-2 ring-amber-500/30' : 'border-zinc-200 opacity-60 hover:opacity-100'}`}>
                          <img src={imgSrc} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                  ))}
              </div>
          )}
      </div>

      {/* PAINEL DE COMPRA (Renderizado via Portal Simulado para compor o layout do pai, ou apenas retornado) */}
      <div className="w-full lg:w-[55%] flex flex-col justify-end">
          <div className="bg-white border-2 border-zinc-200 rounded-2xl p-6 md:p-8 shadow-xl mt-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

              <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                  
                  <div className="flex-1">
                      {hasDualPrice && !isBundle && (
                          <div className="mb-6">
                              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Escolha a Finalização:</label>
                              <div className="flex flex-col sm:flex-row gap-3">
                                  <button onClick={() => handleOptionChange('unpainted')} className={`flex-1 border-2 rounded-xl p-3 text-left transition-all cursor-pointer relative overflow-hidden group ${selectedOption === 'unpainted' ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}>
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-sm text-zinc-900">Sem Pintura</span>
                                          <i className={`fa-solid fa-circle-check text-amber-500 transition-opacity ${selectedOption === 'unpainted' ? 'opacity-100' : 'opacity-0'}`}></i>
                                      </div>
                                      <span className="text-xs text-zinc-500 block mb-2">Resina Cinza Premium</span>
                                      <span className="inline-block bg-zinc-100 text-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded">R$ {formatPrice(product.price_unpainted)}</span>
                                  </button>
                                  
                                  <button onClick={() => handleOptionChange('painted')} className={`flex-1 border-2 rounded-xl p-3 text-left transition-all cursor-pointer relative overflow-hidden group ${selectedOption === 'painted' ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}>
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-sm text-zinc-900">Com Pintura</span>
                                          <i className={`fa-solid fa-circle-check text-amber-500 transition-opacity ${selectedOption === 'painted' ? 'opacity-100' : 'opacity-0'}`}></i>
                                      </div>
                                      <span className="text-xs text-zinc-500 block mb-2">Pintura Artística</span>
                                      <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">R$ {formatPrice(product.price_painted)}</span>
                                  </button>
                              </div>
                          </div>
                      )}

                      <div>
                          {selectedTitle && <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block mb-1">{selectedTitle}</span>}
                          <div className="flex items-baseline gap-3 transition-transform duration-300 origin-left">
                              {isBundle && product.price_original && (
                                  <span className="text-lg text-zinc-400 line-through mr-3">R$ {formatPrice(product.price_original)}</span>
                              )}
                              <span className={`text-4xl md:text-5xl font-black text-black tracking-tight transition-colors duration-300 ${isAnimatingPrice ? 'text-amber-600 scale-105' : ''}`}>R$ {formatPrice(currentPrice)}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">Produção Sob Demanda</p>
                      </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-col gap-3">
                      <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="bg-black hover:bg-zinc-800 text-[#EBE3CB] text-sm md:text-base font-bold uppercase tracking-wider py-4 md:py-5 px-8 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-xl hover:-translate-y-1 text-center whitespace-nowrap border border-black group cursor-pointer">
                          <i className="fa-brands fa-whatsapp text-xl text-green-500 group-hover:scale-110 transition-transform"></i>
                          Encomendar Agora
                      </a>
                      
                      <button onClick={copyLink} className="bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                          <i className="fa-solid fa-link"></i> Copiar Link do Produto
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* MODAL LIGHTBOX */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center" onClick={() => setIsModalOpen(false)}>
              <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl cursor-pointer transition-colors z-50">
                  <i className="fa-solid fa-xmark"></i>
              </button>
              <img src={images[currentSlide]} alt="Zoom" className="max-w-[90vw] max-h-[85vh] object-contain select-none shadow-2xl rounded-sm" onClick={(e) => e.stopPropagation()} />
              <p className="text-white/70 mt-4 text-sm font-bold uppercase tracking-wider text-center px-4">
                  {images.length > 1 ? `${product.name} (${currentSlide + 1} de ${images.length})` : product.name}
              </p>
          </div>
      )}
    </>
  );
}
