// @ts-nocheck

import React, { useEffect } from 'react';

export function Sistema() {
  useEffect(() => {
    try {
      
        var videos = [
            { id: 'KBpAt6h4J2E', title: 'Como Jogar Saving Throw' },
            { id: 'I1vuYvtpR5E', title: 'Criação de Personagens' },
            { id: 'l8KDHynT7Hg', title: 'Combate e Ações' },
            { id: 'w6doLh4ioPQ', title: 'Magia e Exploração' }
        ];
        
        var currentIndex = 0;
        var player;

        function renderThumbnails() {
            var container = document.getElementById('video-thumbnails');
            container.innerHTML = videos.map((vid, index) => `
                <div onclick="playVideo(${index})" class="group cursor-pointer flex flex-col gap-2">
                    <div class="aspect-video w-full rounded-lg border-2 ${index === currentIndex ? 'border-amber-500' : 'border-zinc-800'} overflow-hidden relative shadow-lg transition-all">
                        <div class="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors z-10 ${index === currentIndex ? 'bg-black/0' : ''}"></div>
                        <img src="https://img.youtube.com/vi/${vid.id}/mqdefault.jpg" class="w-full h-full object-cover">
                        ${index === currentIndex 
                            ? `<div class="absolute inset-0 flex items-center justify-center z-20"><i class="fa-solid fa-play text-amber-500 text-3xl drop-shadow-lg opacity-80"></i></div>` 
                            : `<div class="absolute inset-0 flex items-center justify-center z-20"><i class="fa-solid fa-play text-white text-2xl opacity-50 group-hover:opacity-100 transition-opacity"></i></div>`
                        }
                    </div>
                    <span class="text-xs font-bold uppercase tracking-wider ${index === currentIndex ? 'text-amber-500' : 'text-zinc-500 group-hover:text-white'} text-center md:text-left mt-1">Aula 0${index + 1}</span>
                </div>
            `).join('');
            
            document.getElementById('video-counter').innerText = `Vídeo ${currentIndex + 1} de ${videos.length}`;
            document.getElementById('video-title').innerText = videos[currentIndex].title;
        }

        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        function onYouTubeIframeAPIReady() {
            player = new YT.Player('youtube-player', {
                videoId: videos[currentIndex].id,
                playerVars: {
                    'rel': 0,
                    'autoplay': 0
                },
                events: {
                    'onStateChange': onPlayerStateChange
                }
            });
            renderThumbnails();
        }

        function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.ENDED) {
                nextVideo();
            }
        }

        function playVideo(index) {
            if (index >= 0 && index < videos.length) {
                currentIndex = index;
                player.loadVideoById(videos[currentIndex].id);
                renderThumbnails();
                
                // Rolar a tela suavemente para cima do player em telas menores
                if(window.innerWidth < 768) {
                    document.getElementById('youtube-player').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }

        function nextVideo() {
            if (currentIndex < videos.length - 1) {
                playVideo(currentIndex + 1);
            } else {
                playVideo(0); 
            }
        }

        function prevVideo() {
            if (currentIndex > 0) {
                playVideo(currentIndex - 1);
            } else {
                playVideo(videos.length - 1); 
            }
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
    

      (window as any).renderThumbnails = renderThumbnails;
(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
(window as any).onPlayerStateChange = onPlayerStateChange;
(window as any).playVideo = playVideo;
(window as any).nextVideo = nextVideo;
(window as any).prevVideo = prevVideo;

    } catch(e) {
      console.error("Error in legacy script for Sistema:", e);
    }
  }, []);

  return (
    <div className="font-sans" dangerouslySetInnerHTML={{ __html: `
        <section class="relative bg-cover bg-center text-white py-20 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style="background-image: url('/assets/imagens/banner_st.png');">
            <div class="absolute inset-0 bg-black/60"></div>
            <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                <h1 class="text-4xl md:text-6xl font-title uppercase tracking-tight mb-6">Aprenda a Jogar</h1>
                <p class="text-[#EBE3CB]/80 text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
                    Assista aos nossos vídeos tutoriais e entenda por que o Sistema Saving Throw é a melhor escolha para mesas dinâmicas, focadas em narrativa e combate tático.
                </p>
            </div>
        </section>

        <section class="py-20 bg-black">
            <div class="container mx-auto px-4 max-w-5xl text-center">
                <!-- Módulo Básico Badge -->
                <div class="inline-flex bg-zinc-800/80 border border-zinc-700 rounded-lg p-2 gap-2 mb-12">
                    <span class="px-4 py-2 bg-zinc-900 rounded text-sm font-bold uppercase tracking-wider text-amber-500">Módulo Básico</span>
                </div>
                <!-- Vídeo em destaque -->
                <div class="mb-12 relative group/main">
                    <div class="aspect-video w-full rounded-xl border border-zinc-800 shadow-2xl overflow-hidden relative bg-zinc-900">
                        <div id="youtube-player" class="absolute inset-0 w-full h-full"></div>
                    </div>
                    <!-- Setas -->
                    <button onclick="prevVideo()" class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-6 w-10 h-10 md:w-14 md:h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover/main:opacity-100 transition-all hover:bg-amber-600 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-zinc-700 z-10 hover:scale-110">
                        <i class="fa-solid fa-chevron-left text-lg"></i>
                    </button>
                    <button onclick="nextVideo()" class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-6 w-10 h-10 md:w-14 md:h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover/main:opacity-100 transition-all hover:bg-amber-600 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-zinc-700 z-10 hover:scale-110">
                        <i class="fa-solid fa-chevron-right text-lg"></i>
                    </button>
                    
                    <div class="mt-4 flex flex-col md:flex-row justify-between items-center text-zinc-400 text-sm font-semibold uppercase tracking-wider bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                        <span id="video-counter" class="mb-2 md:mb-0">Vídeo 1 de 4</span>
                        <span class="text-amber-500 font-title text-xl" id="video-title">Carregando...</span>
                    </div>
                </div>

                <!-- Grid de outros vídeos (Playlist) -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" id="video-thumbnails">
                    <!-- Gerados via JavaScript -->
                </div>
                
                <div class="mt-20 text-center flex flex-wrap justify-center gap-6">
                    <a href="/assets/ST%20-%20Manual%20Simplificado%202.0.pdf" download class="bg-[#EBE3CB] text-black font-bold uppercase text-sm tracking-wider px-8 py-4 rounded hover:bg-white transition-all shadow-lg inline-flex items-center gap-3">
                        <i class="fa-solid fa-download text-lg"></i> Baixar Manual Simplificado
                    </a>
                    <a href="habilidades" class="bg-zinc-800 text-white font-bold uppercase text-sm tracking-wider px-8 py-4 rounded border border-zinc-700 hover:bg-zinc-700 transition-all shadow-lg inline-flex items-center gap-3">
                        <i class="fa-solid fa-book-open text-lg text-amber-500"></i> Compêndio de Magias
                    </a>
                </div>
            </div>
        </section>
    ` }} />
  );
}
