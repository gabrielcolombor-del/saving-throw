// @ts-nocheck

import React, { useEffect } from 'react';

export function Sons() {
  useEffect(() => {
    try {
      
        // Menu Mobile Toggle
        var menuBtn = document.getElementById('menu-btn');
        var navContent = document.getElementById('nav-content');
        if (menuBtn && navContent) {
            menuBtn.addEventListener('click', function() {
                var menuIcon = this.querySelector('i');
                navContent.classList.toggle('hidden');
                if (navContent.classList.contains('hidden')) {
                    menuIcon.classList.replace('fa-xmark', 'fa-bars');
                } else {
                    menuIcon.classList.replace('fa-bars', 'fa-xmark');
                }
            });
        }

        // ==========================================
        // BASE DE DADOS DOS EFEITOS SONOROS REALISTAS
        // ==========================================

        var sfxData = [
            { id: 'amb-combate-gritando-dor', name: 'Homem Gritando Dor', categories: ['ambiente', 'combate'], file: '/assets/sounds/Ambiente%20-%20combate%20-%20homem%20gritando%20dor.mp3', icon: 'fa-user-slash' },
            { id: 'amb-batendo-porta', name: 'Batendo na Porta', categories: ['ambiente'], file: '/assets/sounds/ambiente%20-%20Batendo%20na%20porta.mp3', icon: 'fa-hand-fist' },
            { id: 'amb-fechando-porta', name: 'Fechando Porta', categories: ['ambiente'], file: '/assets/sounds/ambiente%20-%20Fechando%20Porta.mp3', icon: 'fa-door-closed' },
            { id: 'amb-grito-horror', name: 'Grito de Horror', categories: ['ambiente'], file: '/assets/sounds/ambiente%20-%20Grito%20Horror.mp3', icon: 'fa-ghost' },
            { id: 'amb-moedas', name: 'Moedas de Ouro', categories: ['ambiente', 'taverna'], file: '/assets/sounds/ambiente%20-%20Moedas.mp3', icon: 'fa-coins' },
            { id: 'amb-risada-maligna', name: 'Risada Maligna', categories: ['ambiente', 'monstro'], file: '/assets/sounds/ambiente%20-%20Risada%20Maligna.mp3', icon: 'fa-masks-theater' },
            { id: 'amb-risada-demoniaca', name: 'Risada Demoníaca', categories: ['ambiente', 'monstro'], file: '/assets/sounds/ambiente%20-%20Risada%20demoniaca.mp3', icon: 'fa-skull' },
            { id: 'amb-abrindo-porta', name: 'Abrindo Porta', categories: ['ambiente'], file: '/assets/sounds/ambiente%20-%20abrindo%20porta.mp3', icon: 'fa-door-open' },
            { id: 'amb-combate-grito-monstro', name: 'Grito de Monstro', categories: ['ambiente', 'combate', 'monstro'], file: '/assets/sounds/ambiente%20-%20combate%20-%20Grito%20Monstro.mp3', icon: 'fa-dragon' },
            { id: 'amb-combate-homem-morrendo', name: 'Homem Morrendo', categories: ['ambiente', 'combate'], file: '/assets/sounds/ambiente%20-%20combate%20-%20homem%20morrendo.mp3', icon: 'fa-skull-crossbones' },
            { id: 'amb-combate-homem-sofrendo', name: 'Homem Sofrendo', categories: ['ambiente', 'combate'], file: '/assets/sounds/ambiente%20-%20combate%20-%20homem%20sofrendo.mp3', icon: 'fa-heart-crack' },
            { id: 'amb-combate-sacando-espada', name: 'Sacando Espada', categories: ['ambiente', 'combate'], file: '/assets/sounds/ambiente%20-%20combate%20-%20sacando%20espada.mp3', icon: 'fa-shield-halved' },
            { id: 'amb-monstro-distancia', name: 'Monstro à Distância', categories: ['ambiente', 'monstro'], file: '/assets/sounds/ambiente%20-%20monstro%20-%20Monstro%20grande%20a%20distancia.mp3', icon: 'fa-paw' },
            { id: 'amb-monstro-passos-pesados', name: 'Passos Pesados Monstro', categories: ['ambiente', 'monstro'], file: '/assets/sounds/ambiente%20-%20monstro%20-%20Passos%20pesados.mp3', icon: 'fa-shoe-prints' },
            { id: 'amb-passos', name: 'Passos', categories: ['ambiente'], file: '/assets/sounds/ambiente%20-%20passos.mp3', icon: 'fa-person-walking' },
            { id: 'amb-porta-rangendo', name: 'Porta Rangendo', categories: ['ambiente'], file: '/assets/sounds/ambiente%20-%20porta%20rangendo.mp3', icon: 'fa-dungeon' },
            { id: 'amb-risada-homem', name: 'Risada de Homem', categories: ['ambiente', 'taverna'], file: '/assets/sounds/ambiente%20-%20risada%20homem.mp3', icon: 'fa-face-laugh-beam' },
            { id: 'amb-risada-mulher', name: 'Risada de Mulher', categories: ['ambiente', 'taverna'], file: '/assets/sounds/ambiente%20-%20risada%20mulher.mp3', icon: 'fa-face-smile-wink' },
            { id: 'amb-servindo-liquido', name: 'Servindo Bebida', categories: ['ambiente', 'taverna'], file: '/assets/sounds/ambiente%20-%20servindo%20liquido.mp3', icon: 'fa-wine-glass' },
            { id: 'combate-impacto-flecha', name: 'Impacto de Flecha', categories: ['combate'], file: '/assets/sounds/combate%20-%20Impacto%20Flecha.mp3', icon: 'fa-crosshairs' },
            { id: 'combate-amb-ossos-quebrando', name: 'Ossos Quebrando', categories: ['combate', 'ambiente'], file: '/assets/sounds/combate%20-%20ambiente%20-%20Ossos%20quebrando.mp3', icon: 'fa-bone' },
            { id: 'combate-chute', name: 'Chute', categories: ['combate'], file: '/assets/sounds/combate%20-%20chute.mp3', icon: 'fa-hand-fist' },
            { id: 'combate-corte-lamina', name: 'Corte de Lâmina', categories: ['combate'], file: '/assets/sounds/combate%20-%20corte%20de%20lamina.mp3', icon: 'fa-bolt' },
            { id: 'combate-espada-escudo', name: 'Espada no Escudo', categories: ['combate'], file: '/assets/sounds/combate%20-%20espada%20no%20escudo.mp3', icon: 'fa-shield' },
            { id: 'combate-espada-metal', name: 'Espada no Metal', categories: ['combate'], file: '/assets/sounds/combate%20-%20espada%20no%20metal.mp3', icon: 'fa-shield-halved' },
            { id: 'combate-espada', name: 'Golpe de Espada', categories: ['combate'], file: '/assets/sounds/combate%20-%20espada.mp3', icon: 'fa-gavel' },
            { id: 'combate-flecha', name: 'Disparo de Flecha', categories: ['combate'], file: '/assets/sounds/combate%20-%20flecha.mp3', icon: 'fa-location-arrow' },
            { id: 'combate-golpe-forte-espada', name: 'Golpe Forte de Espada', categories: ['combate'], file: '/assets/sounds/combate%20-%20golpe%20forte%20espada.mp3', icon: 'fa-burst' },
            { id: 'combate-osso-quebrando', name: 'Osso Quebrando', categories: ['combate'], file: '/assets/sounds/combate%20-%20osso%20quebrando.mp3', icon: 'fa-skull-crossbones' },
            { id: 'combate-soco', name: 'Soco', categories: ['combate'], file: '/assets/sounds/combate%20-%20soco.mp3', icon: 'fa-hand-fist' },
            { id: 'magia-cura', name: 'Magia de Cura', categories: ['magia'], file: '/assets/sounds/magia%20-%20Magia%20Cura.mp3', icon: 'fa-wand-magic-sparkles' },
            { id: 'magia-relampago', name: 'Magia de Relâmpago', categories: ['magia'], file: '/assets/sounds/magia%20-%20Magia%20Relampago.mp3', icon: 'fa-bolt-lightning' },
            { id: 'magia-vento', name: 'Magia de Vento', categories: ['magia'], file: '/assets/sounds/magia%20-%20Magia%20Vento.mp3', icon: 'fa-wind' },
            { id: 'magia-fogo', name: 'Magia de Fogo', categories: ['magia'], file: '/assets/sounds/magia%20-%20Magia%20de%20fogo.mp3', icon: 'fa-fire-flame-curved' },
            { id: 'magia-maldicao', name: 'Maldição', categories: ['magia'], file: '/assets/sounds/magia%20-%20Maldi%C3%A7%C3%A3o.mp3', icon: 'fa-hat-wizard' },
            { id: 'magia-fireball', name: 'Bola de Fogo (Fireball)', categories: ['magia'], file: '/assets/sounds/magia%20-%20fireball.mp3', icon: 'fa-fire' },
            { id: 'monstro-marinho-dragao', name: 'Monstro Marinho / Dragão', categories: ['monstro'], file: '/assets/sounds/monstro%20-%20Monstro%20Marinho%20,%20Drag%C3%A3o.mp3', icon: 'fa-water' },
            { id: 'monstro-rosnado-2', name: 'Rosnado de Monstro 2', categories: ['monstro'], file: '/assets/sounds/monstro%20-%20Rosnado%20Monstro%202.mp3', icon: 'fa-volcano' },
            { id: 'monstro-rosnado-1', name: 'Rosnado de Monstro', categories: ['monstro'], file: '/assets/sounds/monstro%20-%20Rosnado%20Monstro.mp3', icon: 'fa-dragon' },
            { id: 'monstro-mordida', name: 'Mordida de Monstro', categories: ['monstro'], file: '/assets/sounds/monstro%20-%20mordida%20monstro.mp3', icon: 'fa-skull' }
        ];

        var defaultAmbientData = [
            { id: 'long-rest', name: 'Long Rest', category: 'taverna', icon: 'fa-bed', desc: 'Música & Descanso', ytId: 'PsG-pKC60fU' },
            { id: 'dark-suspense', name: 'Dark Suspense', category: 'ambiente', icon: 'fa-skull', desc: 'Tensão & Sombra', ytId: 'l3UIq-swjco' },
            { id: 'exploracao-suspense', name: 'Exploração Suspense', category: 'ambiente', icon: 'fa-compass', desc: 'Mistério & Exploração', ytId: 'EApZmmYg_oQ' },
            { id: 'investigacao-suspense', name: 'Investigação Suspense', category: 'ambiente', icon: 'fa-magnifying-glass', desc: 'Investigação & Tensão', ytId: 'l-vpJVMWUvk' },
            { id: 'combate-1', name: 'Combate 1', category: 'combate', icon: 'fa-shield-halved', desc: 'Batalha Épica 1', ytId: 't3B802PIuB0' },
            { id: 'combate-2', name: 'Combate 2', category: 'combate', icon: 'fa-drum', desc: 'Batalha Épica 2', ytId: 'm-1S1V1PZHA' },
            { id: 'combate-3', name: 'Combate 3', category: 'combate', icon: 'fa-crosshairs', desc: 'Batalha Épica 3', ytId: 'sd1Otp7s1Fk' },
            { id: 'combate-4', name: 'Combate 4', category: 'combate', icon: 'fa-bolt', desc: 'Batalha Épica 4', ytId: 'NHuRniA3F6s' },
            { id: 'taverna', name: 'Taverna Animada', category: 'taverna', icon: 'fa-beer-mug-empty', desc: 'Risadas & Alaúde', ytId: 'roABNwbjZf4' },
            { id: 'floresta', name: 'Floresta Mística', category: 'ambiente', icon: 'fa-tree', desc: 'Vento & Pássaros', ytId: 'xNN7iTA57jM' },
            { id: 'chuva', name: 'Tempestade & Chuva', category: 'ambiente', icon: 'fa-cloud-showers-heavy', desc: 'Chuva Forte & Trovões', ytId: 'mPZkdNFkNps' },
            { id: 'tempestade-areia', name: 'Tempestade de Areia', category: 'ambiente', icon: 'fa-wind', desc: 'Deserto & Ventania', ytId: 'NEOvz3k9DuQ', start: 10 },
            { id: 'fogueira', name: 'Fogueira de Acampamento', category: 'ambiente', icon: 'fa-fire', desc: 'Estalos de Madeira', ytId: 'L_LUpnjgPso' }
        ];

        // ==========================================
        // SISTEMA DE USUÁRIO E GERENCIADOR DE MESAS (PROFILES) & CENAS
        // ==========================================

        var defaultPresetScenes = [];

        var currentUser = JSON.parse(localStorage.getItem('st_user')) || null;
        var customAmbients = JSON.parse(localStorage.getItem(`st_custom_ambients_${currentUser ? currentUser.id : 'guest'}`)) || [];
        var editingCustomAmbientId = null;

        function getAmbientData() {
            return [...defaultAmbientData, ...customAmbients];
        }


        function editCustomAmbient(ambId) {
            var amb = customAmbients.find(a => a.id === ambId);
            if (!amb) return;
            
            editingCustomAmbientId = amb.id;
            
            document.getElementById('custom-ambient-url').value = `https://youtube.com/watch?v=${amb.ytId}`;
            document.getElementById('custom-ambient-name').value = amb.name;
            
            var btn = document.getElementById('custom-ambient-submit-btn');
            if (btn) btn.innerHTML = 'Salvar';
            
            var cancelBtn = document.getElementById('custom-ambient-cancel-btn');
            if (cancelBtn) cancelBtn.classList.remove('hidden');

            document.getElementById('custom-ambient-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        function cancelEditCustomAmbient() {
            editingCustomAmbientId = null;
            document.getElementById('custom-ambient-form').reset();
            var btn = document.getElementById('custom-ambient-submit-btn');
            if (btn) btn.innerHTML = 'Adicionar';
            
            var cancelBtn = document.getElementById('custom-ambient-cancel-btn');
            if (cancelBtn) cancelBtn.classList.add('hidden');
        }

        function deleteCustomAmbient(ambId) {
            if (!confirm('Deseja realmente remover este som personalizado?')) return;
            customAmbients = customAmbients.filter(a => a.id !== ambId);
            localStorage.setItem(`st_custom_ambients_${currentUser ? currentUser.id : 'guest'}`, JSON.stringify(customAmbients));
            if (activeTracks[ambId]) {
                stopAmbientTrack(ambId);
            }
            syncCustomAmbientsToCloud();
            renderAmbients();
            renderScenesUI();
            showToast('Som removido.', 'info');
        }

        async function syncCustomAmbientsToCloud() {
            if (!currentUser || !currentUser.id) return;
            try {
                await fetch('/api/gm-profiles?action=save_custom_ambients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        customAmbients: customAmbients
                    })
                });
            } catch (e) {
                console.warn('Erro ao sincronizar custom ambients:', e);
            }
        }
        
        var defaultSingleTable = [
            {
                id: 'default_mesa',
                name: 'Mesa 1: Aventura Principal',
                favorites: [],
                favoriteAmbients: [],
                quick_slots: {},
                scenes: JSON.parse(JSON.stringify(defaultPresetScenes))
            }
        ];

        var tableProfiles = defaultSingleTable;
        var activeProfileId = 'default_mesa';

        if (currentUser) {
            var saved = localStorage.getItem('st_table_profiles');
            if (saved) {
                try { tableProfiles = JSON.parse(saved); } catch(e) {}
            }
            activeProfileId = localStorage.getItem('st_active_profile') || tableProfiles[0]?.id || 'default_mesa';
        } else {
            var saved = localStorage.getItem('st_table_profiles');
            if (saved) {
                try { tableProfiles = JSON.parse(saved); } catch(e) {}
            }
            activeProfileId = localStorage.getItem('st_active_profile') || tableProfiles[0]?.id || 'default_mesa';
        }

        function getActiveProfile() {
            var p = tableProfiles.find(item => item.id === activeProfileId);
            if (!p && tableProfiles.length > 0) {
                p = tableProfiles[0];
                activeProfileId = p.id;
            }
            if (p && !p.scenes) {
                p.scenes = JSON.parse(JSON.stringify(defaultPresetScenes));
            }
            return p || { id: 'default_mesa', name: 'Mesa Principal', favorites: [], favoriteAmbients: [], quick_slots: {}, scenes: JSON.parse(JSON.stringify(defaultPresetScenes)) };
        }

        var favoriteSounds = getActiveProfile().favorites || [];
        var favoriteAmbients = getActiveProfile().favoriteAmbients || getActiveProfile().favorite_ambients || [];
        var quickSlots = getActiveProfile().quick_slots || {};
        var tableScenes = getActiveProfile().scenes || JSON.parse(JSON.stringify(defaultPresetScenes));
        var activeSceneId = null;
        var crossfadeIntervalId = null;
        var isCrossfading = false;
        var crossfadeTargetScene = null;
        var selectedModalIcon = 'fa-masks-theater';

        function restoreActiveState(state) {
            if (!state) return;
            
            if (state.masterVolume !== undefined) {
                masterVolumeValue = state.masterVolume / 100;
                if (masterVolInput) masterVolInput.value = state.masterVolume;
                if (masterVolLabel) masterVolLabel.textContent = `${state.masterVolume}%`;
            }

            Object.keys(activeTracks).forEach(ambId => stopAmbientTrack(ambId));

            if (state.activeTracks) {
                Object.keys(state.activeTracks).forEach(ambId => {
                    var ambDef = getAmbientData().find(a => a.id === ambId);
                    if (ambDef) {
                        startAmbientTrack(ambDef, state.activeTracks[ambId].vol);
                    }
                });
            }
        }

        var debouncedSyncTimeout = null;
        function debouncedSyncActiveProfileChanges() {
            if (debouncedSyncTimeout) clearTimeout(debouncedSyncTimeout);
            debouncedSyncTimeout = setTimeout(() => {
                syncActiveProfileChanges();
            }, 1000);
        }

        function syncActiveProfileChanges() {
            var p = getActiveProfile();
            p.favorites = favoriteSounds;
            p.favoriteAmbients = favoriteAmbients;
            p.favorite_ambients = favoriteAmbients;
            p.quick_slots = quickSlots;
            p.scenes = tableScenes;
            
            // Gravar Estado ao Vivo (Quais sons estão tocando e volumes)
            var activeKeys = Object.keys(activeTracks);
            var stateTracks = {};
            activeKeys.forEach(k => {
                stateTracks[k] = { vol: activeTracks[k].vol };
            });
            p.active_state = {
                activeTracks: stateTracks,
                masterVolume: typeof masterVolumeValue !== 'undefined' ? Math.round(masterVolumeValue * 100) : 80
            };

            localStorage.setItem('st_table_profiles', JSON.stringify(tableProfiles));
            localStorage.setItem('st_active_profile', activeProfileId);
            
            if (currentUser && currentUser.id) {
                // Salvar localmente atrelado à conta do usuário
                localStorage.setItem(`st_profiles_${currentUser.id}`, JSON.stringify(tableProfiles));
                
                fetch('/api/gm-profiles?action=save_profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        profileId: p.id,
                        name: p.name,
                        favorites: p.favorites,
                        favoriteAmbients: p.favoriteAmbients,
                        quickSlots: p.quick_slots,
                        scenes: p.scenes,
                        activeState: p.active_state
                    })
                }).catch(e => console.log('Sync server err:', e));
            }
        }

        function renderTableProfilesUI() {
            var select = document.getElementById('table-profile-select');
            if (!select) return;

            select.innerHTML = '';
            tableProfiles.forEach(p => {
                var opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                if (p.id === activeProfileId) opt.selected = true;
                select.appendChild(opt);
            });
        }

        var profileSelect = document.getElementById('table-profile-select');
        var addTableBtn = document.getElementById('add-table-btn');
        var renameTableBtn = document.getElementById('rename-table-btn');
        var deleteTableBtn = document.getElementById('delete-table-btn');

        if (profileSelect) {
            profileSelect.addEventListener('change', (e) => {
                activeProfileId = e.target.value;
                var p = getActiveProfile();
                favoriteSounds = p.favorites || [];
                favoriteAmbients = p.favoriteAmbients || p.favorite_ambients || [];
                quickSlots = p.quick_slots || {};
                tableScenes = p.scenes || JSON.parse(JSON.stringify(defaultPresetScenes));
                activeSceneId = null;
                if (currentUser) localStorage.setItem('st_active_profile', activeProfileId);

                renderQuickSlots();
                renderFavorites();
                renderSFXCatalog();
                renderAmbients();
                renderScenesUI();
                
                restoreActiveState(p.active_state);
            });
        }

        if (addTableBtn) {
            addTableBtn.addEventListener('click', () => {
                if (!currentUser) {
                    openAuthModal();
                    if (authErrorMsg) {
                        authErrorMsg.textContent = '🔑 Faça login ou crie uma conta para criar e salvar perfis de mesas de RPG!';
                        authErrorMsg.classList.remove('hidden');
                    }
                    return;
                }

                var name = prompt('Digite o nome da nova Mesa de RPG (ex: Mesa 2: A Caverna do Dragão):');
                if (name && name.trim()) {
                    var newId = `mesa_${Date.now()}`;
                    var newProfile = {
                        id: newId,
                        name: name.trim(),
                        favorites: [],
                        favoriteAmbients: [],
                        quick_slots: {},
                        scenes: JSON.parse(JSON.stringify(defaultPresetScenes))
                    };
                    tableProfiles.push(newProfile);
                    activeProfileId = newId;
                    favoriteSounds = newProfile.favorites;
                    favoriteAmbients = newProfile.favoriteAmbients;
                    quickSlots = newProfile.quick_slots;
                    tableScenes = newProfile.scenes;
                    activeSceneId = null;

                    syncActiveProfileChanges();
                    renderTableProfilesUI();
                    renderQuickSlots();
                    renderFavorites();
                    renderSFXCatalog();
                    renderAmbients();
                    renderScenesUI();
                }
            });
        }

        if (renameTableBtn) {
            renameTableBtn.addEventListener('click', () => {
                if (!currentUser) {
                    openAuthModal();
                    if (authErrorMsg) {
                        authErrorMsg.textContent = '🔑 Faça login ou crie uma conta para alterar e salvar perfis de mesas!';
                        authErrorMsg.classList.remove('hidden');
                    }
                    return;
                }

                var p = getActiveProfile();
                var newName = prompt('Digite o novo nome para esta Mesa:', p.name);
                if (newName && newName.trim()) {
                    p.name = newName.trim();
                    syncActiveProfileChanges();
                    renderTableProfilesUI();
                }
            });
        }

        if (deleteTableBtn) {
            deleteTableBtn.addEventListener('click', () => {
                if (!currentUser) {
                    openAuthModal();
                    if (authErrorMsg) {
                        authErrorMsg.textContent = '🔑 Faça login ou crie uma conta para gerenciar perfis de mesas!';
                        authErrorMsg.classList.remove('hidden');
                    }
                    return;
                }

                if (tableProfiles.length <= 1) {
                    alert('Você deve manter pelo menos uma mesa cadastrada!');
                    return;
                }
                var p = getActiveProfile();
                if (confirm(`Tem certeza que deseja excluir o perfil da mesa "${p.name}"?`)) {
                    tableProfiles = tableProfiles.filter(item => item.id !== p.id);
                    activeProfileId = tableProfiles[0].id;
                    var nextP = getActiveProfile();
                    favoriteSounds = nextP.favorites || [];
                    favoriteAmbients = nextP.favoriteAmbients || nextP.favorite_ambients || [];
                    quickSlots = nextP.quick_slots || {};
                    tableScenes = nextP.scenes || JSON.parse(JSON.stringify(defaultPresetScenes));
                    activeSceneId = null;

                    fetch('/api/gm-profiles?action=delete_profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUser.id, profileId: p.id })
                    }).catch(e => console.log('Delete profile err:', e));

                    syncActiveProfileChanges();
                    renderTableProfilesUI();
                    renderQuickSlots();
                    renderFavorites();
                    renderSFXCatalog();
                    renderAmbients();
                    renderScenesUI();
                }
            });
        }

        // ==========================================
        // UI DE LOGIN, ANÚNCIO E AUTENTICAÇÃO RESILIENTE
        // ==========================================

        var banner = document.getElementById('top-login-banner') || document.getElementById('login-announcement-banner');
        var userHeaderArea = document.getElementById('user-header-area');
        var authModal = document.getElementById('auth-modal');
        var closeAuthModalBtn = document.getElementById('close-auth-modal');
        var bannerLoginBtn = document.getElementById('banner-login-btn');
        var navLoginBtn = document.getElementById('nav-login-btn');

        // Helpers de Usuários e Armazenamento Local
        function getRegisteredUsers() {
            try {
                return JSON.parse(localStorage.getItem('st_registered_users')) || [];
            } catch(e) {
                return [];
            }
        }

        function saveRegisteredUser(userObj, password = null) {
            var users = getRegisteredUsers();
            var normalizedEmail = (userObj.email || '').toLowerCase().trim();
            var idx = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
            var record = {
                id: userObj.id,
                email: normalizedEmail,
                name: userObj.name || 'Mestre de RPG',
                avatarUrl: userObj.avatarUrl || '',
                password: password || (idx >= 0 ? users[idx].password : ''),
                isGoogle: !!userObj.isGoogle,
                updated_at: new Date().toISOString()
            };
            if (idx >= 0) {
                users[idx] = { ...users[idx], ...record };
            } else {
                users.push(record);
            }
            localStorage.setItem('st_registered_users', JSON.stringify(users));
        }

        // Sistema de Toast Notifications
        function showToast(message, type = 'info') {
            var container = document.getElementById('toast-container');
            if (!container) return;
            var toast = document.createElement('div');
            var bg = 'bg-zinc-900 border-zinc-700 text-white';
            var icon = '<i class="fa-solid fa-circle-info text-amber-400 text-sm"></i>';
            if (type === 'success') {
                bg = 'bg-zinc-900 border-emerald-500 text-emerald-300';
                icon = '<i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i>';
            } else if (type === 'error') {
                bg = 'bg-zinc-900 border-red-500 text-red-300';
                icon = '<i class="fa-solid fa-triangle-exclamation text-red-400 text-sm"></i>';
            } else if (type === 'google') {
                bg = 'bg-zinc-900 border-zinc-600 text-white';
                icon = '<i class="fa-brands fa-google text-red-400 text-sm"></i>';
            }
            toast.className = `${bg} border pointer-events-auto shadow-2xl rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-3 transition-all duration-300 transform translate-y-3 opacity-0`;
            toast.innerHTML = `<span>${icon}</span><span class="flex-1">${message}</span>`;
            container.appendChild(toast);

            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-3', 'opacity-0');
            });

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-3');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        function applyUserData(user, profiles) {
            currentUser = user;
            localStorage.setItem('st_user', JSON.stringify(currentUser));

            if (user.customAmbients && user.customAmbients.length > 0) {
                customAmbients = user.customAmbients;
                localStorage.setItem(`st_custom_ambients_${currentUser.id}`, JSON.stringify(customAmbients));
            } else {
                var localCA = JSON.parse(localStorage.getItem(`st_custom_ambients_${currentUser.id}`)) || [];
                if (localCA.length > 0) {
                    customAmbients = localCA;
                    syncCustomAmbientsToCloud();
                } else {
                    customAmbients = [];
                }
            }

            if (profiles && profiles.length > 0) {
                tableProfiles = profiles.map(p => {
                    if (!p.scenes) {
                        p.scenes = JSON.parse(JSON.stringify(defaultPresetScenes));
                    }
                    return p;
                });
            } else {
                var saved = localStorage.getItem(`st_profiles_${user.id}`);
                if (saved) {
                    try { tableProfiles = JSON.parse(saved); } catch(e) {}
                }
            }

            activeProfileId = tableProfiles[0]?.id || 'default_mesa';
            favoriteSounds = tableProfiles[0]?.favorites || [];
            favoriteAmbients = tableProfiles[0]?.favoriteAmbients || tableProfiles[0]?.favorite_ambients || [];
            quickSlots = tableProfiles[0]?.quick_slots || {};
            tableScenes = tableProfiles[0]?.scenes || JSON.parse(JSON.stringify(defaultPresetScenes));
            activeSceneId = null;

            localStorage.setItem('st_table_profiles', JSON.stringify(tableProfiles));
            localStorage.setItem('st_active_profile', activeProfileId);
            localStorage.setItem(`st_profiles_${user.id}`, JSON.stringify(tableProfiles));

            updateAuthUI();
            renderTableProfilesUI();
            renderQuickSlots();
            renderFavorites();
            renderSFXCatalog();
            renderAmbients();
            renderScenesUI();
            restoreActiveState(tableProfiles[0]?.active_state);
            closeAuthModal();
        }

        function updateAuthUI() {
            if (currentUser) {
                if (banner) banner.classList.add('hidden');
                if (userHeaderArea) {
                    var avatarImg = currentUser.avatarUrl ? `<img src="${currentUser.avatarUrl}" class="w-5 h-5 rounded-full object-cover">` : `<i class="${currentUser.isGoogle ? 'fa-brands fa-google text-red-400' : 'fa-solid fa-user-shield text-amber-400'} text-sm"></i>`;
                    userHeaderArea.innerHTML = `
                        <div class="relative">
                            <button id="user-menu-btn" class="flex items-center gap-2 bg-black text-[#EBE3CB] hover:bg-zinc-900 px-3 py-1.5 rounded-lg border border-amber-600/40 text-xs shadow-md cursor-pointer transition-all">
                                ${avatarImg}
                                <span class="font-bold font-mono truncate max-w-[120px]" title="${currentUser.name}">${currentUser.name || 'Mestre'}</span>
                                <i class="fa-solid fa-chevron-down text-[10px] text-zinc-500"></i>
                            </button>
                            <div id="user-dropdown" class="absolute right-0 mt-2 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl hidden flex-col overflow-hidden z-50">
                                <button id="logout-btn" class="flex items-center gap-2 px-4 py-3 text-xs font-bold bg-amber-600 text-black hover:bg-amber-500 uppercase transition-colors cursor-pointer w-full text-left">
                                    <i class="fa-solid fa-right-from-bracket"></i> Sair
                                </button>
                            </div>
                        </div>
                    `;
                    document.getElementById('user-menu-btn')?.addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.getElementById('user-dropdown')?.classList.toggle('hidden');
                    });
                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('#user-menu-btn')) {
                            document.getElementById('user-dropdown')?.classList.add('hidden');
                        }
                    });
                    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
                }
            } else {
                if (banner) banner.classList.remove('hidden');
                if (userHeaderArea) {
                    userHeaderArea.innerHTML = `
                        <button id="nav-login-btn" class="w-full md:w-auto bg-black text-[#EBE3CB] hover:bg-zinc-800 hover:text-white transition-all px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md">
                            <i class="fa-solid fa-user-gear text-sm text-amber-400"></i> Minha Conta
                        </button>
                    `;
                    document.getElementById('nav-login-btn')?.addEventListener('click', openAuthModal);
                }
            }
        }

        function openAuthModal() {
            if (authModal) {
                authModal.classList.remove('hidden');
                var authErrorMsg = document.getElementById('auth-error-msg');
                var authSuccessMsg = document.getElementById('auth-success-msg');
                if (authErrorMsg) authErrorMsg.classList.add('hidden');
                if (authSuccessMsg) authSuccessMsg.classList.add('hidden');
            }
        }

        function closeAuthModal() {
            if (authModal) authModal.classList.add('hidden');
        }

        function handleLogout() {
            var oldName = currentUser?.name || 'Mestre';
            currentUser = null;
            localStorage.removeItem('st_user');
            localStorage.removeItem('st_table_profiles');
            localStorage.removeItem('st_active_profile');

            customAmbients = JSON.parse(localStorage.getItem(`st_custom_ambients_guest`)) || [];

            tableProfiles = [
                {
                    id: 'default_mesa',
                    name: 'Mesa 1: Aventura Principal',
                    favorites: [],
                    favoriteAmbients: [],
                    quick_slots: {},
                    scenes: JSON.parse(JSON.stringify(defaultPresetScenes))
                }
            ];
            activeProfileId = 'default_mesa';
            favoriteSounds = [];
            favoriteAmbients = [];
            quickSlots = {};
            tableScenes = JSON.parse(JSON.stringify(defaultPresetScenes));
            activeSceneId = null;

            updateAuthUI();
            renderTableProfilesUI();
            renderQuickSlots();
            renderFavorites();
            renderSFXCatalog();
            renderAmbients();
            renderScenesUI();

            showToast(`Até logo, <strong>${oldName}</strong>! Desconectado com sucesso.`, 'info');
        }

        if (bannerLoginBtn) bannerLoginBtn.addEventListener('click', openAuthModal);
        if (navLoginBtn) navLoginBtn.addEventListener('click', openAuthModal);
        if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuthModal);

        // ABAS DE LOGIN / CADASTRO
        var authMode = 'login';
        var tabLogin = document.getElementById('tab-login');
        var tabRegister = document.getElementById('tab-register');
        var nameFieldGroup = document.getElementById('name-field-group');
        var authSubmitBtn = document.getElementById('auth-submit-btn');
        var authSubmitText = document.getElementById('auth-submit-text');
        var authForm = document.getElementById('auth-form');
        var authErrorMsg = document.getElementById('auth-error-msg');
        var authSuccessMsg = document.getElementById('auth-success-msg');

        if (tabLogin && tabRegister) {
            tabLogin.addEventListener('click', () => {
                authMode = 'login';
                tabLogin.className = 'flex-1 py-2 font-bold text-xs uppercase tracking-wider text-amber-500 border-b-2 border-amber-500 cursor-pointer transition-all';
                tabRegister.className = 'flex-1 py-2 font-bold text-xs uppercase tracking-wider text-zinc-400 border-b-2 border-transparent hover:text-zinc-200 cursor-pointer transition-all';
                nameFieldGroup?.classList.add('hidden');
                if (authSubmitText) authSubmitText.textContent = 'Entrar';
                if (authErrorMsg) authErrorMsg.classList.add('hidden');
                if (authSuccessMsg) authSuccessMsg.classList.add('hidden');
            });
            tabRegister.addEventListener('click', () => {
                authMode = 'register';
                tabRegister.className = 'flex-1 py-2 font-bold text-xs uppercase tracking-wider text-amber-500 border-b-2 border-amber-500 cursor-pointer transition-all';
                tabLogin.className = 'flex-1 py-2 font-bold text-xs uppercase tracking-wider text-zinc-400 border-b-2 border-transparent hover:text-zinc-200 cursor-pointer transition-all';
                nameFieldGroup?.classList.remove('hidden');
                if (authSubmitText) authSubmitText.textContent = 'Criar Conta de Mestre';
                if (authErrorMsg) authErrorMsg.classList.add('hidden');
                if (authSuccessMsg) authSuccessMsg.classList.add('hidden');
            });
        }

        // SUBMISSÃO DO FORMULÁRIO DE LOGIN / CADASTRO (E-MAIL E SENHA)
        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                var emailInput = document.getElementById('auth-email');
                var passwordInput = document.getElementById('auth-password');
                var nameInput = document.getElementById('auth-name');

                var email = emailInput?.value.trim() || '';
                var password = passwordInput?.value || '';
                var name = nameInput?.value.trim() || '';

                if (authErrorMsg) authErrorMsg.classList.add('hidden');
                if (authSuccessMsg) authSuccessMsg.classList.add('hidden');

                if (!email || !password) {
                    if (authErrorMsg) {
                        authErrorMsg.textContent = 'Preencha todos os campos obrigatórios.';
                        authErrorMsg.classList.remove('hidden');
                    }
                    return;
                }

                var originalBtnHtml = authSubmitBtn ? authSubmitBtn.innerHTML : 'Entrar';
                if (authSubmitBtn) {
                    authSubmitBtn.disabled = true;
                    authSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';
                }

                try {
                    var endpointAction = authMode === 'login' ? 'email_login' : 'email_register';

                    var apiResult = null;
                    var apiSucceeded = false;

                    try {
                        var resp = await fetch(`/api/gm-profiles?action=${endpointAction}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password, name })
                        });
                        var data = await resp.json();
                        if (resp.ok && data.success) {
                            apiResult = data;
                            apiSucceeded = true;
                        } else if (data.error && !data.fallback) {
                            if (authErrorMsg) {
                                authErrorMsg.textContent = data.error;
                                authErrorMsg.classList.remove('hidden');
                            }
                            if (authSubmitBtn) {
                                authSubmitBtn.disabled = false;
                                authSubmitBtn.innerHTML = originalBtnHtml;
                            }
                            return;
                        }
                    } catch (netErr) {
                        console.log('Modo local ativo:', netErr);
                    }

                    var localUsers = getRegisteredUsers();
                    var existingUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

                    if (authMode === 'register') {
                        if (existingUser && !apiSucceeded) {
                            if (authErrorMsg) {
                                authErrorMsg.textContent = 'Este e-mail já está cadastrado. Alterne para a aba "Entrar"!';
                                authErrorMsg.classList.remove('hidden');
                            }
                            if (authSubmitBtn) {
                                authSubmitBtn.disabled = false;
                                authSubmitBtn.innerHTML = originalBtnHtml;
                            }
                            return;
                        }

                        var newUser = apiResult?.user || {
                            id: `usr_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                            email: email.toLowerCase(),
                            name: name || 'Mestre de RPG',
                            avatarUrl: ''
                        };

                        saveRegisteredUser(newUser, password);
                        applyUserData(newUser, apiResult?.profiles);
                        showToast(`✨ Conta de Mestre criada com sucesso! Bem-vindo, <strong>${newUser.name}</strong>!`, 'success');

                    } else {
                        // authMode === 'login'
                        if (apiSucceeded && apiResult.user) {
                            saveRegisteredUser(apiResult.user, password);
                            applyUserData(apiResult.user, apiResult.profiles);
                            showToast(`⚔️ Bem-vindo de volta, <strong>${apiResult.user.name}</strong>!`, 'success');
                        } else if (existingUser) {
                            if (existingUser.password && existingUser.password !== password) {
                                if (authErrorMsg) {
                                    authErrorMsg.textContent = 'Senha incorreta. Verifique e tente novamente.';
                                    authErrorMsg.classList.remove('hidden');
                                }
                                if (authSubmitBtn) {
                                    authSubmitBtn.disabled = false;
                                    authSubmitBtn.innerHTML = originalBtnHtml;
                                }
                                return;
                            }

                            applyUserData(existingUser);
                            showToast(`⚔️ Bem-vindo de volta, <strong>${existingUser.name}</strong>!`, 'success');
                        } else {
                            if (authErrorMsg) {
                                authErrorMsg.textContent = 'Usuário não encontrado. Crie sua conta na aba "Criar Conta"!';
                                authErrorMsg.classList.remove('hidden');
                            }
                            if (authSubmitBtn) {
                                authSubmitBtn.disabled = false;
                                authSubmitBtn.innerHTML = originalBtnHtml;
                            }
                            return;
                        }
                    }

                    if (passwordInput) passwordInput.value = '';

                } catch (err) {
                    console.error('Erro na autenticação:', err);
                    if (authErrorMsg) {
                        authErrorMsg.textContent = 'Ocorreu um erro ao processar. Tente novamente.';
                        authErrorMsg.classList.remove('hidden');
                    }
                } finally {
                    if (authSubmitBtn) {
                        authSubmitBtn.disabled = false;
                        authSubmitBtn.innerHTML = originalBtnHtml;
                    }
                }
            });
        }

        // ==========================================
        // FLUXO DE LOGIN COM GOOGLE
        // ==========================================

        window.handleGoogleLoginResponse = async function(response) {
            try {
                var googleUser = null;
                if (response && response.credential) {
                    var token = response.credential;
                    var payload = JSON.parse(atob(token.split('.')[1]));
                    googleUser = {
                        id: payload.sub,
                        email: payload.email,
                        name: payload.name || 'Mestre de RPG',
                        avatarUrl: payload.picture || '',
                        isGoogle: true
                    };
                }

                if (!googleUser) return;

                saveRegisteredUser(googleUser);

                var serverData = null;
                try {
                    var resp = await fetch('/api/gm-profiles?action=google_login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            googleId: googleUser.id,
                            email: googleUser.email,
                            name: googleUser.name,
                            avatarUrl: googleUser.avatarUrl
                        })
                    });
                    if (resp.ok) {
                        serverData = await resp.json();
                    }
                } catch(err) {
                    console.log('Google API sync warning:', err);
                }

                var finalUser = serverData?.user || googleUser;
                var finalProfiles = serverData?.profiles || null;
                applyUserData(finalUser, finalProfiles);
                showToast(`✨ Conectado com o Google como <strong>${finalUser.name}</strong>!`, 'success');

            } catch (err) {
                console.error('Google login error:', err);
                showToast('Erro ao autenticar com o Google.', 'error');
            }
        };



        // ==========================================
        // CONTROLES DE ÁUDIO REAL (.MP3)
        // ==========================================

        var ITEMS_PER_PAGE = 12;
        var currentPage = 1;
        var masterVolumeValue = 0.8;
        var isMasterMuted = false;

        function playSFX(sfxId) {
            var sfx = sfxData.find(s => s.id === sfxId);
            if (!sfx) return;

            var audio = new Audio(sfx.file);
            audio.volume = isMasterMuted ? 0 : masterVolumeValue;
            audio.play().catch(err => console.log('Autoplay audio err:', err));
        }

        function renderQuickSlots() {
            var container = document.getElementById('quick-slots-container');
            if (!container) return;
            container.innerHTML = '';

            for (var i = 1; i <= 9; i++) {
                var sfxId = quickSlots[i];
                var sfx = sfxData.find(s => s.id === sfxId);

                var slot = document.createElement('div');
                slot.className = 'quick-slot bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-amber-500 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative min-h-[80px] select-none group';
                slot.setAttribute('data-slot', i);

                if (sfx) {
                    slot.innerHTML = `
                        <button class="clear-single-slot absolute top-1 left-1 text-zinc-500 hover:text-red-400 p-1 text-[10px] cursor-pointer" title="Remover atalho">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <span class="absolute top-1 right-1.5 bg-amber-500 text-black text-[9px] font-mono font-bold px-1 rounded">T${i}</span>
                        <i class="fa-solid ${sfx.icon} text-amber-500 text-base mb-1 group-hover:scale-110 transition-transform"></i>
                        <span class="font-bold text-[11px] text-white leading-tight line-clamp-1">${sfx.name}</span>
                        <span class="text-[8px] text-zinc-500 uppercase mt-0.5">${sfx.categories[0]}</span>
                    `;
                } else {
                    slot.innerHTML = `
                        <span class="absolute top-1 right-1.5 bg-zinc-800 text-zinc-400 text-[9px] font-mono font-bold px-1 rounded">T${i}</span>
                        <i class="fa-solid fa-plus text-zinc-600 text-base mb-1"></i>
                        <span class="text-[11px] text-zinc-500">Vazio</span>
                    `;
                }

                slot.addEventListener('click', (e) => {
                    if (e.target.closest('.clear-single-slot')) {
                        e.stopPropagation();
                        delete quickSlots[i];
                        syncActiveProfileChanges();
                        renderQuickSlots();
                    } else if (sfxId) {
                        playSFX(sfxId);
                        slot.classList.add('sfx-active');
                        setTimeout(() => slot.classList.remove('sfx-active'), 200);
                    }
                });

                slot.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    slot.classList.add('drop-target-active');
                });

                slot.addEventListener('dragleave', () => {
                    slot.classList.remove('drop-target-active');
                });

                slot.addEventListener('drop', (e) => {
                    e.preventDefault();
                    slot.classList.remove('drop-target-active');
                    var droppedSfxId = e.dataTransfer.getData('text/plain');
                    if (droppedSfxId) {
                        quickSlots[i] = droppedSfxId;
                        syncActiveProfileChanges();
                        renderQuickSlots();
                    }
                });

                container.appendChild(slot);
            }
        }

        function renderFavorites() {
            var box = document.getElementById('favorites-box');
            var emptyMsg = document.getElementById('fav-empty-msg');
            if (!box) return;

            box.querySelectorAll('.fav-item').forEach(el => el.remove());

            if (favoriteSounds.length === 0) {
                if (emptyMsg) emptyMsg.classList.remove('hidden');
                return;
            } else {
                if (emptyMsg) emptyMsg.classList.add('hidden');
            }

            favoriteSounds.forEach(id => {
                var sfx = sfxData.find(s => s.id === id);
                if (!sfx) return;

                var item = document.createElement('div');
                item.className = 'fav-item bg-zinc-900 border border-zinc-800 hover:border-amber-500/70 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative min-h-[80px] select-none group';
                item.innerHTML = `
                    <button class="remove-fav absolute top-1 right-1 text-zinc-500 hover:text-red-400 p-1 text-[10px] cursor-pointer" title="Remover dos Favoritos">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <i class="fa-solid ${sfx.icon} text-amber-400 text-lg mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="font-bold text-[11px] text-white leading-tight line-clamp-1">${sfx.name}</span>
                    <span class="text-[8px] text-zinc-500 uppercase mt-0.5">${sfx.categories[0]}</span>
                `;

                item.addEventListener('click', (e) => {
                    if (e.target.closest('.remove-fav')) {
                        e.stopPropagation();
                        favoriteSounds = favoriteSounds.filter(favId => favId !== sfx.id);
                        syncActiveProfileChanges();
                        renderFavorites();
                        renderSFXCatalog();
                    } else {
                        playSFX(sfx.id);
                        item.classList.add('sfx-active');
                        setTimeout(() => item.classList.remove('sfx-active'), 200);
                    }
                });

                box.appendChild(item);
            });

            box.addEventListener('dragover', (e) => e.preventDefault());
            box.addEventListener('drop', (e) => {
                e.preventDefault();
                var droppedSfxId = e.dataTransfer.getData('text/plain');
                if (droppedSfxId && !favoriteSounds.includes(droppedSfxId)) {
                    favoriteSounds.push(droppedSfxId);
                    syncActiveProfileChanges();
                    renderFavorites();
                    renderSFXCatalog();
                }
            });
        }

        var currentCat = 'all';
        var currentSearch = '';

        function getFilteredSFX() {
            return sfxData.filter(sfx => {
                var matchCat = (currentCat === 'all' || sfx.categories.includes(currentCat));
                var matchSearch = (currentSearch === '' || sfx.name.toLowerCase().includes(currentSearch));
                return matchCat && matchSearch;
            });
        }

        function renderSFXCatalog() {
            var grid = document.getElementById('sfx-catalog-grid');
            var countLabel = document.getElementById('sfx-count-label');
            if (!grid) return;
            grid.innerHTML = '';

            var filtered = getFilteredSFX();
            var totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
            if (currentPage > totalPages) currentPage = totalPages;

            if (countLabel) countLabel.textContent = `${filtered.length} ${filtered.length === 1 ? 'efeito encontrado' : 'efeitos encontrados'}`;

            var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            var pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            if (pageItems.length === 0) {
                grid.innerHTML = `<div class="col-span-full py-8 text-center text-zinc-500 italic text-xs sm:text-sm">Nenhum efeito sonoro encontrado nesta categoria.</div>`;
            } else {
                pageItems.forEach(sfx => {
                    var isFav = favoriteSounds.includes(sfx.id);
                    var card = document.createElement('div');
                    card.className = 'sfx-card bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-3 sm:p-4 flex flex-col items-center text-center transition-all cursor-pointer group relative select-none';
                    card.setAttribute('draggable', 'true');
                    card.setAttribute('data-id', sfx.id);

                    card.innerHTML = `
                        <button class="hotkey-btn absolute top-2 left-2 text-zinc-600 hover:text-amber-400 p-1 text-xs cursor-pointer" title="Adicionar ao Atalho">
                            <i class="fa-solid fa-keyboard"></i>
                        </button>
                        <button class="fav-star absolute top-2 right-2 text-zinc-600 hover:text-amber-400 p-1 text-xs cursor-pointer ${isFav ? 'text-amber-400' : ''}" title="Favoritar">
                            <i class="fa-${isFav ? 'solid' : 'regular'} fa-star"></i>
                        </button>
                        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-zinc-800 text-amber-500 border border-zinc-700 flex items-center justify-center text-lg sm:text-xl mb-1.5 group-hover:scale-110 transition-transform">
                            <i class="fa-solid ${sfx.icon}"></i>
                        </div>
                        <span class="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">${sfx.name}</span>
                        <span class="text-[9px] sm:text-[10px] text-zinc-400 uppercase mt-0.5">${sfx.categories.join(' • ')}</span>
                    `;

                    card.addEventListener('click', (e) => {
                        if (e.target.closest('.fav-star')) return;
                        if (e.target.closest('.hotkey-btn')) return;
                        playSFX(sfx.id);
                        card.classList.add('sfx-active');
                        setTimeout(() => card.classList.remove('sfx-active'), 200);
                    });

                    var starBtn = card.querySelector('.fav-star');
                    starBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (favoriteSounds.includes(sfx.id)) {
                            favoriteSounds = favoriteSounds.filter(id => id !== sfx.id);
                        } else {
                            favoriteSounds.push(sfx.id);
                        }
                        syncActiveProfileChanges();
                        renderFavorites();
                        renderSFXCatalog();
                    });

                    var hotkeyBtn = card.querySelector('.hotkey-btn');
                    hotkeyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        var slotNum = prompt(`Digite o número do atalho para "${sfx.name}" (1 a 9):`);
                        if (slotNum !== null) {
                            var parsedNum = parseInt(slotNum);
                            if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 9) {
                                quickSlots[parsedNum] = sfx.id;
                                syncActiveProfileChanges();
                                renderQuickSlots();
                                showToast(`Som "${sfx.name}" adicionado ao atalho T${parsedNum}!`, 'success');
                            } else {
                                showToast('Número de atalho inválido. Use de 1 a 9.', 'error');
                            }
                        }
                    });

                    card.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', sfx.id);
                    });

                    grid.appendChild(card);
                });
            }

            renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
            var prevBtn = document.getElementById('prev-page-btn');
            var nextBtn = document.getElementById('next-page-btn');
            var numbersContainer = document.getElementById('page-numbers-container');

            if (prevBtn) prevBtn.disabled = (currentPage === 1);
            if (nextBtn) nextBtn.disabled = (currentPage === totalPages);

            if (numbersContainer) {
                numbersContainer.innerHTML = '';
                for (var i = 1; i <= totalPages; i++) {
                    var numBtn = document.createElement('button');
                    numBtn.className = `w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${i === currentPage ? 'bg-amber-600 text-black shadow-md' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`;
                    numBtn.textContent = i;
                    numBtn.addEventListener('click', () => {
                        currentPage = i;
                        renderSFXCatalog();
                        document.getElementById('sfx-catalog-grid').scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                    numbersContainer.appendChild(numBtn);
                }
            }
        }

        var prevPageBtn = document.getElementById('prev-page-btn');
        var nextPageBtn = document.getElementById('next-page-btn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderSFXCatalog();
                }
            });
        }
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                var filtered = getFilteredSFX();
                var totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderSFXCatalog();
                }
            });
        }

        // ==========================================
        // MOTOR MULTICANAL DE MÚSICAS AMBIENTES (SIMULTÂNEAS)
        // ==========================================

        var activeTracks = {};
        var isYTApiReady = false;

        function onYouTubeIframeAPIReady() {
            isYTApiReady = true;
        }

        function renderActiveTracksHeaderPanel() {
            var container = document.getElementById('active-tracks-container');
            var noMsg = document.getElementById('no-active-tracks-msg');
            var countLabel = document.getElementById('active-tracks-count');
            var saveSceneBadge = document.getElementById('save-scene-badge');
            if (!container) return;

            container.querySelectorAll('.active-track-bar').forEach(el => el.remove());
            var keys = Object.keys(activeTracks);

            if (countLabel) countLabel.textContent = `${keys.length} ${keys.length === 1 ? 'faixa tocando' : 'faixas tocando'}`;
            if (saveSceneBadge) saveSceneBadge.textContent = `${keys.length} ${keys.length === 1 ? 'som' : 'sons'}`;

            if (keys.length === 0) {
                if (noMsg) noMsg.classList.remove('hidden');
                return;
            } else {
                if (noMsg) noMsg.classList.add('hidden');
            }

            keys.forEach(ambId => {
                var track = activeTracks[ambId];
                var amb = track.ambObj;

                var bar = document.createElement('div');
                bar.className = 'active-track-bar bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex flex-row items-center justify-between gap-2 text-xs';
                
                bar.innerHTML = `
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                            <i class="fa-solid ${amb.icon}"></i>
                        </div>
                        <div class="min-w-0">
                            <span class="font-bold text-white block leading-tight truncate">${amb.name}</span>
                            <span class="text-[9px] text-zinc-400 uppercase hidden sm:block">${amb.desc || 'Música Ambiente'}</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2.5 shrink-0">
                        <div class="flex items-center gap-1.5">
                            <input type="range" class="active-track-vol w-16 sm:w-24 accent-amber-500 cursor-pointer" min="0" max="100" value="${track.vol}">
                            <span class="text-[10px] text-amber-400 font-bold w-6 text-right hidden sm:inline">${track.vol}%</span>
                        </div>

                        <div class="flex items-center gap-1">
                            <button class="active-track-toggle w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${track.isPaused ? 'bg-zinc-800 text-zinc-300' : 'bg-amber-600 text-black'} font-bold flex items-center justify-center transition-all cursor-pointer">
                                <i class="fa-solid ${track.isPaused ? 'fa-play' : 'fa-pause'} text-xs"></i>
                            </button>
                            <button class="active-track-stop w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-800/80 hover:text-white border border-red-800/40 font-bold flex items-center justify-center transition-all cursor-pointer" title="Fechar Faixa">
                                <i class="fa-solid fa-xmark text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;

                var volInput = bar.querySelector('.active-track-vol');
                volInput.addEventListener('input', (e) => {
                    var val = parseInt(e.target.value);
                    track.vol = val;
                    var valLabel = bar.querySelector('span.w-6');
                    if (valLabel) valLabel.textContent = `${val}%`;
                    updateTrackVolume(ambId);

                    var card = document.querySelector(`.ambient-card[data-ambient="${ambId}"]`);
                    if (card) {
                        var cardSlider = card.querySelector('.ambient-vol');
                        if (cardSlider) cardSlider.value = val;
                        var cardValLabel = card.querySelector('.ambient-vol-val');
                        if (cardValLabel) cardValLabel.textContent = `${val}%`;
                    }
                });

                var toggleBtn = bar.querySelector('.active-track-toggle');
                toggleBtn.addEventListener('click', () => {
                    togglePlayPauseTrack(ambId);
                });

                var stopBtn = bar.querySelector('.active-track-stop');
                stopBtn.addEventListener('click', () => {
                    stopAmbientTrack(ambId);
                });

                container.appendChild(bar);
            });

            var globalPauseBtn = document.getElementById('pause-all-btn');
            if (globalPauseBtn) {
                if (keys.length > 0) {
                    var allPaused = keys.every(k => activeTracks[k].isPaused);
                    if (allPaused) {
                        globalPauseBtn.innerHTML = '<i class="fa-solid fa-play text-xs"></i> Tocar Todos';
                    } else {
                        globalPauseBtn.innerHTML = '<i class="fa-solid fa-pause text-xs"></i> Pausar Todos';
                    }
                } else {
                    globalPauseBtn.innerHTML = '<i class="fa-solid fa-pause text-xs"></i> Pausar Todos';
                }
            }
        }

        function renderAmbients() {
            var grid = document.getElementById('ambient-grid');
            var customGrid = document.getElementById('custom-ambient-grid');
            if (!grid) return;
            grid.innerHTML = '';
            if (customGrid) customGrid.innerHTML = '';

            // ORDENAR PARA QUE AS MÚSICAS AMBIENTES FAVORITADAS FIQUEM NO TOPO DO GRID
            var sortedData = [...getAmbientData()].sort((a, b) => {
                var aFav = favoriteAmbients.includes(a.id);
                var bFav = favoriteAmbients.includes(b.id);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                return 0;
            });

            sortedData.forEach(amb => {
                var isPlaying = !!activeTracks[amb.id];
                var isPaused = isPlaying && activeTracks[amb.id].isPaused;
                var volVal = isPlaying ? activeTracks[amb.id].vol : 70;
                var isFavAmbient = favoriteAmbients.includes(amb.id);

                var card = document.createElement('div');
                card.className = `ambient-card bg-zinc-900/60 border ${isFavAmbient ? 'border-amber-500/70 bg-amber-950/20 shadow-lg' : 'border-zinc-800'} rounded-xl p-4 sm:p-5 transition-all hover:border-amber-600/60 relative overflow-hidden ${isPlaying && !isPaused ? 'ambient-card-active' : ''}`;
                card.setAttribute('data-ambient', amb.id);
                card.setAttribute('data-category', amb.category);

                card.innerHTML = `
                    ${amb.isCustom ? `
                    <div class="absolute top-3 right-10 flex items-center gap-1 bg-zinc-900/80 rounded px-1 z-10">
                        <button class="text-zinc-500 hover:text-blue-400 p-1 text-sm cursor-pointer transition-colors" onclick="editCustomAmbient('${amb.id}')" title="Editar som personalizado">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="text-zinc-500 hover:text-red-500 p-1 text-sm cursor-pointer transition-colors" onclick="deleteCustomAmbient('${amb.id}')" title="Remover som personalizado">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>` : ''}
                    <button class="fav-ambient-star absolute top-3 right-3 text-zinc-600 hover:text-amber-400 p-1 text-sm cursor-pointer ${isFavAmbient ? 'text-amber-400' : ''}" title="${isFavAmbient ? 'Desfavoritar' : 'Favoritar (Fixar no topo)'}">
                        <i class="fa-${isFavAmbient ? 'solid' : 'regular'} fa-star"></i>
                    </button>

                    <div class="flex items-center justify-between mb-3.5 pr-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 text-lg shrink-0">
                                <i class="fa-solid ${amb.icon}"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-white text-sm sm:text-base leading-tight flex items-center gap-1.5">
                                    ${amb.name}
                                    ${isFavAmbient ? '<span class="bg-amber-500/20 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40 uppercase">Favorito</span>' : ''}
                                </h3>
                                <span class="text-[11px] text-zinc-400 uppercase tracking-wider">${amb.desc || 'Música Ambiente'}</span>
                            </div>
                        </div>
                        <div class="equalizer ${isPlaying && !isPaused ? '' : 'hidden'} flex items-end gap-1 h-4" id="eq-${amb.id}">
                            <span class="equalizer-bar w-1 bg-amber-500 rounded-full"></span>
                            <span class="equalizer-bar w-1 bg-amber-500 rounded-full"></span>
                            <span class="equalizer-bar w-1 bg-amber-500 rounded-full"></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3.5">
                        <button class="ambient-play-btn w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${isPlaying && !isPaused ? 'bg-amber-500' : 'bg-amber-600'} hover:bg-amber-500 text-black font-bold flex items-center justify-center text-lg sm:text-xl transition-all cursor-pointer shadow-lg shrink-0" title="Tocar / Pausar">
                            <i class="fa-solid ${isPlaying && !isPaused ? 'fa-pause' : 'fa-play ml-0.5'}"></i>
                        </button>
                        <div class="flex-grow">
                            <div class="flex justify-between text-xs text-zinc-400 mb-1 font-semibold">
                                <span>Volume</span>
                                <span class="ambient-vol-val">${volVal}%</span>
                            </div>
                            <input type="range" class="ambient-vol w-full accent-amber-500 cursor-pointer" min="0" max="100" value="${volVal}">
                        </div>
                    </div>
                `;

                var starBtn = card.querySelector('.fav-ambient-star');
                starBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!currentUser) {
                        openAuthModal();
                        if (authErrorMsg) {
                            authErrorMsg.textContent = '🔑 Faça login ou crie uma conta para favoritar músicas ambientes e fixá-las no topo!';
                            authErrorMsg.classList.remove('hidden');
                        }
                        return;
                    }

                    if (favoriteAmbients.includes(amb.id)) {
                        favoriteAmbients = favoriteAmbients.filter(id => id !== amb.id);
                    } else {
                        favoriteAmbients.push(amb.id);
                    }
                    syncActiveProfileChanges();
                    renderAmbients();
                });

                var playBtn = card.querySelector('.ambient-play-btn');
                var volSlider = card.querySelector('.ambient-vol');

                playBtn.addEventListener('click', () => {
                    if (activeTracks[amb.id]) {
                        togglePlayPauseTrack(amb.id);
                    } else {
                        startAmbientTrack(amb, volSlider.value);
                    }
                });

                volSlider.addEventListener('input', (e) => {
                    var val = parseInt(e.target.value);
                    card.querySelector('.ambient-vol-val').textContent = `${val}%`;
                    if (activeTracks[amb.id]) {
                        activeTracks[amb.id].vol = val;
                        updateTrackVolume(amb.id);
                        renderActiveTracksHeaderPanel();
                        debouncedSyncActiveProfileChanges();
                    }
                });

                if (amb.isCustom && customGrid) {
                    customGrid.appendChild(card);
                } else {
                    grid.appendChild(card);
                }
            });
        }

        function startAmbientTrack(amb, initialVol) {
            var playersDiv = document.getElementById('youtube-players-container');
            var playerId = `yt-player-${amb.id}`;

            var playerElem = document.getElementById(playerId);
            if (!playerElem) {
                playerElem = document.createElement('div');
                playerElem.id = playerId;
                playersDiv.appendChild(playerElem);
            }

            var playerVars = {
                'autoplay': 1,
                'controls': 0,
                'loop': 1,
                'playlist': amb.ytId
            };
            if (amb.start) {
                playerVars.start = amb.start;
            }

            var newPlayer = new YT.Player(playerId, {
                height: '0',
                width: '0',
                videoId: amb.ytId,
                playerVars: playerVars,
                events: {
                    'onReady': (event) => {
                        var calcVol = Math.round(initialVol * (masterVolumeValue / 1));
                        event.target.setVolume(isMasterMuted ? 0 : calcVol);
                        if (amb.start) {
                            event.target.seekTo(amb.start, true);
                        }
                        event.target.playVideo();
                    },
                    'onStateChange': (event) => {
                        if (event.data === YT.PlayerState.ENDED && amb.start) {
                            event.target.seekTo(amb.start, true);
                            event.target.playVideo();
                        }
                    }
                }
            });

            activeTracks[amb.id] = {
                player: newPlayer,
                vol: parseInt(initialVol),
                isPaused: false,
                ambObj: amb
            };

            renderAmbients();
            renderActiveTracksHeaderPanel();
            debouncedSyncActiveProfileChanges();
        }

        function togglePlayPauseTrack(ambId) {
            var track = activeTracks[ambId];
            if (!track) return;

            if (track.isPaused) {
                track.isPaused = false;
                if (track.player && track.player.playVideo) {
                    track.player.playVideo();
                }
            } else {
                track.isPaused = true;
                if (track.player && track.player.pauseVideo) {
                    track.player.pauseVideo();
                }
            }
            renderAmbients();
            renderActiveTracksHeaderPanel();
            debouncedSyncActiveProfileChanges();
        }

        function stopAmbientTrack(ambId) {
            var track = activeTracks[ambId];
            if (track) {
                if (track.player && track.player.destroy) {
                    track.player.destroy();
                }
                var elem = document.getElementById(`yt-player-${ambId}`);
                if (elem) elem.remove();
                delete activeTracks[ambId];
            }
            renderAmbients();
            renderActiveTracksHeaderPanel();
            debouncedSyncActiveProfileChanges();
        }

        function updateTrackVolume(ambId) {
            var track = activeTracks[ambId];
            if (track && track.player && track.player.setVolume) {
                var calcVol = Math.round(track.vol * (masterVolumeValue / 1));
                track.player.setVolume(isMasterMuted ? 0 : calcVol);
            }
        }

        // CONTROLES MASTER, PAUSAR TODOS E RESETAR AMBIENTES
        var masterVolInput = document.getElementById('master-volume');
        var masterVolLabel = document.getElementById('master-vol-label');
        var masterMuteBtn = document.getElementById('master-mute-btn');
        var masterMuteIcon = document.getElementById('master-mute-icon');
        var pauseAllBtn = document.getElementById('pause-all-btn');
        var resetAmbientsBtn = document.getElementById('reset-ambients-btn');
        var clearSlotsBtn = document.getElementById('clear-slots-btn');

        if (masterVolInput) {
            masterVolInput.addEventListener('input', (e) => {
                var val = e.target.value / 100;
                masterVolumeValue = val;
                masterVolLabel.textContent = `${e.target.value}%`;
                Object.keys(activeTracks).forEach(ambId => updateTrackVolume(ambId));
                debouncedSyncActiveProfileChanges();
            });
        }

        if (masterMuteBtn) {
            masterMuteBtn.addEventListener('click', () => {
                isMasterMuted = !isMasterMuted;
                if (isMasterMuted) {
                    masterMuteIcon.className = 'fa-solid fa-volume-xmark text-red-500';
                    Object.keys(activeTracks).forEach(ambId => {
                        if (activeTracks[ambId].player && activeTracks[ambId].player.mute) {
                            activeTracks[ambId].player.mute();
                        }
                    });
                } else {
                    masterMuteIcon.className = 'fa-solid fa-volume-high text-amber-500';
                    Object.keys(activeTracks).forEach(ambId => {
                        if (activeTracks[ambId].player && activeTracks[ambId].player.unMute) {
                            activeTracks[ambId].player.unMute();
                            updateTrackVolume(ambId);
                        }
                    });
                }
                debouncedSyncActiveProfileChanges();
            });
        }

        if (pauseAllBtn) {
            pauseAllBtn.addEventListener('click', () => {
                var keys = Object.keys(activeTracks);
                if (keys.length === 0) return;

                var allPaused = keys.every(k => activeTracks[k].isPaused);

                keys.forEach(ambId => {
                    var track = activeTracks[ambId];
                    if (allPaused) {
                        track.isPaused = false;
                        if (track.player && track.player.playVideo) track.player.playVideo();
                    } else {
                        track.isPaused = true;
                        if (track.player && track.player.pauseVideo) track.player.pauseVideo();
                    }
                });

                renderAmbients();
                renderActiveTracksHeaderPanel();
            });
        }

        if (resetAmbientsBtn) {
            resetAmbientsBtn.addEventListener('click', () => {
                if (crossfadeIntervalId) {
                    clearInterval(crossfadeIntervalId);
                    crossfadeIntervalId = null;
                }
                isCrossfading = false;
                crossfadeTargetScene = null;
                activeSceneId = null;

                Object.keys(activeTracks).forEach(ambId => {
                    stopAmbientTrack(ambId);
                });
                renderScenesUI();
            });
        }

        if (clearSlotsBtn) {
            clearSlotsBtn.addEventListener('click', () => {
                if (confirm('Deseja realmente apagar todos os atalhos rápidos do teclado (1 a 9) desta mesa?')) {
                    quickSlots = {};
                    syncActiveProfileChanges();
                    renderQuickSlots();
                }
            });
        }

        // ==========================================
        // MOTOR DE CENAS & CROSSFADE DE 4 SEGUNDOS
        // ==========================================

        function renderScenesUI() {
            renderCentralActiveSceneCard();
            renderScenesCarousel();
        }

        function renderCentralActiveSceneCard() {
            var container = document.getElementById('central-active-scene-card');
            var statusTag = document.getElementById('active-scene-status-tag');
            if (!container) return;

            var activeScene = tableScenes.find(s => s.id === activeSceneId);
            var activeCount = Object.keys(activeTracks).length;

            if (isCrossfading && crossfadeTargetScene) {
                if (statusTag) statusTag.textContent = 'Transicionando (4s)...';
                container.className = 'central-scene-dropzone relative flex-grow bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 border-2 border-amber-500 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-[0_0_35px_rgba(245,158,11,0.3)] min-h-[220px] crossfade-pulsing';
                
                container.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1.5 animate-pulse">
                                <i class="fa-solid fa-arrows-rotate animate-spin"></i> Crossfade em Andamento
                            </span>
                            <span class="text-xs font-mono font-bold text-amber-400" id="crossfade-countdown">4.0s</span>
                        </div>

                        <div class="flex items-center gap-3 my-2">
                            <div class="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center text-xl shrink-0">
                                <i class="fa-solid ${crossfadeTargetScene.icon || 'fa-masks-theater'}"></i>
                            </div>
                            <div>
                                <span class="text-[10px] text-zinc-400 uppercase tracking-wider block">Transicionando para</span>
                                <h3 class="text-base sm:text-lg font-bold text-white leading-tight font-title">${crossfadeTargetScene.name}</h3>
                            </div>
                        </div>

                        <!-- Barra de Progresso do Crossfade -->
                        <div class="w-full bg-zinc-950 border border-zinc-800 rounded-full h-3.5 p-0.5 overflow-hidden my-3 shadow-inner">
                            <div id="crossfade-progress-bar" class="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-75 ease-linear shadow-[0_0_12px_rgba(245,158,11,0.8)]" style="width: 0%;"></div>
                        </div>
                    </div>

                    <div class="text-[11px] text-zinc-400 italic text-center border-t border-zinc-800/80 pt-2 flex items-center justify-center gap-1.5">
                        <i class="fa-solid fa-sliders text-amber-500"></i> Ajustando volumes e alternando faixas suavemente...
                    </div>
                `;
            } else if (activeScene) {
                if (statusTag) statusTag.textContent = 'Cena Ativa';
                container.className = 'central-scene-dropzone relative flex-grow bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-950/30 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-[0_0_25px_rgba(245,158,11,0.2)] min-h-[220px]';

                var soundPills = activeScene.tracks.map(t => {
                    var amb = getAmbientData().find(a => a.id === t.id);
                    var currentVol = activeTracks[t.id] ? activeTracks[t.id].vol : t.vol;
                    var isPlaying = !!activeTracks[t.id] && !activeTracks[t.id].isPaused;
                    return `
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${isPlaying ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'} border text-[11px] font-semibold">
                            <i class="fa-solid ${amb ? amb.icon : 'fa-compact-disc'} text-[10px]"></i>
                            <span>${amb ? amb.name : t.id}</span>
                            <span class="text-[10px] font-mono text-amber-400 font-bold">${currentVol}%</span>
                        </span>
                    `;
                }).join('');

                container.innerHTML = `
                    <div>
                        <div class="flex items-center justify-between mb-2.5">
                            <span class="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                Tocando Agora
                            </span>
                            <div class="flex items-center gap-1">
                                <button id="update-current-scene-btn" class="text-zinc-400 hover:text-amber-400 p-1 text-xs cursor-pointer" title="Sobrescrever preset com volumes atuais">
                                    <i class="fa-solid fa-floppy-disk text-xs"></i>
                                </button>
                                <button id="rename-current-scene-btn" class="text-zinc-400 hover:text-amber-400 p-1 text-xs cursor-pointer" title="Renomear cena">
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center justify-between gap-3 mb-3">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-md">
                                    <i class="fa-solid ${activeScene.icon || 'fa-masks-theater'}"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg sm:text-xl font-bold text-white font-title leading-tight">${activeScene.name}</h3>
                                    <span class="text-[10px] text-zinc-400 uppercase tracking-wider">${activeScene.tracks.length} ${activeScene.tracks.length === 1 ? 'faixa sonora' : 'faixas sonoras'} no preset</span>
                                </div>
                            </div>

                            <div class="flex items-end gap-1 h-5">
                                <span class="equalizer-bar w-1 bg-amber-500 rounded-full"></span>
                                <span class="equalizer-bar w-1 bg-amber-500 rounded-full"></span>
                                <span class="equalizer-bar w-1 bg-amber-500 rounded-full"></span>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-1.5 mb-3 max-h-24 overflow-y-auto no-scrollbar py-0.5">
                            ${soundPills || '<span class="text-zinc-500 text-xs italic">Nenhum som atribuído</span>'}
                        </div>
                    </div>

                    <!-- Drop Target Banner -->
                    <div class="bg-zinc-950/80 border border-dashed border-zinc-700/80 hover:border-amber-500/60 rounded-xl p-2 text-center text-[11px] text-zinc-400 transition-all flex items-center justify-center gap-2">
                        <i class="fa-solid fa-hand-holding-hand text-amber-400 text-xs"></i>
                        <span>Arraste outro card para cá para transicionar em <strong>4s</strong></span>
                    </div>
                `;

                var updateBtn = container.querySelector('#update-current-scene-btn');
                if (updateBtn) {
                    updateBtn.addEventListener('click', () => updateSceneWithCurrent(activeScene.id));
                }
                var renameBtn = container.querySelector('#rename-current-scene-btn');
                if (renameBtn) {
                    renameBtn.addEventListener('click', () => renameScene(activeScene.id));
                }
            } else {
                if (statusTag) statusTag.textContent = activeCount > 0 ? `${activeCount} sons avulsos` : 'Nenhuma';
                container.className = 'central-scene-dropzone relative flex-grow bg-gradient-to-br from-zinc-900/90 to-zinc-950 border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all min-h-[220px]';

                container.innerHTML = `
                    <div class="w-12 h-12 rounded-2xl bg-zinc-800/80 text-amber-500 border border-zinc-700/60 flex items-center justify-center text-2xl mb-2.5 shadow-inner">
                        <i class="fa-solid fa-masks-theater"></i>
                    </div>
                    <h3 class="text-base font-bold text-white font-title mb-1">Palco Central de Cenas</h3>
                    <p class="text-xs text-zinc-400 max-w-xs mb-3">
                        Arraste um card de cena do deck ao lado para cá ou clique em <strong>Tocar (4s)</strong> para iniciar a narrativa sonora com crossfade.
                    </p>
                    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        <i class="fa-solid fa-arrow-down animate-bounce"></i> Solte uma cena aqui
                    </div>
                `;
            }

            // Drag and Drop Handlers para o Palco Central
            container.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                container.classList.add('drag-over');
            };

            container.ondragleave = (e) => {
                if (!container.contains(e.relatedTarget)) {
                    container.classList.remove('drag-over');
                }
            };

            container.ondrop = (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                var droppedSceneId = e.dataTransfer.getData('text/plain');
                if (droppedSceneId) {
                    var scene = tableScenes.find(s => s.id === droppedSceneId);
                    if (scene) {
                        transitionToScene(scene, 4000);
                    }
                }
            };
        }

        function renderScenesCarousel() {
            var track = document.getElementById('scenes-carousel-track');
            var countLabel = document.getElementById('scenes-count-label');
            if (!track) return;

            track.innerHTML = '';
            if (countLabel) countLabel.textContent = tableScenes.length;

            if (tableScenes.length === 0) {
                track.innerHTML = `
                    <div class="w-full text-center py-8 text-zinc-500 text-xs italic flex flex-col items-center justify-center gap-2">
                        <i class="fa-solid fa-folder-open text-xl text-zinc-600"></i>
                        <span>Nenhuma cena criada nesta aventura. Ative sons e clique em <strong>"+ Salvar Cena Atual"</strong>!</span>
                    </div>
                `;
                return;
            }

            tableScenes.forEach(scene => {
                var isActive = scene.id === activeSceneId;
                var card = document.createElement('div');
                card.className = `scene-card min-w-[220px] sm:min-w-[235px] max-w-[245px] bg-zinc-900 border ${isActive ? 'is-active-scene border-amber-500 bg-amber-950/20' : 'border-zinc-800 hover:border-zinc-700'} rounded-xl p-3 sm:p-3.5 flex flex-col justify-between select-none relative group shrink-0 shadow-md cursor-grab active:cursor-grabbing`;
                card.setAttribute('draggable', 'true');
                card.setAttribute('data-scene-id', scene.id);

                var trackPreview = scene.tracks.slice(0, 3).map(t => {
                    var amb = getAmbientData().find(a => a.id === t.id);
                    return `
                        <div class="flex items-center justify-between text-[10px] text-zinc-400 py-0.5">
                            <span class="truncate max-w-[130px] flex items-center gap-1">
                                <i class="fa-solid ${amb ? amb.icon : 'fa-compact-disc'} text-[9px] text-amber-500/80"></i>
                                ${amb ? amb.name : t.id}
                            </span>
                            <span class="font-mono text-zinc-300 font-bold">${t.vol}%</span>
                        </div>
                    `;
                }).join('');

                var extraCount = scene.tracks.length > 3 ? `<span class="text-[9px] text-zinc-500 font-semibold">+${scene.tracks.length - 3} mais</span>` : '';

                card.innerHTML = `
                    <div>
                        <!-- Header do Card -->
                        <div class="flex items-start justify-between gap-1.5 mb-2">
                            <div class="flex items-center gap-2 min-w-0">
                                <div class="w-8 h-8 rounded-lg ${isActive ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-amber-400 border border-zinc-700'} flex items-center justify-center text-sm shrink-0 transition-all">
                                    <i class="fa-solid ${scene.icon || 'fa-masks-theater'}"></i>
                                </div>
                                <div class="min-w-0">
                                    <h4 class="font-bold text-white text-xs sm:text-sm truncate leading-tight font-title group-hover:text-amber-400 transition-colors">${scene.name}</h4>
                                    <span class="text-[9px] text-zinc-500 uppercase tracking-wider">${scene.tracks.length} ${scene.tracks.length === 1 ? 'faixa' : 'faixas'}</span>
                                </div>
                            </div>

                            <div class="flex items-center gap-1 shrink-0">
                                <button class="scene-rename-btn text-zinc-500 hover:text-amber-400 p-1 text-[11px] cursor-pointer" title="Renomear">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="scene-delete-btn text-zinc-500 hover:text-red-400 p-1 text-[11px] cursor-pointer" title="Excluir">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Lista de Sons da Cena -->
                        <div class="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2 mb-2.5 flex flex-col gap-0.5">
                            ${trackPreview || '<div class="text-[10px] text-zinc-500 italic">Sem faixas</div>'}
                            ${extraCount}
                        </div>
                    </div>

                    <!-- Botão de Ação: Tocar com Fade 4s -->
                    <div class="flex items-center gap-1.5 pt-1.5 border-t border-zinc-800/80">
                        <button class="scene-play-btn flex-grow bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-black border border-amber-500/40 font-bold uppercase text-[10px] tracking-wider py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                            <i class="fa-solid ${isActive ? 'fa-rotate' : 'fa-play'} text-[9px]"></i>
                            <span>${isActive ? 'Reiniciar (4s)' : 'Tocar (4s)'}</span>
                        </button>
                        <button class="scene-update-btn bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 border border-zinc-700 font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all cursor-pointer" title="Sobrescrever preset com sons tocando agora">
                            <i class="fa-solid fa-floppy-disk"></i>
                        </button>
                    </div>
                `;

                // Ativar cena ao clicar no card
                card.addEventListener('click', (e) => {
                    if (e.target.closest('button')) return;
                    transitionToScene(scene, 4000);
                });

                // Drag & Drop
                card.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', scene.id);
                    e.dataTransfer.effectAllowed = 'copyMove';
                    card.classList.add('opacity-40');
                });

                card.addEventListener('dragend', () => {
                    card.classList.remove('opacity-40');
                });

                card.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });

                card.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    card.classList.add('border-amber-500', 'scale-[1.02]');
                });

                card.addEventListener('dragleave', (e) => {
                    card.classList.remove('border-amber-500', 'scale-[1.02]');
                });

                card.addEventListener('drop', (e) => {
                    e.preventDefault();
                    card.classList.remove('border-amber-500', 'scale-[1.02]');
                    var draggedSceneId = e.dataTransfer.getData('text/plain');
                    
                    var draggedIndex = tableScenes.findIndex(s => s.id === draggedSceneId);
                    var targetIndex = tableScenes.findIndex(s => s.id === scene.id);
                    
                    if (draggedIndex > -1 && targetIndex > -1 && draggedIndex !== targetIndex) {
                        var [draggedScene] = tableScenes.splice(draggedIndex, 1);
                        tableScenes.splice(targetIndex, 0, draggedScene);
                        syncActiveProfileChanges();
                        renderScenesUI();
                    }
                });

                // Botões de Ação
                var playBtn = card.querySelector('.scene-play-btn');
                playBtn.addEventListener('click', () => {
                    transitionToScene(scene, 4000);
                });

                var updateBtn = card.querySelector('.scene-update-btn');
                updateBtn.addEventListener('click', () => {
                    updateSceneWithCurrent(scene.id);
                });

                var renameBtn = card.querySelector('.scene-rename-btn');
                renameBtn.addEventListener('click', () => {
                    renameScene(scene.id);
                });

                var deleteBtn = card.querySelector('.scene-delete-btn');
                deleteBtn.addEventListener('click', () => {
                    deleteScene(scene.id);
                });

                track.appendChild(card);
            });
        }

        // MOTOR CROSSFADE DE 4 SEGUNDOS (4000ms)
        function transitionToScene(targetScene, durationMs = 4000) {
            if (!targetScene || !targetScene.tracks) return;

            if (crossfadeIntervalId) {
                clearInterval(crossfadeIntervalId);
                crossfadeIntervalId = null;
            }

            isCrossfading = true;
            crossfadeTargetScene = targetScene;
            var startTime = Date.now();

            // Mapeia volumes alvo
            var targetMap = {};
            targetScene.tracks.forEach(t => {
                targetMap[t.id] = parseInt(t.vol);
            });

            // Conjunto de todos os sons envolvidos
            var allAmbIds = new Set([
                ...Object.keys(activeTracks),
                ...targetScene.tracks.map(t => t.id)
            ]);

            var trackFades = {};

            allAmbIds.forEach(ambId => {
                var currentTrack = activeTracks[ambId];
                var startVol = currentTrack ? currentTrack.vol : 0;
                var endVol = targetMap[ambId] !== undefined ? targetMap[ambId] : 0;

                // Se não está tocando e deve entrar na cena, inicia com volume 0 imediatamente
                if (!currentTrack && endVol > 0) {
                    var ambObj = getAmbientData().find(a => a.id === ambId);
                    if (ambObj) {
                        startAmbientTrack(ambObj, 0);
                    }
                }

                trackFades[ambId] = {
                    startVol: startVol,
                    endVol: endVol
                };
            });

            activeSceneId = targetScene.id;
            renderScenesUI();

            crossfadeIntervalId = setInterval(() => {
                var now = Date.now();
                var elapsed = now - startTime;
                var progress = Math.min(1, elapsed / durationMs);
                var remainingSec = Math.max(0, (durationMs - elapsed) / 1000).toFixed(1);

                // Interpolação suave dos volumes de cada faixa
                Object.keys(trackFades).forEach(ambId => {
                    var fade = trackFades[ambId];
                    var currentVol = Math.round(fade.startVol + (fade.endVol - fade.startVol) * progress);

                    if (activeTracks[ambId]) {
                        activeTracks[ambId].vol = currentVol;
                        updateTrackVolume(ambId);
                    }
                });

                // Atualiza a barra visual de progresso e contagem
                updateCrossfadeProgressUI(progress, remainingSec);
                renderActiveTracksHeaderPanel();

                if (progress >= 1) {
                    clearInterval(crossfadeIntervalId);
                    crossfadeIntervalId = null;
                    isCrossfading = false;
                    crossfadeTargetScene = null;

                    // Finaliza: interrompe faixas cujo volume chegou a 0
                    Object.keys(trackFades).forEach(ambId => {
                        var fade = trackFades[ambId];
                        if (fade.endVol === 0) {
                            stopAmbientTrack(ambId);
                        } else if (activeTracks[ambId]) {
                            activeTracks[ambId].vol = fade.endVol;
                            updateTrackVolume(ambId);
                        }
                    });

                    renderAmbients();
                    renderActiveTracksHeaderPanel();
                    renderScenesUI();
                }
            }, 50);
        }

        function updateCrossfadeProgressUI(progress, remainingSec) {
            var bar = document.getElementById('crossfade-progress-bar');
            var countdown = document.getElementById('crossfade-countdown');
            if (bar) {
                bar.style.width = `${Math.round(progress * 100)}%`;
            }
            if (countdown) {
                countdown.textContent = `${remainingSec}s`;
            }
        }

        function updateSceneWithCurrent(sceneId) {
            var scene = tableScenes.find(s => s.id === sceneId);
            if (!scene) return;

            var activeKeys = Object.keys(activeTracks);
            if (activeKeys.length === 0) {
                alert('Nenhum som ambiente ativo no momento para salvar no preset!');
                return;
            }

            if (confirm(`Deseja sobrescrever o preset da cena "${scene.name}" com os ${activeKeys.length} sons e volumes ativos no momento?`)) {
                scene.tracks = activeKeys.map(id => ({
                    id: id,
                    vol: activeTracks[id].vol
                }));
                syncActiveProfileChanges();
                renderScenesUI();
            }
        }

        var editingSceneId = null;

        function renameScene(sceneId) {
            openSaveSceneModal(sceneId);
        }

        function deleteScene(sceneId) {
            var scene = tableScenes.find(s => s.id === sceneId);
            if (!scene) return;

            if (confirm(`Deseja realmente excluir a cena "${scene.name}" desta aventura?`)) {
                tableScenes = tableScenes.filter(s => s.id !== sceneId);
                if (activeSceneId === sceneId) activeSceneId = null;
                syncActiveProfileChanges();
                renderScenesUI();
            }
        }

        // MODAL DE SALVAR NOVA CENA
        var saveSceneBtn = document.getElementById('save-scene-btn');
        var saveSceneModal = document.getElementById('save-scene-modal');
        var closeSceneModalBtn = document.getElementById('close-scene-modal');
        var saveSceneForm = document.getElementById('save-scene-form');
        var sceneNameInput = document.getElementById('scene-name-input');
        var modalSoundsPreview = document.getElementById('modal-sounds-preview');
        var suggestionBtns = document.querySelectorAll('.scene-tag-btn');
        var iconBtns = document.querySelectorAll('.scene-icon-opt');

        function openSaveSceneModal(sceneIdToEdit = null) {
            if (!saveSceneModal) return;
            
            editingSceneId = (typeof sceneIdToEdit === 'string') ? sceneIdToEdit : null;
            var activeKeys = Object.keys(activeTracks);

            if (editingSceneId) {
                var scene = tableScenes.find(s => s.id === editingSceneId);
                if (scene) {
                    if (sceneNameInput) sceneNameInput.value = scene.name;
                    
                    iconBtns.forEach(b => {
                        b.classList.remove('active', 'bg-amber-600', 'text-black');
                        b.classList.add('bg-zinc-800', 'text-amber-400');
                    });
                    var targetBtn = Array.from(iconBtns).find(b => b.getAttribute('data-icon') === scene.icon) || iconBtns[0];
                    if (targetBtn) {
                        targetBtn.classList.add('active', 'bg-amber-600', 'text-black');
                        targetBtn.classList.remove('bg-zinc-800', 'text-amber-400');
                        selectedModalIcon = targetBtn.getAttribute('data-icon');
                    }

                    if (modalSoundsPreview) {
                        if (!scene.tracks || scene.tracks.length === 0) {
                            modalSoundsPreview.innerHTML = `<div class="text-zinc-500 italic py-2 text-center">Nenhum som salvo nesta cena.</div>`;
                        } else {
                            modalSoundsPreview.innerHTML = `<div class="text-amber-500 text-[10px] uppercase font-bold text-center mb-2">Mantendo sons da cena original</div>` + 
                            scene.tracks.map(trk => {
                                var amb = getAmbientData().find(a => a.id === trk.id);
                                if (!amb) return '';
                                return `
                                    <div class="flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-900 last:border-0">
                                        <span class="flex items-center gap-2">
                                            <i class="fa-solid ${amb.icon} text-amber-500"></i>
                                            <span class="font-bold">${amb.name}</span>
                                        </span>
                                        <span class="text-amber-400 font-mono font-bold">${trk.vol}%</span>
                                    </div>
                                `;
                            }).join('');
                        }
                    }
                }
            } else {
                if (sceneNameInput) sceneNameInput.value = '';
                if (modalSoundsPreview) {
                    if (activeKeys.length === 0) {
                        modalSoundsPreview.innerHTML = `
                            <div class="text-zinc-500 italic py-2 text-center">
                                Nenhum som ambiente tocando agora. A cena será criada com faixas padrão ou você pode ativar sons antes de salvar!
                            </div>
                        `;
                    } else {
                        modalSoundsPreview.innerHTML = activeKeys.map(id => {
                            var trk = activeTracks[id];
                            var amb = trk.ambObj;
                            return `
                                <div class="flex items-center justify-between text-zinc-300 py-1 border-b border-zinc-900 last:border-0">
                                    <span class="flex items-center gap-2">
                                        <i class="fa-solid ${amb.icon} text-amber-500"></i>
                                        <span class="font-bold">${amb.name}</span>
                                    </span>
                                    <span class="text-amber-400 font-mono font-bold">${trk.vol}%</span>
                                </div>
                            `;
                        }).join('');
                    }
                }
            }

            saveSceneModal.classList.remove('hidden');
            if (sceneNameInput) sceneNameInput.focus();
        }

        function closeSaveSceneModal() {
            if (saveSceneModal) saveSceneModal.classList.add('hidden');
        }

        if (saveSceneBtn) saveSceneBtn.addEventListener('click', openSaveSceneModal);
        if (closeSceneModalBtn) closeSceneModalBtn.addEventListener('click', closeSaveSceneModal);

        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (sceneNameInput) {
                    sceneNameInput.value = btn.textContent.replace(/[^\w\s\u00C0-\u00FF]/gi, '').trim();
                }
            });
        });

        iconBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                iconBtns.forEach(b => {
                    b.classList.remove('active', 'bg-amber-600', 'text-black');
                    b.classList.add('bg-zinc-800', 'text-amber-400');
                });
                btn.classList.add('active', 'bg-amber-600', 'text-black');
                btn.classList.remove('bg-zinc-800', 'text-amber-400');
                selectedModalIcon = btn.getAttribute('data-icon') || 'fa-masks-theater';
            });
        });

        var customAmbientForm = document.getElementById('custom-ambient-form');
        if (customAmbientForm) {
            customAmbientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                var url = document.getElementById('custom-ambient-url').value;
                var name = document.getElementById('custom-ambient-name').value.trim();
                var category = 'ambiente';
                
                // Extract YT ID
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var match = url.match(regExp);
                var ytId = (match && match[2].length === 11) ? match[2] : null;
                
                if (!ytId) {
                    showToast('Link do YouTube inválido.', 'error');
                    return;
                }
                if (editingCustomAmbientId) {
                    var idx = customAmbients.findIndex(a => a.id === editingCustomAmbientId);
                    if (idx !== -1) {
                        customAmbients[idx].name = name;
                        customAmbients[idx].ytId = ytId;
                    }
                    showToast(`Som "${name}" atualizado!`, 'success');
                    cancelEditCustomAmbient();
                } else {
                    var newAmbient = {
                        id: `custom_${Date.now()}`,
                        name: name,
                        category: category,
                        icon: 'fa-music',
                        desc: 'Personalizado',
                        ytId: ytId,
                        isCustom: true
                    };
                    customAmbients.push(newAmbient);
                    showToast(`Som "${name}" adicionado!`, 'success');
                    customAmbientForm.reset();
                }

                localStorage.setItem(`st_custom_ambients_${currentUser ? currentUser.id : 'guest'}`, JSON.stringify(customAmbients));
                syncCustomAmbientsToCloud();
                renderAmbients();
            });
        }

        if (saveSceneForm) {
            saveSceneForm.addEventListener('submit', (e) => {
                e.preventDefault();
                var name = sceneNameInput.value.trim();
                if (!name) {
                    name = "Nova Cena";
                }

                if (editingSceneId) {
                    var scene = tableScenes.find(s => s.id === editingSceneId);
                    if (scene) {
                        scene.name = name;
                        scene.icon = selectedModalIcon;
                    }
                } else {
                    var activeKeys = Object.keys(activeTracks);
                    var tracksToSave = [];

                    if (activeKeys.length > 0) {
                        tracksToSave = activeKeys.map(id => ({
                            id: id,
                            vol: activeTracks[id].vol
                        }));
                    } else {
                        tracksToSave = [{ id: 'taverna', vol: 70 }];
                    }

                    var newScene = {
                        id: `scene_${Date.now()}`,
                        name: name,
                        icon: selectedModalIcon,
                        tracks: tracksToSave
                    };

                    tableScenes.unshift(newScene);
                    activeSceneId = newScene.id;
                }

                syncActiveProfileChanges();
                renderScenesUI();
                closeSaveSceneModal();
                showToast(`Cena "${name}" salva com sucesso!`, 'success');
            });
        }

        // CARROSSEL DE CENAS - BOTÕES DE SCROLL
        var scrollLeftBtn = document.getElementById('scenes-scroll-left');
        var scrollRightBtn = document.getElementById('scenes-scroll-right');
        var scenesTrack = document.getElementById('scenes-carousel-track');

        if (scrollLeftBtn && scenesTrack) {
            scrollLeftBtn.addEventListener('click', () => {
                scenesTrack.scrollBy({ left: -240, behavior: 'smooth' });
            });
        }
        if (scrollRightBtn && scenesTrack) {
            scrollRightBtn.addEventListener('click', () => {
                scenesTrack.scrollBy({ left: 240, behavior: 'smooth' });
            });
        }

        // TECLADO ATALHOS 1 A 9
        window.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName === 'INPUT') return;
            var key = e.key;
            if (['1','2','3','4','5','6','7','8','9'].includes(key)) {
                var sfxId = quickSlots[key];
                if (sfxId) {
                    playSFX(sfxId);
                    var slot = document.querySelector(`.quick-slot[data-slot="${key}"]`);
                    if (slot) {
                        slot.classList.add('sfx-active');
                        setTimeout(() => slot.classList.remove('sfx-active'), 200);
                    }
                }
            }
        });

        // FILTROS E BUSCA
        var categoryBtns = document.querySelectorAll('.cat-btn');
        var searchInput = document.getElementById('search-input');

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => {
                    b.classList.remove('active', 'bg-amber-600', 'text-black');
                    b.classList.add('bg-zinc-900', 'text-zinc-300');
                });
                btn.classList.add('active', 'bg-amber-600', 'text-black');
                btn.classList.remove('bg-zinc-900', 'text-zinc-300');
                currentCat = btn.getAttribute('data-cat');
                currentPage = 1;
                renderSFXCatalog();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase().trim();
                currentPage = 1;
                renderSFXCatalog();
            });
        }

        // INICIALIZAÇÃO DA PÁGINA
        setTimeout(() => {
            updateAuthUI();
            renderTableProfilesUI();
            renderQuickSlots();
            renderFavorites();
            renderSFXCatalog();
            renderAmbients();
            renderActiveTracksHeaderPanel();
            renderScenesUI();
            restoreActiveState(getActiveProfile()?.active_state);
        });
    

      (window as any).getAmbientData = getAmbientData;
