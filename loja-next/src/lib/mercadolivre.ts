import { pool } from '@/lib/db';

/* Porta de api/integrations/mercadolivre/_ml-service.js usando fetch/FormData nativos (sem axios/form-data). */

export type MLImage = { buffer: Buffer; filename?: string; contentType?: string };

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
export async function updateMLPrice(externalId: string, price: number) {
  const token = await getMLToken();
  if (!token) throw new Error('Mercado Livre não está conectado ou token expirou.');

  const current = await fetch(`https://api.mercadolibre.com/items/${encodeURIComponent(externalId)}?attributes=price`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => (r.ok ? r.json() : null));
  if (current && Number(current.price) === price) return { changed: false };

  const res = await fetch(`https://api.mercadolibre.com/items/${encodeURIComponent(externalId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ price }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `HTTP ${res.status}`);
  }
  return { changed: true };
}

export async function publishProductToML(productData: MLProductData, imageFiles: MLImage[]) {
  const token = await getMLToken();
  if (!token) throw new Error('Mercado Livre não está conectado ou token expirou.');

  const mlPictureIds: { id: string }[] = [];
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

  const titleText = `Miniatura ${productData.name} RPG D&D Resina`.substring(0, 60);

  const itemBody: Record<string, unknown> = {
    category_id: 'MLB457877',
    price: priceNum,
    currency_id: 'BRL',
    available_quantity: 10,
    buying_mode: 'buy_it_now',
    listing_type_id: 'gold_special',
    condition: 'new',
    pictures: mlPictureIds,
    shipping: { mode: 'me2', local_pick_up: false, free_shipping: priceNum >= 79.0 },
    attributes: [
      { id: 'BRAND', value_name: 'Saving Throw' },
      { id: 'MODEL', value_name: `Miniatura RPG ${productData.name}`.substring(0, 30) },
      { id: 'MANUFACTURER', value_name: 'Saving Throw' },
      { id: 'LINE', value_name: 'Miniaturas RPG' },
      { id: 'COLLECTION', value_name: productData.category || 'Dungeons & Dragons' },
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

  const fullDescription = `${productData.description || `Miniatura ${productData.name} - Saving Throw RPG`}\n\n🎲 ESPECIFICAÇÕES:\n- Material: Resina de Alta Resolução (8K/12K)\n- Escala: 32mm (padrão D&D / RPG de Mesa)\n- Peça curada, higienizada e pronta para mesa ou pintura.\n- Fabricante: Saving Throw\n\n🚚 DICA DE FRETE GRÁTIS NO MERCADO LIVRE:\nAdicione mais miniaturas da Saving Throw ao seu carrinho! Em compras a partir de R$ 79,00, o Mercado Livre oferece Frete Grátis ou desconto especial de envio para a sua região.`;

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
