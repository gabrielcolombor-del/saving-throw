import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { pool } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';
import { getMLToken, mlPriceFor, publishProductToML, updateMLPrice, type MLImage } from '@/lib/mercadolivre';
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

    // 1. Produtos ainda não sincronizados: vêm antes dos preços e param por tempo, não por quantidade.
    const { rows: products } = await pool.query(`
      SELECT p.*
      FROM st_products p
      LEFT JOIN st_product_integrations pi ON p.id = pi.product_id AND pi.platform = 'mercadolivre'
      WHERE pi.id IS NULL AND p.image_url IS NOT NULL
      ORDER BY p.created_at DESC
    `);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

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
        errors.push(`${product.name}: ${(e as Error).message}`);
      }
    }

    // 2. Preços dos anúncios já publicados, começando pelos verificados há mais tempo
    const { rows: synced } = await pool.query(`
      SELECT p.*, pi.external_id
      FROM st_products p
      JOIN st_product_integrations pi ON p.id = pi.product_id AND pi.platform = 'mercadolivre'
      WHERE pi.external_id IS NOT NULL
      ORDER BY pi.last_sync ASC NULLS FIRST
    `);
    let pricesChanged = 0;
    let pricesChecked = 0;
    const priceErrors: string[] = [];
    for (const product of synced) {
      if (!timeLeft(TOTAL_BUDGET_MS)) break;
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

    const remaining = products.length - successCount - failCount;
    let message =
      products.length === 0
        ? 'Todos os produtos já estão publicados no Mercado Livre.'
        : `Novos anúncios — sucesso: ${successCount}. Falhas: ${failCount}. Ainda na fila: ${remaining}.`;
    if (errors.length > 0) message += ` Detalhes: ${errors.join('; ')}.`;
    message += ` Preços verificados: ${pricesChecked} de ${synced.length} (${pricesChanged} alterados).`;
    if (priceErrors.length > 0) message += ` Falhas de preço: ${priceErrors.join('; ')}.`;
    return NextResponse.json({ message });
  } catch (e) {
    console.error('Erro geral na sincronização:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