(window as any).editCustomAmbient = editCustomAmbient;
(window as any).cancelEditCustomAmbient = cancelEditCustomAmbient;
(window as any).deleteCustomAmbient = deleteCustomAmbient;
(window as any).syncCustomAmbientsToCloud = syncCustomAmbientsToCloud;
(window as any).getActiveProfile = getActiveProfile;
(window as any).restoreActiveState = restoreActiveState;
(window as any).debouncedSyncActiveProfileChanges = debouncedSyncActiveProfileChanges;
(window as any).syncActiveProfileChanges = syncActiveProfileChanges;
(window as any).renderTableProfilesUI = renderTableProfilesUI;
(window as any).getRegisteredUsers = getRegisteredUsers;
(window as any).saveRegisteredUser = saveRegisteredUser;
(window as any).showToast = showToast;
(window as any).applyUserData = applyUserData;
(window as any).updateAuthUI = updateAuthUI;
(window as any).openAuthModal = openAuthModal;
(window as any).closeAuthModal = closeAuthModal;
(window as any).handleLogout = handleLogout;
(window as any).playSFX = playSFX;
(window as any).renderQuickSlots = renderQuickSlots;
(window as any).renderFavorites = renderFavorites;
(window as any).getFilteredSFX = getFilteredSFX;
(window as any).renderSFXCatalog = renderSFXCatalog;
(window as any).renderPagination = renderPagination;
(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
(window as any).renderActiveTracksHeaderPanel = renderActiveTracksHeaderPanel;
(window as any).renderAmbients = renderAmbients;
(window as any).startAmbientTrack = startAmbientTrack;
(window as any).togglePlayPauseTrack = togglePlayPauseTrack;
(window as any).stopAmbientTrack = stopAmbientTrack;
(window as any).updateTrackVolume = updateTrackVolume;
(window as any).renderScenesUI = renderScenesUI;
(window as any).renderCentralActiveSceneCard = renderCentralActiveSceneCard;
(window as any).renderScenesCarousel = renderScenesCarousel;
(window as any).transitionToScene = transitionToScene;
(window as any).updateCrossfadeProgressUI = updateCrossfadeProgressUI;
(window as any).updateSceneWithCurrent = updateSceneWithCurrent;
(window as any).renameScene = renameScene;
(window as any).deleteScene = deleteScene;
(window as any).openSaveSceneModal = openSaveSceneModal;
(window as any).closeSaveSceneModal = closeSaveSceneModal;

    } catch(e) {
      console.error("Error in legacy script for Sons:", e);
    }
  }, []);

  return (
    <div className="font-sans" dangerouslySetInnerHTML={{ __html: `
        <!-- Hero Section & Master Control -->
        <section class="relative w-full py-6 sm:py-10 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-b border-zinc-800">
            <div class="container mx-auto px-4 max-w-6xl text-center">
                <span class="inline-flex items-center gap-2 text-amber-500 text-[11px] sm:text-xs font-black tracking-widest uppercase mb-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30">
                    <i class="fa-solid fa-sliders"></i> Painel Interativo do Mestre
                </span>
                <h1 class="text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-2 text-white font-title">
                    Estúdio Sonoro da Mesa
                </h1>
                <div class="mb-5">
                    <a href="instrucoes-mesa" target="_blank" class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold uppercase text-[11px] sm:text-xs tracking-wider px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 group">
                        <i class="fa-solid fa-book-open group-hover:scale-110 transition-transform"></i>
                        <span>Aprenda a Usar a Mesa</span>
                    </a>
                </div>

                <!-- BARRA MASTER DE ÁUDIO & GERENCIADOR DE PERFIS DE MESAS -->
                <div class="bg-zinc-900/95 backdrop-blur-md border border-amber-600/30 rounded-2xl p-3.5 sm:p-5 max-w-5xl mx-auto shadow-2xl flex flex-col gap-4 text-left">
                    
                    <!-- LINHA DE GERENCIAMENTO DE PERFIS DE MESAS DE RPG -->
                    <div class="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3" id="table-profiles-section">
                        <div class="flex items-center gap-3 w-full md:w-auto">
                            <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm shrink-0 border border-amber-500/40">
                                <i class="fa-solid fa-dice-d20"></i>
                            </div>
                            <div class="min-w-0 flex-grow md:flex-grow-0">
                                <span class="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Perfil de Mesa Ativa</span>
                                <select id="table-profile-select" class="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer w-full md:w-64">
                                    <option value="default_mesa">Mesa 1: Aventura Principal</option>
                                </select>
                            </div>
                        </div>

                        <!-- Botões de Ação do Perfil de Mesa -->
                        <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button id="add-table-btn" class="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-plus text-amber-400"></i> Nova Mesa
                            </button>
                            <button id="rename-table-btn" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer" title="Renomear Mesa">
                                <i class="fa-solid fa-pen text-zinc-400"></i>
                            </button>
                            <button id="delete-table-btn" class="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer" title="Excluir Mesa">
                                <i class="fa-solid fa-trash text-red-400"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Linha Volume Master e Controles -->
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                        <div class="flex items-center gap-3 w-full sm:w-auto justify-between">
                            <div class="flex items-center gap-2.5">
                                <button id="master-mute-btn" class="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-500 flex items-center justify-center text-lg transition-all cursor-pointer border border-zinc-700 shrink-0" title="Silenciar / Ativar Áudio Geral">
                                    <i class="fa-solid fa-volume-high" id="master-mute-icon"></i>
                                </button>
                                <div>
                                    <span class="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">Volume Master</span>
                                    <span class="text-amber-400 font-bold text-xs" id="master-vol-label">80%</span>
                                </div>
                            </div>
                            <input type="range" id="master-volume" min="0" max="100" value="80" class="w-32 sm:w-40 accent-amber-500 cursor-pointer">
                        </div>

                        <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                            <button id="pause-all-btn" class="flex-1 sm:flex-none bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-700/50 font-bold uppercase text-[11px] sm:text-xs tracking-wider px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-pause text-xs"></i> Pausar Todos
                            </button>
                            <button id="reset-ambients-btn" class="flex-1 sm:flex-none bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-bold uppercase text-[11px] sm:text-xs tracking-wider px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer" title="Limpar todas as músicas ambientes ativas">
                                <i class="fa-solid fa-rotate-left text-amber-500"></i> Limpar
                            </button>
                        </div>
                    </div>

                    <!-- Músicas Ambientes Tocando no Momento -->
                    <div>
                        <div class="flex items-center justify-between mb-2 gap-2">
                            <span class="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                                <i class="fa-solid fa-compact-disc animate-spin text-amber-500" style="animation-duration: 4s;"></i> Ambientes Ativos
                            </span>
                            <div class="flex items-center gap-3">
                                <button id="save-scene-btn" class="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-extrabold text-[10px] sm:text-xs uppercase px-3 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 cursor-pointer shrink-0 group">
                                    <i class="fa-solid fa-bookmark group-hover:scale-110 transition-transform"></i>
                                    <span class="hidden sm:inline">Salvar Cena Atual</span>
                                    <span class="sm:hidden">Salvar</span>
                                    <span id="save-scene-badge" class="bg-black/30 text-black px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold">0 sons</span>
                                </button>
                                <span class="text-[11px] text-zinc-400 whitespace-nowrap hidden sm:inline" id="active-tracks-count">0 faixas tocando</span>
                            </div>
                        </div>

                        <div id="active-tracks-container" class="min-h-[48px] bg-zinc-950/80 border border-zinc-800 rounded-xl p-2 flex flex-col gap-2">
                            <div class="text-zinc-500 text-xs italic py-2 text-center" id="no-active-tracks-msg">
                                Nenhuma música ambiente tocando. Clique em uma faixa abaixo para iniciar!
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <!-- SEÇÃO: PALCO DE CENAS & PRESETS DE ÁUDIO DA AVENTURA -->
        <section class="py-6 sm:py-8 bg-zinc-950/95 border-b border-zinc-800 relative overflow-hidden" id="scenes-deck-section">
            <div class="container mx-auto px-4 max-w-6xl">
                
                <!-- Cabeçalho da Seção de Cenas -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">Presets da Aventura</span>
                            <h2 class="text-xl sm:text-2xl text-amber-500 font-title uppercase flex items-center gap-2">
                                <i class="fa-solid fa-masks-theater text-amber-400"></i> Cenas Sonoras da Mesa
                            </h2>
                        </div>
                        <p class="text-zinc-400 text-xs mt-1">
                            Monte suas cenas e transicione entre momentos da narrativa. Arraste qualquer card para o palco central para fazer um crossfade suave de 4 segundos.
                        </p>
                    </div>
                </div>

                <!-- PALCO PRINCIPAL DE CENAS: CARD CENTRALIZADO ATIVO + CARROSSEL DE PRESETS -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    
                    <!-- CARD CENTRALIZADO ATIVO (STAGE / DROP TARGET COM CROSSFADE 4s) -->
                    <div class="lg:col-span-5 flex flex-col">
                        <div class="text-[11px] uppercase tracking-wider text-amber-400/90 font-bold mb-2 flex items-center justify-between">
                            <span class="flex items-center gap-1.5">
                                <i class="fa-solid fa-circle-play text-amber-500 animate-pulse"></i> Cena Ativa (Tocando Agora)
                            </span>
                            <span class="text-[10px] text-zinc-400 font-mono" id="active-scene-status-tag">Pronto</span>
                        </div>

                        <div id="central-active-scene-card" class="central-scene-dropzone relative flex-grow bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-amber-950/30 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-[0_0_30px_rgba(245,158,11,0.15)] min-h-[220px]">
                            <!-- Preenchido dinamicamente via JavaScript -->
                        </div>
                    </div>

                    <!-- CARROSSEL / FILEIRA DE CARDS DE CENAS DA AVENTURA -->
                    <div class="lg:col-span-7 flex flex-col min-w-0">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[11px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-layer-group text-zinc-400"></i> Cenas Salvas na Aventura (<span id="scenes-count-label">0</span>)
                            </span>
                            <div class="flex items-center gap-1.5">
                                <button id="scenes-scroll-left" class="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 text-xs flex items-center justify-center transition-all cursor-pointer border border-zinc-800" title="Rolar para esquerda">
                                    <i class="fa-solid fa-chevron-left"></i>
                                </button>
                                <button id="scenes-scroll-right" class="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 text-xs flex items-center justify-center transition-all cursor-pointer border border-zinc-800" title="Rolar para direita">
                                    <i class="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        <div id="scenes-carousel-track" class="scenes-track flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar flex-grow select-none">
                            <!-- Cards de cenas gerados via JavaScript -->
                        </div>
                    </div>

                </div>

            </div>
        </section>

        <!-- SEÇÃO: BARRA DE ATALHOS RÁPIDOS (OCULTA NO MOBILE / VISÍVEL APENAS DESKTOP) -->
        <section class="hidden sm:block py-5 sm:py-6 bg-zinc-950 border-b border-zinc-900">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <div>
                        <h2 class="text-lg sm:text-xl text-amber-500 font-title uppercase flex items-center gap-2">
                            <i class="fa-solid fa-keyboard"></i> Atalhos Rápidos no Teclado (Teclas 1 a 9)
                        </h2>
                        <p class="text-zinc-400 text-xs">Arraste um efeito até a caixa para definir o atalho do teclado da mesa ativa ou clique no ícone do teclado para definir o atalho no teclado.</p>
                    </div>
                    <button id="clear-slots-btn" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0">
                        <i class="fa-solid fa-trash-can text-xs"></i> Limpar Atalhos
                    </button>
                </div>

                <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 sm:gap-3" id="quick-slots-container">
                    <!-- Gerado Dinamicamente via JavaScript -->
                </div>
            </div>
        </section>

        <!-- SEÇÃO: BOX DE FAVORITOS DA MESA -->
        <section class="py-5 sm:py-6 bg-zinc-900/60 border-b border-zinc-900">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-base sm:text-lg text-amber-400 font-title uppercase flex items-center gap-2">
                        <i class="fa-solid fa-star text-amber-400"></i> Caixa de Favoritos da Mesa
                    </h2>
                    <span class="text-[11px] text-zinc-400">Arraste sons para cá ou toque na ⭐</span>
                </div>

                <div id="favorites-box" class="min-h-[90px] bg-zinc-950/80 border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-xl p-3 transition-all grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5 sm:gap-3">
                    <div class="col-span-full text-zinc-500 text-xs italic py-3 text-center w-full" id="fav-empty-msg">
                        <i class="fa-solid fa-hand-pointer mr-1"></i> Nenhum som favorito ainda. Clique na ⭐ para adicionar!
                    </div>
                </div>
            </div>
        </section>

        <!-- FILTROS E BUSCA -->
        <section class="py-3.5 sm:py-4 bg-zinc-950 border-b border-zinc-900 sticky top-[60px] sm:top-[73px] z-40 shadow-lg backdrop-blur-md bg-zinc-950/95">
            <div class="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-3">
                <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1 flex-nowrap" id="category-filters">
                    <button data-cat="all" class="cat-btn active bg-amber-600 text-black font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0">
                        Todos
                    </button>
                    <button data-cat="combate" class="cat-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0">
                        <i class="fa-solid fa-sword text-amber-500 mr-1"></i> Combate
                    </button>
                    <button data-cat="magia" class="cat-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0">
                        <i class="fa-solid fa-wand-magic-sparkles text-purple-400 mr-1"></i> Magia
                    </button>
                    <button data-cat="ambiente" class="cat-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0">
                        <i class="fa-solid fa-dungeon text-emerald-400 mr-1"></i> Ambiente
                    </button>
                    <button data-cat="monstro" class="cat-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0">
                        <i class="fa-solid fa-dragon text-red-400 mr-1"></i> Monstro
                    </button>
                    <button data-cat="taverna" class="cat-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0">
                        <i class="fa-solid fa-beer-mug-empty text-amber-400 mr-1"></i> Taverna
                    </button>
                </div>

                <div class="relative w-full md:w-64 shrink-0">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
                    <input type="text" id="search-input" placeholder="Buscar efeito..." class="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all">
                </div>
            </div>
        </section>

        <!-- SEÇÃO DE EFEITOS SONOROS -->
        <section class="py-8 sm:py-10 bg-black border-b border-zinc-900">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h2 class="text-xl sm:text-2xl text-amber-500 font-title uppercase flex items-center gap-2">
                            <i class="fa-solid fa-bolt"></i> Catálogo de Efeitos Sonoros (SFX)
                        </h2>
                        <p class="text-zinc-400 text-xs">Toque para ouvir o efeito. Múltiplos toques simultâneos permitidos!</p>
                    </div>
                    <span class="text-xs text-zinc-400 font-mono hidden sm:inline" id="sfx-count-label">40 efeitos encontrados</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 min-h-[340px] content-start" id="sfx-catalog-grid"></div>

                <div class="flex items-center justify-between mt-6 pt-4 border-t border-zinc-900" id="pagination-container">
                    <button id="prev-page-btn" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed">
                        <i class="fa-solid fa-chevron-left text-xs"></i> Anterior
                    </button>

                    <div class="flex items-center gap-1.5" id="page-numbers-container"></div>

                    <button id="next-page-btn" class="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-xs uppercase px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed">
                        Próximo <i class="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                </div>
            </div>
        </section>

        <!-- SEÇÃO SEPARADA: MÚSICAS & PAISAGENS AMBIENTES -->
        <section class="py-10 sm:py-12 bg-zinc-950">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h2 class="text-xl sm:text-2xl md:text-3xl text-amber-500 font-title uppercase flex items-center gap-2">
                            <i class="fa-solid fa-compact-disc text-amber-400"></i> Músicas & Paisagens Ambientes
                        </h2>
                        <p class="text-zinc-400 text-xs sm:text-sm mt-1">Clique na ★ para favoritar a faixa e fixá-la no topo da mesa!</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" id="ambient-grid"></div>

                <div id="youtube-players-container" class="hidden"></div>
            </div>
        </section>

        <!-- SEÇÃO DE AMBIENTES PERSONALIZADOS -->
        <section class="py-10 sm:py-12 bg-zinc-950 border-t border-zinc-900">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div class="md:w-1/3">
                        <h2 class="text-xl sm:text-2xl md:text-3xl text-amber-500 font-title uppercase flex items-center gap-2 mb-2">
                            <i class="fa-brands fa-youtube text-amber-400"></i> Ambientes Personalizados
                        </h2>
                        <p class="text-zinc-400 text-xs sm:text-sm">Expanda seu acervo adicionando trilhas sonoras diretamente do YouTube. Essas faixas são salvas na nuvem e exclusivas da sua conta.</p>
                    </div>
                    <div class="md:w-2/3 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-inner">
                        <form id="custom-ambient-form" class="flex flex-col sm:flex-row gap-4 items-end">
                            <div class="w-full sm:w-6/12">
                                <label class="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Link do YouTube</label>
                                <input type="url" id="custom-ambient-url" required placeholder="https://youtube.com/watch?v=..." class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-all">
                            </div>
                            <div class="w-full sm:w-6/12">
                                <label class="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Nome do Som</label>
                                <input type="text" id="custom-ambient-name" required placeholder="Ex: Tema Épico" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-all">
                            </div>
                            <div class="w-full sm:w-auto flex items-center gap-2">
                                <button type="submit" id="custom-ambient-submit-btn" class="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase text-xs tracking-wider px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-lg whitespace-nowrap h-[38px] flex items-center justify-center">
                                    Adicionar
                                </button>
                                <button type="button" id="custom-ambient-cancel-btn" onclick="cancelEditCustomAmbient()" class="hidden w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-white font-bold uppercase text-xs tracking-wider px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-lg whitespace-nowrap h-[38px] flex items-center justify-center">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" id="custom-ambient-grid"></div>
            </div>
        </section>
    ` }} />
  );
}
