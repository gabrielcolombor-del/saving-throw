import { pool } from '@/lib/db';
import { SITE_URL } from '@/lib/site';

/* Porta de api/integrations/mercadolivre/_ml-service.js usando fetch/FormData nativos (sem axios/form-data). */

export type MLImage = { buffer: Buffer; filename?: string; contentType?: string };

/** Imagem de perguntas frequentes (quebra, escala, pintura, prazo) que vai como última foto de todo anúncio. */
export const ML_FAQ_PICTURE_URL = `${SITE_URL}/marketplace/faq-objecoes.jpg`;
const ML_MAX_PICTURES = 12;

export type MLProductData = {
  name: string;
  price?: string | number | null;
  priceUnpainted?: string | number | null;
  price_unpainted?: string | number | null;
  type?: string;
  description?: string | null;
  category?: string | null;
};

export async function getMLToken(): Promise<string | null> {
  if (!pool) return null;
  const { rows } = await pool.query("SELECT * FROM st_integrations WHERE platform = 'mercadolivre'");
  if (rows.length === 0) return null;

  const ml = rows[0];
  if (new Date() < new Date(ml.expires_at)) return ml.access_token;

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.ML_APP_ID || '',
        client_secret: process.env.ML_CLIENT_SECRET || '',
        refresh_token: ml.refresh_token,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Erro ao dar refresh no token ML:', data);
      return null;
    }
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    await pool.query(
      `UPDATE st_integrations
          SET access_token = $1, refresh_token = $2, expires_at = $3, updated_at = CURRENT_TIMESTAMP
        WHERE platform = 'mercadolivre'`,
      [data.access_token, data.refresh_token, expiresAt],
    );
    return data.access_token;
  } catch (e) {
    console.error('Erro na requisição de refresh do ML:', e);
    return null;
  }
}

/**
 * Abaixo deste preço o anúncio não dá lucro no Mercado Livre (comissão + frete): a sincronização
 * pausa esses anúncios e não publica peças novas abaixo dele.
 */
export const ML_MIN_PRICE = 49.9;

