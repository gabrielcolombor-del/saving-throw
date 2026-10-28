import type { Faq } from '@/components/SeoContent';

/*
 * Textos de SEO por página. Regra: só afirmar o que o site já diz em outros lugares
 * (prazos, frete, materiais). Ao mudar uma política (frete, prazo), atualize aqui também.
 */

const FAQ_ENVIO: Faq = {
  q: 'Qual o prazo de envio e para onde vocês entregam?',
  a: 'As peças são produzidas sob encomenda e enviadas em até 7 dias úteis. O envio é feito via Correios ou transportadora para todo o Brasil, e pedidos a partir de R$ 149,00 têm frete grátis.',
};

const FAQ_PEDIDO: Faq = {
  q: 'Como faço um pedido?',
  a: 'Escolha o produto e as opções no site e finalize a encomenda pelo WhatsApp com a nossa equipe, que confirma os detalhes, o valor e o prazo do seu pedido.',
};

export const HOME_FAQ: Faq[] = [
  {
    q: 'O que a Saving Throw vende?',
    a: 'Miniaturas de RPG impressas em resina 3D (com ou sem pintura artística), miniaturas personalizadas do seu personagem, kits de aventura One Shot com história, mapas e miniaturas, e acessórios em MDF com corte a laser, como o escudo do mestre.',
  },
  FAQ_PEDIDO,
  FAQ_ENVIO,
  {
    q: 'Posso transformar o meu personagem em miniatura?',
    a: 'Sim. Você envia uma imagem de referência do seu personagem, nós escolhemos ou adaptamos o modelo 3D ideal, imprimimos em resina premium e, se quiser, aplicamos pintura artística feita à mão. A miniatura pode vir em uma caixa de MDF gravada a laser com o nome, a classe e os símbolos do herói.',
  },
];

export const MINIATURAS_INTRO = {
  title: 'Miniaturas de RPG em resina 3D',
  paragraphs: [
    'Nossas miniaturas de RPG são impressas em resina fotopolimerizável de alta tenacidade, em impressoras 3D 8K/12K. O resultado são microdetalhes nítidos e uma peça resistente para o manuseio na mesa de jogo, seja em Dungeons & Dragons, Tormenta, Pathfinder ou no seu sistema favorito.',
    'Cada miniatura é entregue sem suportes, lavada e curada. Você escolhe a versão sem pintura (cinza, pronta para pintar) ou com pintura artística: primer de aderência, tintas acrílicas para modelismo e verniz fosco que protege contra marcas de dedos.',
    'Além do bestiário com heróis, monstros e NPCs, fazemos a miniatura personalizada do seu personagem a partir de uma imagem de referência.',
  ],
};

export const MINIATURAS_FAQ: Faq[] = [
  {
    q: 'Qual a diferença entre a miniatura sem pintura e com pintura?',
    a: 'A versão sem pintura chega em resina cinza, pronta para você pintar. A versão com pintura artística recebe primer, tintas acrílicas para modelismo e verniz fosco de proteção, pronta para ir direto para o mapa de combate.',
  },
  {
    q: 'Qual a qualidade de impressão das miniaturas?',
    a: 'Usamos resina fotopolimerizável de alta tenacidade em impressoras 3D 8K/12K, o que garante alta definição de detalhes. As peças são entregues sem suportes, lavadas e curadas.',
  },
  FAQ_ENVIO,
  FAQ_PEDIDO,
];

export const ARSENAL_INTRO = {
  title: 'Acessórios de RPG em MDF com corte a laser',
  paragraphs: [
    'O Arsenal reúne acessórios para mestres e jogadores produzidos em MDF de alta densidade, com corte e entalhe a laser de alta precisão. O destaque é o escudo do mestre personalizado, feito para deixar a mesa mais organizada e imersiva.',
    'O escudo do mestre tem presilhas na parte de trás para prender folhas de consulta rápida e acabamento envernizado. Novos acessórios entram nesta seção assim que ficam disponíveis.',
  ],
};

export const ARSENAL_FAQ: Faq[] = [
  {
    q: 'De que material são feitos os acessórios do Arsenal?',
    a: 'De MDF de alta densidade com corte e entalhe a laser, com encaixes precisos para dar firmeza durante as partidas e facilitar o transporte.',
  },
  {
    q: 'O escudo do mestre pode ser personalizado?',
    a: 'Sim. O Escudo do Mestre Personalizado é produzido sob encomenda; combine os detalhes da personalização com a nossa equipe pelo WhatsApp ao fazer o pedido.',
  },
  FAQ_ENVIO,
];

export const ONESHOTS_INTRO = {
  title: 'Kits de aventura One Shot prontos para jogar',
  paragraphs: [
    'Um One Shot é uma aventura de RPG pensada para ser jogada em uma única sessão — ideal para apresentar o hobby a novos jogadores, testar um sistema ou fazer uma pausa na campanha principal.',
    'Nossos kits de aventura trazem o módulo impresso em alta gramatura, com narrativa, tabelas de encontros, mapas táticos e fichas de personagens prontas, junto com as miniaturas em resina dos heróis, monstros e vilões da história. É abrir a caixa e mestrar.',
  ],
};

export const ONESHOTS_FAQ: Faq[] = [
  {
    q: 'O que vem em um kit de aventura?',
    a: 'O folheto impresso da aventura com a história completa e os mapas, e as miniaturas em resina dos monstros, NPCs e heróis da campanha. As miniaturas podem vir sem pintura ou com pintura artística.',
  },
  {
    q: 'Preciso ter experiência para mestrar um One Shot?',
    a: 'Não. O módulo vem com narrativa, encontros, mapas e fichas prontas, pensado para ser jogado em uma sessão — uma boa porta de entrada para quem está começando a mestrar.',
  },
  FAQ_ENVIO,
];
