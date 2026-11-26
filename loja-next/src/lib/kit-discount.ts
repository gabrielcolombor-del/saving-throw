/** Desconto de um kit sobre a soma das peças avulsas, em % inteiro (0 quando não há desconto). */
export function kitDiscountPct(p: { price?: unknown; price_original?: unknown }): number {
  const original = Number(p.price_original) || 0;
  const price = Number(p.price) || 0;
  return original > price && price > 0 ? Math.round(((original - price) / original) * 100) : 0;
}