/** Pausa ou reativa um anúncio (pausar é reversível; encerrar no ML seria definitivo). */
export async function setMLListingStatus(externalId: string, status: 'paused' | 'active') {
  const token = await getMLToken();
  if (!token) throw new Error('Mercado Livre não está conectado ou token expirou.');
  const res = await fetch(`https://api.mercadolibre.com/items/${encodeURIComponent(externalId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
}

/**
 * Título do anúncio no ML. Sem "D&D" (marca registrada da Wizards): a compatibilidade fica só na descrição.
 */
export function mlTitleFor(productData: MLProductData): string {
  return (
    productData.type === 'arsenal' ? `${productData.name} RPG de Mesa` : `Miniatura ${productData.name} RPG Resina 32mm`
  ).substring(0, 60);
}

/** Preço anunciado no ML: miniatura vai pelo preço sem pintura; o resto, pelo preço cheio. */
export function mlPriceFor(productData: MLProductData): number | null {
  const priceUnpainted = productData.priceUnpainted ?? productData.price_unpainted;
  let finalPrice: string | number | null | undefined = productData.price;
  if (productData.type === 'miniatura' && priceUnpainted) finalPrice = priceUnpainted;
  const priceNum = parseFloat(String(finalPrice));
  return finalPrice && !isNaN(priceNum) ? priceNum : null;
}

/**
 * Atualiza o preço de um anúncio já publicado. Antes só existia a criação de anúncios,
 * então mudanças de preço no site nunca chegavam ao Mercado Livre.
 */
export async function updateMLPrice(externalId: string, price: number, title?: string) {
  const token = await getMLToken();
  if (!token) throw new Error('Mercado Livre não está conectado ou token expirou.');

  const current = await fetch(`https://api.mercadolibre.com/items/${encodeURIComponent(externalId)}?attributes=price,title`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => (r.ok ? r.json() : null));

  // Título separado do preço: o ML recusa trocar título de anúncio com vendas, e isso não pode travar o preço.
  let titleChanged = false;
  let titleError: string | undefined;
  if (title && typeof current?.title === 'string' && current.title.includes('D&D') && current.title !== title) {
    const r = await fetch(`https://api.mercadolibre.com/items/${encodeURIComponent(externalId)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (r.ok) titleChanged = true;
    else titleError = (await r.json().catch(() => ({})))?.message || `HTTP ${r.status}`;
  }

  if (current && Number(current.price) === price) return { changed: false, titleChanged, titleError };

  const res = await fetch(`https://api.mercadolibre.com/items/${encodeURIComponent(externalId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ price }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return { changed: true, titleChanged, titleError };
}

/** Coloca a imagem de FAQ no fim das fotos de um anúncio já publicado. */
export async function addMLFaqPicture(externalId: string) {
  const token = await getMLToken();
  if (!token) throw new Error('Mercado Livre não está conectado ou token expirou.');
  const url = `https://api.mercadolibre.com/items/${encodeURIComponent(externalId)}`;

  const item = await fetch(`${url}?attributes=pictures`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
    r.ok ? r.json() : null,
  );
  if (!Array.isArray(item?.pictures)) throw new Error('não foi possível ler as fotos do anúncio');
  if (item.pictures.length >= ML_MAX_PICTURES) throw new Error(`o anúncio já tem ${ML_MAX_PICTURES} fotos`);

  const pictures = [...item.pictures.map((p: { id: string }) => ({ id: p.id })), { source: ML_FAQ_PICTURE_URL }];
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pictures }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
}

export async function publishProductToML(productData: MLProductData, imageFiles: MLImage[]) {
  const token = await getMLToken();
  if (!token) throw new Error('Mercado Livre não está conectado ou token expirou.');

  const mlPictureIds: ({ id: string } | { source: string })[] = [];
  for (const file of imageFiles) {
    if (!file?.buffer) continue;
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.contentType || 'image/jpeg' }),
      file.filename || 'image.jpg',
    );
    try {
      const res = await fetch('https://api.mercadolibre.com/pictures/items/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.id) {
        mlPictureIds.push({ id: data.id });
      } else {
        console.error(`Erro no upload da imagem para o ML (${res.status}):`, data);
      }
    } catch (e) {
      console.error('Erro de requisição ao subir imagem no ML:', (e as Error).message);
    }
  }

  if (mlPictureIds.length === 0) throw new Error('Nenhuma imagem pôde ser enviada para o Mercado Livre.');
  if (mlPictureIds.length < ML_MAX_PICTURES) mlPictureIds.push({ source: ML_FAQ_PICTURE_URL });

  // Contas no modelo novo do ML (user_product_seller) usam family_name em vez de title
  let isUserProductSeller = true;
  try {
    const userRes = await fetch('https://api.mercadolibre.com/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      isUserProductSeller = Array.isArray(userData.tags) && userData.tags.includes('user_product_seller');
    }
  } catch (e) {
    console.warn('Não foi possível verificar tags do usuário ML, assumindo user_product_seller:', (e as Error).message);
  }

  const priceNum = mlPriceFor(productData) ?? 29.9;

  // Arsenal (ex.: Escudo do Mestre) não é miniatura: vai em Jogos de Tabuleiro e Cartas, com os campos dessa categoria.
  const isArsenal = productData.type === 'arsenal';
  const titleText = mlTitleFor(productData);

  const itemBody: Record<string, unknown> = {
    category_id: isArsenal ? 'MLB6883' : 'MLB457877',
    price: priceNum,
    currency_id: 'BRL',
    available_quantity: 10,
    buying_mode: 'buy_it_now',
    listing_type_id: 'gold_special',
    condition: 'new',
    pictures: mlPictureIds,
    shipping: { mode: 'me2', local_pick_up: false, free_shipping: priceNum >= 79.0 },
    attributes: isArsenal ? [
      { id: 'BRAND', value_name: 'Saving Throw' },
      { id: 'BOARD_GAME_NAME', value_name: productData.name.substring(0, 60) },
      { id: 'UNITS_PER_PACK', value_name: '1' },
      { id: 'EMPTY_GTIN_REASON', value_id: '17055158' },
    ] : [
      { id: 'BRAND', value_name: 'Saving Throw' },
      { id: 'MODEL', value_name: `Miniatura RPG ${productData.name}`.substring(0, 30) },
      { id: 'MANUFACTURER', value_name: 'Saving Throw' },
      { id: 'LINE', value_name: 'Miniaturas RPG' },
      { id: 'COLLECTION', value_name: productData.category || 'Miniaturas RPG' },
      { id: 'MATERIALS', value_name: 'Resina' },
      { id: 'PIECES_NUMBER', value_name: '1' },
      { id: 'IS_COLLECTIBLE', value_id: '242085' },
      { id: 'IS_SET', value_id: '242084' },
      { id: 'REQUIRES_ASSEMBLY', value_id: '242084' },
      { id: 'IS_REALISTIC_REPLICA', value_id: '242084' },
      { id: 'IS_SURPRISE', value_id: '242084' },
      { id: 'SCALE', value_name: '32mm' },
      { id: 'MIN_RECOMMENDED_AGE', value_name: '14 anos' },
      { id: 'EMPTY_GTIN_REASON', value_id: '17055158' },
    ],
    sale_terms: [{ id: 'MANUFACTURING_TIME', value_name: '3 dias' }],
  };
  if (isUserProductSeller) itemBody.family_name = titleText;
  else itemBody.title = titleText;

  const postItem = async () => {
    const res = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(itemBody),
    });
    return { res, result: await res.json() };
  };

  let { res, result } = await postItem();

  // Se falhar por causa de title/family_name, tenta o outro formato
  if (!res.ok && result?.message && (result.message.includes('family_name') || result.message.includes('title'))) {
    console.warn('Retentando com ajuste de family_name/title:', result.message);
    if (itemBody.family_name) {
      delete itemBody.family_name;
      itemBody.title = titleText;
    } else {
      delete itemBody.title;
      itemBody.family_name = titleText;
    }
    ({ res, result } = await postItem());
  }

  if (!res.ok) {
    const errorMsg =
      result?.message ||
      (Array.isArray(result?.cause) && result.cause.map((c: { message: string }) => c.message).join(', ')) ||
      JSON.stringify(result);
    throw new Error(`Erro ML: ${errorMsg}`);
  }

  const fullDescription = isArsenal ? `${productData.description || `${productData.name} - Saving Throw RPG`}\n\nFabricante: Saving Throw` : `${productData.description || `Miniatura ${productData.name} - Saving Throw RPG`}\n\n🎲 ESPECIFICAÇÕES:\n- Material: Resina de Alta Resolução (8K/12K)\n- Escala: 32mm, compatível com D&D, Pathfinder, Tormenta e outros RPGs de mesa\n- Peça curada, higienizada e pronta para mesa ou pintura.\n- Fabricante: Saving Throw\n\n🚚 DICA DE FRETE GRÁTIS NO MERCADO LIVRE:\nAdicione mais miniaturas da Saving Throw ao seu carrinho! Em compras a partir de R$ 79,00, o Mercado Livre oferece Frete Grátis ou desconto especial de envio para a sua região.`;

  try {
    await fetch(`https://api.mercadolibre.com/items/${result.id}/description`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ plain_text: fullDescription }),
    });
  } catch (e) {
    console.error('Erro ao adicionar descrição no ML:', e);
  }

  return { id: result.id as string, permalink: (result.permalink as string) || `https://produto.mercadolivre.com.br/${result.id}` };
}
