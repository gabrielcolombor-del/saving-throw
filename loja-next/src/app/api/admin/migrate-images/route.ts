import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { pool, ensureProductsTable } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';
import { PRODUCTS_TAG } from '@/lib/products';
import { decodeDataUrl, ensureProductBucket, storageConfigured, uploadProductImage } from '@/lib/storage';

/*
 * Migração única: tira as fotos base64 de st_products.image_url e envia ao Supabase Storage.
 *
 *   GET  /api/admin/migrate-images            → quantos produtos ainda têm base64
 *   POST /api/admin/migrate-images?limit=5    → migra até N produtos por chamada (repita até remaining = 0)
 *
 * Antes de alterar cada produto, o image_url original vai para backup.st_products_images
 * (schema fora da API pública do Supabase). Para desfazer um produto:
 *   UPDATE st_products p SET image_url = b.image_url FROM backup.st_products_images b WHERE b.id = p.id AND p.id = '<id>';
 * Depois que tudo estiver estável, esta rota e o schema backup podem ser removidos.
 */

export const maxDuration = 300;

const PENDING = `image_url LIKE '%data:image%'`;

async function guard(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!pool) return NextResponse.json({ error: 'Banco de dados não conectado.' }, { status: 500 });
  if (!storageConfigured()) {
    return NextResponse.json({ error: 'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
  }
  await ensureProductsTable();
  return null;
}

async function remaining(): Promise<number> {
  const { rows } = await pool!.query(`SELECT count(*)::int AS n FROM st_products WHERE ${PENDING}`);
  return rows[0].n;
}

export async function GET(request: Request) {
  const blocked = await guard(request);
  if (blocked) return blocked;
  return NextResponse.json({ remaining: await remaining() });
}

export async function POST(request: Request) {
  const blocked = await guard(request);
  if (blocked) return blocked;

  const limit = Math.min(20, Math.max(1, Number(new URL(request.url).searchParams.get('limit')) || 5));

  await pool!.query(`CREATE SCHEMA IF NOT EXISTS backup`);
  await pool!.query(
    `CREATE TABLE IF NOT EXISTS backup.st_products_images (id TEXT PRIMARY KEY, image_url TEXT, saved_at TIMESTAMPTZ DEFAULT now())`,
  );
  await ensureProductBucket();

  const { rows } = await pool!.query(`SELECT id, image_url FROM st_products WHERE ${PENDING} ORDER BY id LIMIT $1`, [limit]);
  const migrated: { id: string; images: number }[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const row of rows as { id: string; image_url: string }[]) {
    try {
      // Guarda o original uma única vez (uma segunda execução não sobrescreve o backup).
      await pool!.query(
        `INSERT INTO backup.st_products_images (id, image_url) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [row.id, row.image_url],
      );

      let list: string[];
      try {
        list = row.image_url.startsWith('[') ? JSON.parse(row.image_url) : [row.image_url];
      } catch {
        list = [row.image_url];
      }

      const urls: string[] = [];
      for (const [i, img] of list.entries()) {
        const buffer = typeof img === 'string' ? decodeDataUrl(img) : null;
        if (buffer) urls.push(await uploadProductImage(row.id, i, buffer));
        else if (typeof img === 'string' && img && !img.includes('/api/product-image')) urls.push(img);
      }
      if (urls.length === 0) throw new Error('nenhuma imagem válida');

      await pool!.query(`UPDATE st_products SET image_url = $1 WHERE id = $2`, [JSON.stringify(urls), row.id]);
      migrated.push({ id: row.id, images: urls.length });
    } catch (e) {
      failed.push({ id: row.id, error: (e as Error).message });
    }
  }

  if (migrated.length > 0) revalidateTag(PRODUCTS_TAG, { expire: 0 });
  return NextResponse.json({ migrated, failed, remaining: await remaining() });
}
