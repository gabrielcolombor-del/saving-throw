/*
 * Categorias de miniaturas com página própria (/miniaturas/<slug>), indexável no Google.
 * `db` é o valor de st_products.category. Para criar uma categoria nova: cadastre produtos
 * com essa category no admin e adicione uma entrada aqui (página, sitemap e abas acompanham).
 */

export type MiniCategory = {
  slug: string;
  db: string;
  label: string;
  title: string;
  h1: string;
  description: string;
  intro: string[];
};

export const MINI_CATEGORIES: MiniCategory[] = [
  {
    slug: 'herois-e-npcs',
    db: 'npcs',
    label: 'Heróis & NPCs',
    title: 'Miniaturas de Heróis e NPCs para RPG',
    h1: 'Heróis & NPCs',
    description:
      'Miniaturas de heróis e NPCs para RPG em resina 3D: magos, clérigos, bárbaros, ladinos, cavaleiros e mais, com ou sem pintura artística. Envio para todo o Brasil.',
    intro: [
      'Representar o grupo e os personagens do mestre com miniaturas próprias deixa cada cena mais clara no mapa e mais memorável na mesa. Aqui estão as classes clássicas de fantasia — magos, clérigos, bárbaros, ladinos, bardos, druidas, monges, patrulheiros e cavaleiros — além de figuras como aprendizes, anciões e reis anões para os NPCs da sua campanha.',
      'Todas são impressas em resina de alta definição, entregues sem suportes, lavadas e curadas. Escolha a versão sem pintura, pronta para pintar, ou com pintura artística feita à mão.',
    ],
  },
  {
    slug: 'monstros',
    db: 'monstros',
    label: 'Monstros',
    title: 'Miniaturas de Monstros para RPG',
    h1: 'Monstros',
    description:
      'Miniaturas de monstros para RPG em resina 3D, de criaturas de neve a dragões, com ou sem pintura artística. Alta definição para os seus encontros. Envio para todo o Brasil.',
    intro: [
      'Um bom monstro na mesa muda o clima do combate. Nosso bestiário reúne criaturas impressas em resina de alta definição, em tamanhos maiores que os heróis para marcar presença no mapa de batalha.',
      'Cada peça é entregue sem suportes, lavada e curada, com opção de pintura artística feita à mão. Precisa de um monstro que não está no catálogo? Fazemos sob encomenda a partir da sua referência ou do arquivo STL.',
    ],
  },
];

export const categoryBySlug = (slug: string) => MINI_CATEGORIES.find((c) => c.slug === slug);
export const categoryByDb = (db: string | null | undefined) =>
  MINI_CATEGORIES.find((c) => c.db === (db || '').toLowerCase());
