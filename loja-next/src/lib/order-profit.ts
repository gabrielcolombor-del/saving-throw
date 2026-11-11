/**
 * Cálculo de custo e lucro de um pedido de miniaturas. Usado pelo painel (prévia ao vivo)
 * e pela rota de vendas (recalcula ao salvar, para o lucro gravado não depender do navegador).
 */

export type Porte = 'medio' | 'grande' | 'enorme' | 'imenso';

/** Altura padrão e quantas cabem numa impressão da Photon Mono 4 (~153 x 87 mm), pelo tamanho da base. */
export const PORTES: Record<Porte, { label: string; altura: number; porMesa: number }> = {
  medio: { label: 'Médio (base 25 mm)', altura: 35, porMesa: 10 },
  grande: { label: 'Grande (base 50 mm)', altura: 50, porMesa: 2 },
  enorme: { label: 'Enorme (base 75 mm)', altura: 70, porMesa: 1 },
  imenso: { label: 'Imenso (base 100 mm+)', altura: 120, porMesa: 1 },
};

export type OrderItem = {
  nome: string;
  porte: Porte;
  alturaMm: number;
  /** Resina por peça, com suportes (g). */
  resinaG: number;
  quantidade: number;
  precoUnit: number;
  /** Custo extra por peça: pintura, caixa especial etc. */
  extra: number;
};

export type OrderCosts = {
  resinaKg: number;
  embalagem: number;
  energiaPorImpressao: number;
  trabalhoPorImpressao: number;
  trabalhoPorPeca: number;
  /** Quantas impressões este pedido usou. */
  impressoes: number;
  /** Total de peças nessas impressões, contando outros pedidos que foram juntos. */
  pecasNasImpressoes: number;
  /** Frete pago por você (frete grátis, envio por conta da loja). */
  frete: number;
  /** Comissão do marketplace, em % da receita. */
  taxaPct: number;
  desconto: number;
};

export const DEFAULT_COSTS: Omit<OrderCosts, 'impressoes' | 'pecasNasImpressoes'> = {
  resinaKg: 150,
  embalagem: 3,
  energiaPorImpressao: 1,
  trabalhoPorImpressao: 4,
  trabalhoPorPeca: 4,
  frete: 0,
  taxaPct: 0,
  desconto: 0,
};

/** Pedidos a partir deste valor têm frete grátis por conta da loja. */
export const FRETE_GRATIS_A_PARTIR = 149;

const REF_ALTURA = 70; // Remorhaz: 70 mm...
const REF_RESINA_G = 45; // ...e 45 g com suportes (miniatura oca, parede de 2,1 mm)

/** Resina estimada (g, com suportes) pela altura: cresce com o quadrado da altura, como a superfície da peça. */
export function estimateResinG(alturaMm: number): number {
  const h = Math.max(0, Number(alturaMm) || 0);
  return Math.round(REF_RESINA_G * (h / REF_ALTURA) ** 2 * 10) / 10;
}

/** Porte sugerido pela altura da descrição do produto. */
export function porteFromAltura(alturaMm: number): Porte {
  if (alturaMm <= 40) return 'medio';
  if (alturaMm <= 60) return 'grande';
  if (alturaMm <= 100) return 'enorme';
  return 'imenso';
}

export type OrderResult = {
  pecas: number;
  receitaBruta: number;
  receita: number;
  custos: {
    resina: number;
    impressao: number;
    trabalhoPecas: number;
    extras: number;
    embalagem: number;
    frete: number;
    taxa: number;
  };
  custoTotal: number;
  lucro: number;
  margem: number;
  freteGratis: boolean;
};

const n = (v: unknown, min = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.max(min, x) : min;
};
const money = (v: number) => Math.round(v * 100) / 100;

/** Limpa os números vindos do formulário (negativos e valores inválidos viram 0). */
export function sanitizeOrder(rawItems: unknown, rawCosts: unknown): { items: OrderItem[]; costs: OrderCosts } {
  const list = Array.isArray(rawItems) ? rawItems.slice(0, 50) : [];
  const items: OrderItem[] = list.map((raw) => {
    const i = (raw ?? {}) as Record<string, unknown>;
    const porte = (Object.keys(PORTES) as Porte[]).includes(i.porte as Porte) ? (i.porte as Porte) : 'medio';
    return {
      nome: String(i.nome ?? '').trim().slice(0, 120),
      porte,
      alturaMm: n(i.alturaMm),
      resinaG: n(i.resinaG),
      quantidade: Math.max(1, Math.round(n(i.quantidade, 1))),
      precoUnit: n(i.precoUnit),
      extra: n(i.extra),
    };
  });
  const c = (rawCosts ?? {}) as Record<string, unknown>;
  const pecas = items.reduce((s, i) => s + i.quantidade, 0);
  const costs: OrderCosts = {
    resinaKg: n(c.resinaKg ?? DEFAULT_COSTS.resinaKg),
    embalagem: n(c.embalagem ?? DEFAULT_COSTS.embalagem),
    energiaPorImpressao: n(c.energiaPorImpressao ?? DEFAULT_COSTS.energiaPorImpressao),
    trabalhoPorImpressao: n(c.trabalhoPorImpressao ?? DEFAULT_COSTS.trabalhoPorImpressao),
    trabalhoPorPeca: n(c.trabalhoPorPeca ?? DEFAULT_COSTS.trabalhoPorPeca),
    impressoes: Math.max(1, Math.round(n(c.impressoes, 1))),
    // Nunca menos que as peças do próprio pedido.
    pecasNasImpressoes: Math.max(pecas, Math.round(n(c.pecasNasImpressoes))),
    frete: n(c.frete),
    taxaPct: Math.min(100, n(c.taxaPct)),
    desconto: n(c.desconto),
  };
  return { items, costs };
}

export function computeOrder(items: OrderItem[], costs: OrderCosts): OrderResult {
  const pecas = items.reduce((s, i) => s + i.quantidade, 0);
  const receitaBruta = items.reduce((s, i) => s + i.quantidade * i.precoUnit, 0);
  const receita = Math.max(0, receitaBruta - costs.desconto);

  const resina = items.reduce((s, i) => s + i.quantidade * i.resinaG, 0) * (costs.resinaKg / 1000);
  // Energia e trabalho da impressão são divididos entre todas as peças que estavam na mesa.
  const pecasNaMesa = Math.max(pecas, costs.pecasNasImpressoes, 1);
  const impressao = pecas > 0
    ? costs.impressoes * (costs.energiaPorImpressao + costs.trabalhoPorImpressao) * (pecas / pecasNaMesa)
    : 0;
  const trabalhoPecas = pecas * costs.trabalhoPorPeca;
  const extras = items.reduce((s, i) => s + i.quantidade * i.extra, 0);
  const embalagem = pecas > 0 ? costs.embalagem : 0;
  const taxa = receita * (costs.taxaPct / 100);

  const parts = {
    resina: money(resina),
    impressao: money(impressao),
    trabalhoPecas: money(trabalhoPecas),
    extras: money(extras),
    embalagem: money(embalagem),
    frete: money(costs.frete),
    taxa: money(taxa),
  };
  const custoTotal = money(Object.values(parts).reduce((s, v) => s + v, 0));
  const lucro = money(receita - custoTotal);
  return {
    pecas,
    receitaBruta: money(receitaBruta),
    receita: money(receita),
    custos: parts,
    custoTotal,
    lucro,
    margem: receita > 0 ? lucro / receita : 0,
    freteGratis: receita >= FRETE_GRATIS_A_PARTIR,
  };
}
