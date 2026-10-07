export function getProductProfile(p: any) {
  const type = (p.type || '').toLowerCase();
  const cat = (p.category || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const id = (p.id || '').toLowerCase();

  if (id === 'personalizada' || cat.includes('exclusivo') || name.includes('personalizada') || name.includes('dê vida ao seu')) {
      return {
          categoryKey: 'personalizada',
          breadcrumbCategory: 'Miniaturas',
          breadcrumbHref: '/miniaturas',
          catalogLabel: 'as Miniaturas',
          typeLabel: 'Serviço Exclusivo Sob Demanda',
          tagBadge: 'Feito Sob Medida',
          categoryBadge: p.category || 'Serviço Exclusivo',
          microBadges: [
              { icon: 'fa-wand-magic-sparkles', title: '100% Sob Medida', subtitle: 'Com seu personagem' },
              { icon: 'fa-box', title: 'Caixa de MDF', subtitle: 'Gravada a laser' },
              { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
          ],
          specs: [
              {
                  icon: 'fa-fingerprint',
                  title: 'Criação Exclusiva',
                  text: 'Trabalhamos diretamente com a sua referência visual. Escolhemos ou adaptamos o modelo 3D ideal para representar fielmente o seu personagem.'
              },
              {
                  icon: 'fa-brush',
                  title: 'Pintura & Caixa de Luxo',
                  text: 'Pintura manual profissional detalhada e entrega em uma Caixa de MDF de Luxo cortada e gravada a laser com o nome, classe e símbolos do seu herói.'
              },
              {
                  icon: 'fa-truck-fast',
                  title: 'Prazos & Envio',
                  text: 'O envio é feito via Correios ou transportadora para todo o país.'
              }
          ]
      };
  }

  if (type === 'bundle' || type === 'pacote' || cat.includes('pacote')) {
      return {
          categoryKey: 'bundle',
          breadcrumbCategory: 'Pacotes Especiais',
          breadcrumbHref: '/miniaturas',
          catalogLabel: 'os Pacotes',
          typeLabel: 'Pacote Especial de Miniaturas',
          tagBadge: 'Kit Econômico',
          categoryBadge: p.category || 'Pacote Especial',
          microBadges: [
              { icon: 'fa-boxes-stacked', title: 'Kit Completo', subtitle: 'Múltiplas peças' },
              { icon: 'fa-tags', title: 'Preço Especial', subtitle: 'Desconto de pacote' },
              { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
          ],
          specs: [
              {
                  icon: 'fa-boxes-stacked',
                  title: 'Pacote Pronto',
                  text: 'Um kit montado com sinergia para a sua mesa, pronto para jogar.'
              },
              {
                  icon: 'fa-tags',
                  title: 'Economia',
                  text: 'Adquirir o pacote completo oferece um valor mais vantajoso do que comprar as peças separadamente.'
              },
              {
                  icon: 'fa-truck-fast',
                  title: 'Prazos & Envio',
                  text: 'O envio é feito via Correios ou transportadora para todo o país.'
              }
          ]
      };
  }

  if (type === 'arsenal' || type === 'escudo' || cat.includes('arsenal') || cat.includes('escudo') || name.includes('escudo')) {
      return {
          categoryKey: 'arsenal',
          breadcrumbCategory: 'Arsenal de RPG',
          breadcrumbHref: '/arsenal',
          catalogLabel: 'o Arsenal',
          typeLabel: 'Arsenal & Acessórios',
          tagBadge: 'MDF Nobre & Corte Laser',
          categoryBadge: p.category || 'Arsenal de RPG',
          microBadges: [
              { icon: 'fa-vector-square', title: 'Corte a Laser', subtitle: 'Precisão milimétrica' },
              { icon: 'fa-shield-halved', title: 'Estrutura Nobre', subtitle: 'MDF de alta densidade' },
              { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
          ],
          specs: [
              {
                  icon: 'fa-tree',
                  title: 'Material e Entalhe',
                  text: 'Fabricado em MDF nobre de alta densidade com corte e entalhe a laser de extrema precisão. Estrutura sólida projetada para facilitar o gerenciamento de mesas de RPG.'
              },
              {
                  icon: 'fa-wand-magic-sparkles',
                  title: 'Design e Ergonomia',
                  text: 'Projetado para mestres, com presilhas na parte de trás para prender suas folhas de consulta rápida, módulos funcionais e acabamento refinado.'
              },
              {
                  icon: 'fa-truck-fast',
                  title: 'Prazos & Envio',
                  text: 'O envio é feito via Correios ou transportadora para todo o país.'
              }
          ]
      };
  }

  if (cat.includes('dados') || cat.includes('torre') || cat.includes('bandeja') || name.includes('torre') || name.includes('bandeja') || name.includes('dados')) {
      return {
          categoryKey: 'dados',
          breadcrumbCategory: 'Arsenal de RPG',
          breadcrumbHref: '/arsenal',
          catalogLabel: 'os Acessórios',
          typeLabel: 'Acessórios de Dados',
          tagBadge: 'Corte a Laser & Forração',
          categoryBadge: p.category || 'Acessório de Dados',
          microBadges: [
              { icon: 'fa-dice-d20', title: 'Rolagem Precisa', subtitle: 'Aleatoriedade balanceada' },
              { icon: 'fa-layer-group', title: 'Amortecimento', subtitle: 'Protege dados e mesa' },
              { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
          ],
          specs: [
              {
                  icon: 'fa-dice',
                  title: 'Mecânica de Rolagem',
                  text: 'Defletores internos calculados para aleatoriedade máxima e forração que reduz o ruído da rolagem, preservando seus dados especiais de resina, acrílico ou metal.'
              },
              {
                  icon: 'fa-cube',
                  title: 'Material e Estrutura',
                  text: 'MDF selecionado de alta qualidade com encaixes precisos, garantindo firmeza durante as partidas e praticidade no transporte.'
              },
              {
                  icon: 'fa-truck-fast',
                  title: 'Prazos & Envio',
                  text: 'O envio é feito via Correios ou transportadora para todo o país.'
              }
          ]
      };
  }

  if (type === 'oneshot' || type === 'aventura' || cat.includes('oneshot') || cat.includes('aventura') || cat.includes('campanha') || cat.includes('livro') || name.includes('one shot') || name.includes('kit de aventura') || name.includes('aventura') || name.includes('herdeiro')) {
      return {
          categoryKey: 'oneshot',
          breadcrumbCategory: 'One Shots & Aventuras',
          breadcrumbHref: '/oneshots',
          catalogLabel: 'as Aventuras',
          typeLabel: 'Módulos & Kits de Aventura',
          tagBadge: 'Material Físico Completo',
          categoryBadge: p.category || 'Aventura Pronta',
          microBadges: [
              { icon: 'fa-book-open', title: 'História Pronta', subtitle: 'Mapas e fichas inclusos' },
              { icon: 'fa-chess-knight', title: 'Miniaturas Inclusas', subtitle: 'Monstros e heróis' },
              { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
          ],
          specs: [
              {
                  icon: 'fa-scroll',
                  title: 'Conteúdo e Estrutura',
                  text: 'Módulo de campanha completo pronto para mestrar, incluindo narrativa balanceada, tabelas de encontros, mapas táticos e fichas de personagens prontas.'
              },
              {
                  icon: 'fa-boxes-stacked',
                  title: 'Componentes Gráficos e Físicos',
                  text: 'Material impresso em alta gramatura acompanhado do conjunto de miniaturas em resina dos principais encontros da história.'
              },
              {
                  icon: 'fa-truck-fast',
                  title: 'Prazos & Envio',
                  text: 'O envio é feito via Correios ou transportadora para todo o país.'
              }
          ]
      };
  }

  return {
      categoryKey: 'miniatura',
      breadcrumbCategory: 'Miniaturas',
      breadcrumbHref: '/miniaturas',
      catalogLabel: 'as Miniaturas',
      typeLabel: 'Miniatura em Resina',
      tagBadge: 'Resina Premium 8K',
      categoryBadge: p.category || 'Miniatura',
      microBadges: [
          { icon: 'fa-gem', title: 'Alta Definição', subtitle: 'Riqueza em relevo' },
          { icon: 'fa-spray-can-sparkles', title: 'Curada & Lavada', subtitle: 'Pronta p/ uso' },
          { icon: 'fa-truck-fast', title: 'Envio Nacional', subtitle: 'Correios / Transportadora' }
      ],
      specs: [
          {
              icon: 'fa-cube',
              title: 'Material e Resolução',
              text: 'Produzido em Resina Fotopolimerizável de alta tenacidade em impressoras 3D 8K/12K. Apresenta microdetalhes expressivos e resistência ideal para manuseio em mesas de RPG.'
          },
          {
              icon: 'fa-brush',
              title: 'Pintura e Finalização',
              text: 'Quando encomendada com pintura, cada peça recebe primer de aderência, tintas acrílicas para modelismo e camada de verniz fosco ultra-resistente para proteção contra marcas de dedos.'
          },
          {
              icon: 'fa-truck-fast',
              title: 'Prazos & Envio',
              text: 'O envio é feito via Correios ou transportadora para todo o país.'
          }
      ]
  };
}
