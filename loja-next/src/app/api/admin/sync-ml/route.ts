import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { pool } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';
import {
  ML_MIN_PRICE,
  getMLToken,
  mlPriceFor,
  publishProductToML,
  setMLListingStatus,
  updateMLPrice,
  type MLImage,
} from '@/lib/mercadolivre';
import { SITE_URL } from '@/lib/site';

// Upload de imagens + criação de anúncios pode demorar
export const maxDuration = 60;

// Limites internos para responder antes dos 60s da função, deixando margem para o item em andamento.
const PUBLISH_BUDGET_MS = 40_000;
const TOTAL_BUDGET_MS = 50_000;

export async function POST(request: Request) {
  // No legado esta rota não exigia login: qualquer pessoa podia disparar anúncios no ML.
  if (!isAdminRequest(request)) return unauthorized();
  if (!pool) return NextResponse.json({ error: 'Banco de dados não conectado.' }, { status: 500 });

  try {
    // Sem token válido nada funciona: diz isso logo, em vez de uma falha por produto.
    if (!(await getMLToken())) {
      return NextResponse.json(
        {
          error:
            'Token do Mercado Livre expirado e a renovação falhou. Clique em "Conectar Mercado Livre" no painel para autorizar de novo.',
        },
        { status: 409 },
      );
    }

    const startedAt = Date.now();
    const timeLeft = (limitMs: number) => Date.now() - startedAt < limitMs;

    // O painel repete a chamada até `done`, devolvendo estes dois campos: cada etapa cabe nos 60s da função.
    const body = await request.json().catch(() => ({}));
    const skipIds: string[] = Array.isArray(body?.skipIds) ? body.skipIds.filter((id: unknown) => typeof id === 'string') : [];
    const priceOffset = Number.isInteger(body?.priceOffset) && body.priceOffset > 0 ? (body.priceOffset as number) : 0;

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];
    const failedIds: string[] = [];

    // 0. Anúncios abaixo do preço mínimo são pausados; os que voltaram a ficar acima dele são reativados.
    const listingsQuery = `
      SELECT p.*, pi.external_id, pi.sync_status
      FROM st_products p
      JOIN st_product_integrations pi ON p.id = pi.product_id AND pi.platform = 'mercadolivre'
      WHERE pi.external_id IS NOT NULL
      ORDER BY p.id`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const needsStatusChange = (l: any) => {
      if (skipIds.includes(l.id)) return false;
      const price = mlPriceFor(l);
      const cheap = price !== null && price < ML_MIN_PRICE;
      return cheap ? l.sync_status !== 'paused' : l.sync_status === 'paused';
    };
    const { rows: allListings } = await pool.query(listingsQuery);
    // Anúncios de produtos excluídos do site continuavam ativos no ML: também são pausados.
    const { rows: orphans } = await pool.query(
      `SELECT pi.product_id AS id, pi.product_id AS name, pi.external_id, pi.sync_status, true AS orphan
       FROM st_product_integrations pi
       LEFT JOIN st_products p ON p.id = pi.product_id
       WHERE pi.platform = 'mercadolivre' AND pi.external_id IS NOT NULL AND p.id IS NULL
         AND COALESCE(pi.sync_status, '') <> 'paused' AND NOT (pi.product_id = ANY($1::text[]))`,
      [skipIds],
    );
    const statusQueue = [...allListings.filter(needsStatusChange), ...orphans];
    let paused = 0;
    let activated = 0;
    for (const l of statusQueue) {
      if (!timeLeft(PUBLISH_BUDGET_MS)) break;
      const target = l.orphan || l.sync_status !== 'paused' ? 'paused' : 'active';
      try {
        await setMLListingStatus(l.external_id, target);
        await pool.query(
          `UPDATE st_product_integrations SET sync_status = $1, last_sync = CURRENT_TIMESTAMP
            WHERE product_id = $2 AND platform = 'mercadolivre'`,
          [target === 'paused' ? 'paused' : 'synced', l.id],
        );
        if (target === 'paused') paused++;
        else activated++;
      } catch (e) {
        failCount++;
        failedIds.push(l.id);
        errors.push(`${l.name} (${target === 'paused' ? 'pausar' : 'reativar'}): ${(e as Error).message}`);
      }
    }
    const statusRemaining = statusQueue.length - paused - activated - failedIds.length;

    // 1. Produtos ainda não sincronizados, só a partir do preço mínimo; os que já falharam nesta rodada não são tentados de novo.
    const { rows: unpublished } = await pool.query(
      `SELECT p.*
       FROM st_products p
       LEFT JOIN st_product_integrations pi ON p.id = pi.product_id AND pi.platform = 'mercadolivre'
       WHERE pi.id IS NULL AND p.image_url IS NOT NULL AND NOT (p.id = ANY($1::text[]))
       ORDER BY p.created_at DESC`,
      [skipIds],
    );
    const products = unpublished.filter((p) => (mlPriceFor(p) ?? 0) >= ML_MIN_PRICE);

    for (const product of products) {
      if (!timeLeft(PUBLISH_BUDGET_MS)) break;
      let urls: string[] = [];
      try {
        urls = JSON.parse(product.image_url);
      } catch {
        urls = [product.image_url];
      }

      const imageFiles: MLImage[] = [];
      for (const [i, rawUrl] of urls.entries()) {
        if (typeof rawUrl !== 'string') continue;
        // Imagens do próprio site ficam gravadas como caminho relativo (/assets/...).
        const url = rawUrl.startsWith('/') ? `${SITE_URL}${rawUrl}` : rawUrl;
        if (url.startsWith('data:image')) {
          const m = url.match(/^data:(image\/\w+);base64,(.*)$/);
          if (m) imageFiles.push({ buffer: Buffer.from(m[2], 'base64'), filename: `image${i}.jpg`, contentType: m[1] });
        } else if (/^https?:\/\//.test(url)) {
          // Imagens no Supabase Storage (ver lib/storage.ts): baixa o arquivo para reenviar ao ML.
          try {
            const res = await fetch(url);
            if (res.ok) {
              // O Storage guarda WebP; o ML recebe JPEG, formato aceito em qualquer cenário.
              const jpeg = await sharp(Buffer.from(await res.arrayBuffer())).jpeg({ quality: 90 }).toBuffer();
              imageFiles.push({ buffer: jpeg, filename: `image${i}.jpg`, contentType: 'image/jpeg' });
            }
          } catch (e) {
            console.error(`Falha ao baixar imagem ${url}:`, (e as Error).message);
          }
        }
      }

      if (imageFiles.length === 0) {
        failCount++;
        failedIds.push(product.id);
        errors.push(`${product.name}: Nenhuma imagem em formato válido encontrada.`);
        continue;
      }

      try {
        const ml = await publishProductToML(product, imageFiles);
        await pool.query(
          `INSERT INTO st_product_integrations (product_id, platform, external_id, external_url, sync_status, last_sync)
           VALUES ($1, 'mercadolivre', $2, $3, 'synced', CURRENT_TIMESTAMP)
           ON CONFLICT (product_id, platform)
           DO UPDATE SET external_id = EXCLUDED.external_id, external_url = EXCLUDED.external_url,
                         sync_status = EXCLUDED.sync_status, last_sync = CURRENT_TIMESTAMP`,
          [product.id, ml.id, ml.permalink],
        );
        successCount++;
      } catch (e) {
        console.error(`Erro ao sincronizar ${product.name}:`, e);
        failCount++;
        failedIds.push(product.id);
        errors.push(`${product.name}: ${(e as Error).message}`);
      }
    }

    const publishFails = failedIds.filter((id) => products.some((p) => p.id === id)).length;
    const remaining = products.length - successCount - publishFails;
    const queuesDone = remaining === 0 && statusRemaining === 0;

    // 2. Preços dos anúncios ativos: só com as filas vazias, para a lista não mudar enquanto o offset avança.
    const synced = queuesDone
      ? (await pool.query(listingsQuery)).rows.filter((l) => l.sync_status !== 'paused')
      : [];
    let pricesChanged = 0;
    let pricesChecked = 0;
    const priceErrors: string[] = [];
    let nextPriceOffset = priceOffset;
    while (queuesDone && nextPriceOffset < synced.length && timeLeft(TOTAL_BUDGET_MS)) {
      const product = synced[nextPriceOffset++];
      const price = mlPriceFor(product);
      if (price === null) continue;
      try {
        const r = await updateMLPrice(product.external_id, price);
        pricesChecked++;
        if (r.changed) pricesChanged++;
        await pool.query(
          `UPDATE st_product_integrations SET sync_status = 'synced', last_sync = CURRENT_TIMESTAMP
            WHERE product_id = $1 AND platform = 'mercadolivre'`,
          [product.id],
        );
      } catch (e) {
        priceErrors.push(`${product.name}: ${(e as Error).message}`);
      }
    }

    return NextResponse.json({
      done: queuesDone && nextPriceOffset >= synced.length,
      published: successCount,
      paused,
      activated,
      remaining: remaining + statusRemaining,
      failedIds,
      errors,
      pricesChecked,
      pricesChanged,
      priceErrors,
      priceOffset: nextPriceOffset,
      priceTotal: synced.length,
    });
  } catch (e) {
    console.error('Erro geral na sincronização:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
