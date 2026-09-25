// @ts-nocheck

import React, { useEffect } from 'react';

export function Habilidades() {
  useEffect(() => {
    

        // Elementos do DOM
        var classSelect = document.getElementById('class-select');
        var cycleSelect = document.getElementById('cycle-select');
        var schoolSelect = document.getElementById('school-select');
        var searchInput = document.getElementById('search-input');
        var spellsContainer = document.getElementById('spells-container');
        var loadingDiv = document.getElementById('loading');
        var emptyStateDiv = document.getElementById('empty-state');
        var resultsCountSpan = document.getElementById('results-count');
        var sourceBadge = document.getElementById('source-badge');

        let allLoadedSpells = [];
        let magiasPreparadas = [];
        let modificadorInt = 3;

        // Nomes dos ciclos formatados
        const cycleNames = {
            0: 'Truques (Ciclo 0)',
            1: '1º Ciclo',
            2: '2º Ciclo',
            3: '3º Ciclo',
            4: '4º Ciclo',
            5: '5º Ciclo',
            6: '6º Ciclo',
            7: '7º Ciclo',
            8: '8º Ciclo',
            9: '9º Ciclo'
        };

        // Função para carregar magias
        async function fetchSpells() {
            showLoading(true);
            const className = classSelect.value;
            const cycle = cycleSelect.value;

            try {
                // Tenta buscar da API primeiro
                const response = await fetch(`/api/spells?class=${encodeURIComponent(className)}&cycle=${cycle}`);
                
                if (!response.ok) {
                    throw new Error('Falha na resposta do servidor');
                }
                
                const data = await response.json();
                allLoadedSpells = data.spells || [];
                
                sourceBadge.innerText = data.source === 'postgresql' ? 'POSTGRESQL' : 'LOCAL JSON';
                sourceBadge.classList.remove('hidden');
                
                renderSpellsList();
            } catch (err) {
                console.warn('Erro ao consultar API serverless, acionando fallback estático local:', err.message);
                // Caso falhe (por exemplo, arquivo aberto localmente sem servidor),
                // tenta carregar o arquivo estático diretamente do repositório
                try {
                    const fallbackResponse = await fetch('./assets/spells-pt.json');
                    if (!fallbackResponse.ok) {
                        throw new Error('Fallback JSON não encontrado');
                    }
                    const spells = await fallbackResponse.json();
                    
                    // Filtrar no cliente
                    allLoadedSpells = spells.filter(spell => {
                        const classMatch = spell.classes && spell.classes.some(c => c.toLowerCase() === className.toLowerCase());
                        const levelMatch = spell.level <= parseInt(cycle, 10);
                        return classMatch && levelMatch;
                    });

                    // Ordenar por ciclo e nome
                    allLoadedSpells.sort((a, b) => {
                        if (a.level !== b.level) return a.level - b.level;
                        return a.name.localeCompare(b.name, 'pt-BR');
                    });

                    sourceBadge.innerText = 'STATIC FILE';
                    sourceBadge.classList.remove('hidden');
                    
                    renderSpellsList();
                } catch (fallbackErr) {
                    console.error('Falha geral no carregamento:', fallbackErr);
                    showErrorState();
                }
            }
        }

        // Renderização HTML das Magias Agrupadas por Ciclo
        function renderSpellsList() {
            showLoading(false);
            
            const query = searchInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            const schoolVal = schoolSelect.value;
            
            // Filtragem pelo termo de busca e escola de magia
            const filteredSpells = allLoadedSpells.filter(spell => {
                // Filtro por Nome
                if (query) {
                    const normalizedSpellName = spell.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    if (!normalizedSpellName.includes(query)) return false;
                }
                
                // Filtro por Escola de Magia
                if (schoolVal !== 'Todas') {
                    const normSpellSchool = spell.school.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const normFilterSchool = schoolVal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    if (normSpellSchool !== normFilterSchool) return false;
                }
                
                return true;
            });

            if (filteredSpells.length === 0) {
                spellsContainer.classList.add('hidden');
                emptyStateDiv.classList.remove('hidden');
                resultsCountSpan.innerText = '0 magias encontradas';
                return;
            }

            emptyStateDiv.classList.add('hidden');
            spellsContainer.classList.remove('hidden');
            resultsCountSpan.innerText = `${filteredSpells.length} ${filteredSpells.length === 1 ? 'magia encontrada' : 'magias encontradas'}`;

            // Agrupar por ciclo
            const grouped = {};
            filteredSpells.forEach(spell => {
                const lvl = spell.level;
                if (!grouped[lvl]) grouped[lvl] = [];
                grouped[lvl].push(spell);
            });

            // Gerar HTML das seções de ciclos
            let html = '';
            
            // Ordena os ciclos do maior selecionado para o menor (ex: 3 -> 2 -> 1 -> 0)
            const sortedCycles = Object.keys(grouped).map(Number).sort((a, b) => b - a);

            sortedCycles.forEach(level => {
                const spellsInGroup = grouped[level];
                
                html += `
                    <div class="mb-10">
                        <div class="border-b border-zinc-800 pb-2 mb-6 flex items-center justify-between">
                            <h2 class="text-2xl font-title text-amber-500 uppercase tracking-wide">
                                ${cycleNames[level]}
                            </h2>
                            <span class="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-850 font-bold text-zinc-400">
                                ${spellsInGroup.length} ${spellsInGroup.length === 1 ? 'magia' : 'magias'}
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-1 gap-4">
                            ${spellsInGroup.map(spell => renderSpellCard(spell)).join('')}
                        </div>
                    </div>
                `;
            });

            spellsContainer.innerHTML = html;
        }

        // HTML Card Individual de Magia
        function renderSpellCard(spell) {
            const hasHighLevel = spell.high_level && spell.high_level.trim().length > 0;
            const isPrepared = magiasPreparadas.some(m => m.id === spell.id);
            const prepareBtnClass = isPrepared 
                ? "text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded bg-amber-600/20 border border-amber-600 text-amber-500 hover:bg-amber-600/30 transition-all"
                : "text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-amber-500 hover:border-amber-600/50 transition-all";
            const prepareBtnText = isPrepared ? "Despreparar" : "Preparar";

            return `
                <div class="bg-zinc-950/80 border border-zinc-850 rounded-lg overflow-hidden shadow transition-all duration-300 hover:border-amber-600/30">
                    <!-- Cabeçalho do Card (Clicável) -->
                    <div onclick="toggleSpellCollapse(${spell.id})" class="w-full text-left p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer focus:outline-none hover:bg-zinc-900/30 transition-colors">
                        <div>
                            <div class="flex items-center gap-3 flex-wrap">
                                <h3 class="text-xl font-bold uppercase tracking-tight text-white">${spell.name}</h3>
                                <span class="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-amber-600/10 border border-amber-600/30 text-amber-500">
                                    ${spell.school}
                                </span>
                            </div>
                            <!-- Tags rápidas de tempo e alcance -->
                            <div class="flex gap-4 mt-2 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                                <span><i class="fa-solid fa-clock mr-1 text-amber-600/70"></i> ${spell.casting_time}</span>
                                <span><i class="fa-solid fa-location-crosshairs mr-1 text-amber-600/70"></i> ${spell.range}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <button onclick="event.stopPropagation(); togglePrepareSpell(${spell.id})" class="${prepareBtnClass}">
                                <i class="fa-solid fa-book-journal-whills mr-1"></i> ${prepareBtnText}
                            </button>
                            <span class="text-xs text-zinc-500 font-bold uppercase tracking-widest md:block hidden ml-2">Ver detalhes</span>
                            <div id="arrow-icon-${spell.id}" class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-400 transition-transform duration-300">
                                <i class="fa-solid fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Detalhes do Grimório (Sanfona/Acordeão) -->
                    <div id="spell-details-${spell.id}" class="hidden border-t border-zinc-900 bg-zinc-900/15 p-6 transition-all">
                        <!-- Ficha Técnica Completa -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm p-4 bg-zinc-950/40 rounded border border-zinc-900/50">
                            <div>
                                <span class="block text-[10px] font-bold uppercase tracking-wider text-amber-500/70 mb-1">Tempo de Conjuração</span>
                                <span class="text-zinc-300 font-medium font-louis">${spell.casting_time}</span>
                            </div>
                            <div>
                                <span class="block text-[10px] font-bold uppercase tracking-wider text-amber-500/70 mb-1">Alcance</span>
                                <span class="text-zinc-300 font-medium font-louis">${spell.range}</span>
                            </div>
                            <div>
                                <span class="block text-[10px] font-bold uppercase tracking-wider text-amber-500/70 mb-1">Componentes</span>
                                <span class="text-zinc-300 font-medium font-louis">${spell.components || 'Nenhum'}</span>
                            </div>
                            <div>
                                <span class="block text-[10px] font-bold uppercase tracking-wider text-amber-500/70 mb-1">Duração</span>
                                <span class="text-zinc-300 font-medium font-louis">${spell.duration}</span>
                            </div>
                        </div>

                        <!-- Descrição Textual -->
                        <div class="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap space-y-4 font-louis">
                            <p>${spell.description}</p>
                        </div>

                        <!-- Seção Em Níveis Superiores -->
                        ${hasHighLevel ? `
                            <div class="mt-6 p-4 rounded-lg bg-amber-600/5 border border-amber-600/15 text-sm">
                                <strong class="block text-amber-500 font-semibold uppercase tracking-wider text-xs mb-2">
                                    <i class="fa-solid fa-angles-up mr-1"></i> Em Níveis Superiores
                                </strong>
                                <p class="text-zinc-300 italic font-louis">${spell.high_level}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // Controlar recolhimento / expansão do acordeão
        function toggleSpellCollapse(spellId) {
            const detailsDiv = document.getElementById(`spell-details-${spellId}`);
            const arrowDiv = document.getElementById(`arrow-icon-${spellId}`);
            
            if (detailsDiv.classList.contains('hidden')) {
                detailsDiv.classList.remove('hidden');
                arrowDiv.classList.add('rotate-180', 'text-amber-500', 'border-amber-600/30');
            } else {
                detailsDiv.classList.add('hidden');
                arrowDiv.classList.remove('rotate-180', 'text-amber-500', 'border-amber-600/30');
            }
        }

        // Loading states
        function showLoading(isLoading) {
            if (isLoading) {
                loadingDiv.classList.remove('hidden');
                spellsContainer.classList.add('hidden');
                emptyStateDiv.classList.add('hidden');
                resultsCountSpan.innerText = 'Buscando pergaminhos...';
            } else {
                loadingDiv.classList.add('hidden');
            }
        }

        function showErrorState() {
            showLoading(false);
            spellsContainer.classList.add('hidden');
            emptyStateDiv.classList.remove('hidden');
            resultsCountSpan.innerText = 'Erro ao carregar';
            emptyStateDiv.querySelector('h3').innerText = 'Erro de grimório';
            emptyStateDiv.querySelector('p').innerText = 'Houve uma falha ao abrir a base de dados de magias. Verifique a conexão do servidor.';
        }

        // --- GERENCIADOR DE SPELL SLOTS ---
        var spellSlotsManager = document.getElementById('spell-slots-manager');
        var characterLevelInput = document.getElementById('character-level');
        var longRestBtn = document.getElementById('long-rest-btn');
        var slotsContainer = document.getElementById('slots-container');

        let characterLevel = 1;
        let spentSlots = {}; 
        
        const fullCasters = ["Mago", "Clérigo", "Druida", "Bardo", "Feiticeiro"];

        const spellSlotProgression = {
            1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
            2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
            3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
            4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
            5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
            6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
            7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
            8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
            9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
            10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
            11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
            12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
            13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
            14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
            15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
            16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
            17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
            18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
            19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
            20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
        };

        function updateSpellSlotsVisibility() {
            const currentClass = classSelect.value;
            const preparedSection = document.getElementById('prepared-spells-section');
            if (fullCasters.includes(currentClass)) {
                spellSlotsManager.classList.remove('hidden');
                if (preparedSection) preparedSection.classList.remove('hidden');
                renderSpellSlots();
                renderPreparedSpells();
            } else {
                spellSlotsManager.classList.add('hidden');
                if (preparedSection) preparedSection.classList.add('hidden');
            }
        }

        window.toggleSlot = function(level, index) {
            if (!spentSlots[level]) {
                spentSlots[level] = {};
            }
            spentSlots[level][index] = !spentSlots[level][index];
            renderSpellSlots(); 
        };

        function renderSpellSlots() {
            const availableSlots = spellSlotProgression[characterLevel];
            let html = '';
            
            for (let i = 0; i < availableSlots.length; i++) {
                const maxSlots = availableSlots[i];
                if (maxSlots > 0) {
                    const spellLevel = i + 1;
                    
                    let slotsHtml = '';
                    for (let s = 0; s < maxSlots; s++) {
                        const isSpent = spentSlots[spellLevel] && spentSlots[spellLevel][s];
                        const iconClass = isSpent ? "fa-regular fa-circle text-zinc-600" : "fa-solid fa-circle text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]";
                        const buttonClass = "w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer " + (isSpent ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700" : "bg-zinc-900 border-amber-600/30 hover:bg-zinc-800 hover:scale-105");
                        
                        slotsHtml += `
                            <button onclick="toggleSlot(${spellLevel}, ${s})" class="${buttonClass}" title="${isSpent ? 'Restaurar Slot' : 'Gastar Slot'}">
                                <i class="${iconClass} text-sm transition-all duration-300"></i>
                            </button>
                        `;
                    }
                    
                    html += `
                        <div class="flex flex-col bg-zinc-950/50 p-4 rounded-lg border border-zinc-850 shadow-inner">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3">${spellLevel}º Ciclo</span>
                            <div class="flex gap-2 flex-wrap">
                                ${slotsHtml}
                            </div>
                        </div>
                    `;
                }
            }
            
            slotsContainer.innerHTML = html;
        }

        function togglePrepareSpell(spellId) {
            const spell = allLoadedSpells.find(s => s.id === spellId);
            if (!spell) return;
            
            const index = magiasPreparadas.findIndex(m => m.id === spellId);
            if (index > -1) {
                magiasPreparadas.splice(index, 1);
            } else {
                const limit = characterLevel + modificadorInt;
                if (magiasPreparadas.length >= limit) {
                    alert(`Limite de magias preparadas atingido (${limit}). Aumente o modificador de inteligência ou o nível.`);
                    return;
                }
                magiasPreparadas.push(spell);
            }
            
            renderSpellsList();
            renderPreparedSpells();
        }

        function renderPreparedSpells() {
            const limit = characterLevel + modificadorInt;
            const container = document.getElementById('prepared-spells-container');
            const countSpan = document.getElementById('prepared-count-span');
            
            if (countSpan) countSpan.innerText = `Magias Preparadas: ${magiasPreparadas.length} / ${limit}`;
            
            if (!container) return;
            
            if (magiasPreparadas.length === 0) {
                container.innerHTML = `<div class="text-zinc-500 text-sm italic text-center p-4">Nenhuma magia preparada no momento.</div>`;
                return;
            }
            
            const sorted = [...magiasPreparadas].sort((a, b) => {
                if (a.level !== b.level) return a.level - b.level;
                return a.name.localeCompare(b.name, 'pt-BR');
            });
            
            let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">';
            sorted.forEach(spell => {
                const cycleName = spell.level === 0 ? 'Truque' : `${spell.level}º Ciclo`;
                html += `
                    <div class="bg-zinc-950 border border-amber-600/30 p-3 rounded flex justify-between items-center group shadow-sm">
                        <div>
                            <div class="text-amber-500 font-bold text-sm truncate max-w-[150px] sm:max-w-[200px]" title="${spell.name}">${spell.name}</div>
                            <div class="text-zinc-500 text-[10px] uppercase tracking-wider">${cycleName}</div>
                        </div>
                        <button onclick="togglePrepareSpell(${spell.id})" class="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/50 transition-colors" title="Remover Magia">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }

        var modIntInput = document.getElementById('mod-int-input');
        if (modIntInput) {
            modIntInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 0;
                e.target.value = val;
                modificadorInt = val;
                renderPreparedSpells();
            });
        }

        characterLevelInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 1) val = 1;
            if (val > 20) val = 20;
            e.target.value = val;
            characterLevel = val;
            renderSpellSlots();
            renderPreparedSpells();
        });

        longRestBtn.addEventListener('click', () => {
            spentSlots = {};
            renderSpellSlots();
        });

        // Listeners de Eventos
        classSelect.addEventListener('change', () => {
            fetchSpells();
            updateSpellSlotsVisibility();
        });
        cycleSelect.addEventListener('change', fetchSpells);
        schoolSelect.addEventListener('change', renderSpellsList);
        searchInput.addEventListener('input', renderSpellsList);

        // Menu Hamburguer Responsivo
        document.getElementById('menu-btn').addEventListener('click', function() {
            const navContent = document.getElementById('nav-content');
            const menuIcon = this.querySelector('i');
            navContent.classList.toggle('hidden');
            if (navContent.classList.contains('hidden')) {
                menuIcon.classList.replace('fa-xmark', 'fa-bars');
            } else {
                menuIcon.classList.replace('fa-bars', 'fa-xmark');
            }
        });

        // Inicializar
        fetchSpells();
        updateSpellSlotsVisibility();
    

    
// Expose to window for inline React handlers
(window as any).fetchSpells = fetchSpells;
(window as any).renderSpellsList = renderSpellsList;
(window as any).renderSpellCard = renderSpellCard;
(window as any).toggleSpellCollapse = toggleSpellCollapse;
(window as any).showLoading = showLoading;
(window as any).showErrorState = showErrorState;
(window as any).updateSpellSlotsVisibility = updateSpellSlotsVisibility;
(window as any).renderSpellSlots = renderSpellSlots;
(window as any).togglePrepareSpell = togglePrepareSpell;
(window as any).renderPreparedSpells = renderPreparedSpells;

  }, []);

  return (
    <div className="font-sans">
      
        {/*  Banner da Seção  */}
        <section className="relative bg-cover bg-center text-white py-16 border-b border-zinc-800 overflow-hidden flex items-center justify-center" style={{backgroundImage: 'url(\'./assets/imagens/banner_st.png\')'}}>
            <div className="absolute inset-0 bg-black/75"></div>
            <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-title uppercase tracking-tight mb-4">Habilidades & Feitiços</h1>
                <p className="text-[#EBE3CB]/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                    Consulte o Grimório Arcano e Divino de D&D 5e. Escolha a sua classe e o seu ciclo máximo de magia para encontrar todos os feitiços disponíveis.
                </p>
            </div>
        </section>

        {/*  Seção de Filtros e Grimório  */}
        <section className="py-12 bg-black min-h-[600px]">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/*  Card de Filtros  */}
                <div className="bg-zinc-900/50 border border-zinc-850 p-6 rounded-xl mb-8 shadow-2xl backdrop-blur-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/*  Seleção de Classe  */}
                        <div className="flex flex-col">
                            <label htmlFor="class-select" className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                                <i className="fa-solid fa-hat-wizard mr-1"></i> Classe do Personagem
                            </label>
                            <select id="class-select" className="bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2.5 outline-none focus:border-amber-600 transition-all text-sm font-medium cursor-pointer">
                                <option value="Mago" selected>Mago (Wizard)</option>
                                <option value="Clérigo">Clérigo (Cleric)</option>
                                <option value="Druida">Druida (Druid)</option>
                                <option value="Bardo">Bardo (Bard)</option>
                                <option value="Bruxo">Bruxo (Warlock)</option>
                                <option value="Feiticeiro">Feiticeiro (Sorcerer)</option>
                                <option value="Paladino">Paladino (Paladin)</option>
                                <option value="Patrulheiro">Patrulheiro (Ranger)</option>
                            </select>
                        </div>

                        {/*  Seleção de Ciclo Máximo  */}
                        <div className="flex flex-col">
                            <label htmlFor="cycle-select" className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                                <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Ciclo Máximo
                            </label>
                            <select id="cycle-select" className="bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2.5 outline-none focus:border-amber-600 transition-all text-sm font-medium cursor-pointer">
                                <option value="0">Truques (Ciclo 0)</option>
                                <option value="1">1º Ciclo (Nível 1)</option>
                                <option value="2">2º Ciclo (Nível 2)</option>
                                <option value="3" selected>3º Ciclo (Nível 3 e abaixo)</option>
                                <option value="4">4º Ciclo (Nível 4 e abaixo)</option>
                                <option value="5">5º Ciclo (Nível 5 e abaixo)</option>
                                <option value="6">6º Ciclo (Nível 6 e abaixo)</option>
                                <option value="7">7º Ciclo (Nível 7 e abaixo)</option>
                                <option value="8">8º Ciclo (Nível 8 e abaixo)</option>
                                <option value="9">9º Ciclo (Nível 9 e abaixo)</option>
                            </select>
                        </div>

                        {/*  Seleção de Escola de Magia  */}
                        <div className="flex flex-col">
                            <label htmlFor="school-select" className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                                <i className="fa-solid fa-scroll mr-1"></i> Escola de Magia
                            </label>
                            <select id="school-select" className="bg-zinc-950 border border-zinc-800 text-white rounded px-3 py-2.5 outline-none focus:border-amber-600 transition-all text-sm font-medium cursor-pointer">
                                <option value="Todas" selected>Todas as Escolas</option>
                                <option value="Abjuração">Abjuração</option>
                                <option value="Adivinhação">Adivinhação</option>
                                <option value="Conjuração">Conjuração</option>
                                <option value="Encantamento">Encantamento</option>
                                <option value="Evocação">Evocação</option>
                                <option value="Ilusão">Ilusão</option>
                                <option value="Necromancia">Necromancia</option>
                                <option value="Transmutação">Transmutação</option>
                            </select>
                        </div>

                        {/*  Busca de Magias  */}
                        <div className="flex flex-col">
                            <label htmlFor="search-input" className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                                <i className="fa-solid fa-magnifying-glass mr-1"></i> Pesquisar pelo Nome
                            </label>
                            <div className="relative">
                                <input type="text" id="search-input" placeholder="Ex: Bola de Fogo..." className="w-full bg-zinc-950 border border-zinc-800 text-white rounded pl-10 pr-3 py-2.5 outline-none focus:border-amber-600 transition-all text-sm font-medium" />
                                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-zinc-500 text-sm"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Gerenciador de Spell Slots  */}
                <div id="spell-slots-manager" className="hidden bg-zinc-900/50 border border-zinc-850 p-6 rounded-xl mb-8 shadow-2xl backdrop-blur-sm transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-wand-magic-sparkles text-amber-500 text-xl"></i>
                            <h2 className="text-lg font-title text-amber-500 uppercase tracking-wide">Espaços de Magia</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="character-level" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nível:</label>
                                <input type="number" id="character-level" min="1" max="20" defaultValue="1" className="w-16 bg-zinc-950 border border-zinc-800 text-white rounded px-2 py-1.5 outline-none focus:border-amber-600 transition-all text-sm font-medium text-center" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="mod-int-input" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mod (Int):</label>
                                <input type="number" id="mod-int-input" defaultValue="3" className="w-16 bg-zinc-950 border border-zinc-800 text-white rounded px-2 py-1.5 outline-none focus:border-amber-600 transition-all text-sm font-medium text-center" />
                            </div>
                            <button id="long-rest-btn" className="bg-black hover:bg-zinc-800 text-amber-500 border border-zinc-800 hover:border-amber-600/50 transition-all px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <i className="fa-solid fa-bed"></i> Descanso Longo
                            </button>
                        </div>
                    </div>
                    
                    <div id="slots-container" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/*  Gerado dinamicamente via JS  */}
                    </div>
                </div>

                {/*  Magias Preparadas  */}
                <div id="prepared-spells-section" className="hidden bg-zinc-900/30 border border-zinc-850 p-6 rounded-xl mb-8 shadow-inner transition-all duration-300">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-book-open text-amber-600 text-lg"></i>
                            <h2 className="text-base font-title text-amber-500 uppercase tracking-wide">Magias Preparadas</h2>
                        </div>
                        <span id="prepared-count-span" className="text-xs px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 font-bold text-amber-500">
                            Magias Preparadas: 0 / 4
                        </span>
                    </div>
                    <div id="prepared-spells-container">
                        {/* Renderizado por JS */}
                    </div>
                </div>

                {/*  Info Geral / Contador  */}
                <div className="flex justify-between items-center mb-6 px-1">
                    <span id="results-count" className="text-xs font-bold uppercase tracking-widest text-[#EBE3CB]/60">
                        Carregando Grimório...
                    </span>
                    <span id="source-badge" className="hidden text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">
                        -
                    </span>
                </div>

                {/*  Estado de Carregamento (Loading)  */}
                <div id="loading" className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Buscando magias nos pergaminhos...</p>
                </div>

                {/*  Grimório / Resultados das Magias  */}
                <div id="spells-container" className="hidden space-y-8">
                    {/*  Gerado dinamicamente via JS  */}
                </div>

                {/*  Estado Vazio (Empty State)  */}
                <div id="empty-state" className="hidden flex flex-col items-center justify-center py-20 text-center">
                    <i className="fa-solid fa-box-open text-zinc-700 text-5xl mb-6"></i>
                    <h3 className="text-2xl font-title text-[#EBE3CB] mb-2">Nenhuma magia encontrada</h3>
                    <p className="text-zinc-500 max-w-sm text-sm">Nenhum feitiço corresponde aos filtros selecionados. Tente aumentar o ciclo ou limpar o campo de pesquisa.</p>
                </div>

            </div>
        </section>
    
    </div>
  );
}
