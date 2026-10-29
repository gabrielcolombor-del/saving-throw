import { NextResponse, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { pool, ensureProductsTable } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/auth';
import { publishProductToML, type MLImage } from '@/lib/mercadolivre';
import { PRODUCTS_TAG } from '@/lib/products';
import { ensureProductBucket, storageConfigured, uploadProductImage } from '@/lib/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB por imagem (igual ao legado)

function field(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === 'string' ? v : undefined;
}

function num(v: string | undefined): number | null {
  return v ? parseFloat(v) : null;
}

async function readImages(form: FormData): Promise<{ dataUrls: string[]; files: MLImage[] } | { error: string }> {
  const dataUrls: string[] = [];
  const files: MLImage[] = [];
  for (const entry of form.getAll('image')) {
    if (typeof entry === 'string' || entry.size === 0) continue;
    if (entry.size > MAX_FILE_SIZE) return { error: `Imagem "${entry.name}" passa de 10MB.` };
    const buffer = Buffer.from(await entry.arrayBuffer());
    const mime = entry.type || 'image/jpeg';
    dataUrls.push(`data:${mime};base64,${buffer.toString('base64')}`);
    files.push({ buffer, filename: entry.name || 'image.jpg', contentType: mime });
  }
  return { dataUrls, files };
}

/**
 * Guarda as imagens novas: no Supabase Storage (WebP otimizado, URL pública) quando configurado;
 * senão, como antes, em base64 no próprio banco.
 */
async function storeImages(
  productId: string,
  images: { dataUrls: string[]; files: MLImage[] },
  startIndex: number,
): Promise<string[]> {
  if (!storageConfigured() || images.files.length === 0) return images.dataUrls;
  await ensureProductBucket();
  return Promise.all(images.files.map((f, i) => uploadProductImage(productId, startIndex + i, f.buffer)));
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * O painel recebe as imagens base64 como URLs "/api/product-image?id=X&index=N" (ou &thumb=1).
 * O legado salvava essas URLs de volta no banco, apagando o base64 original e deixando a imagem
 * apontando para ela mesma. Aqui convertemos essas URLs de volta para o dado armazenado.
 */
async function resolveKeptImages(productId: string, kept: string[]): Promise<string[]> {
  if (!kept.some((u) => typeof u === 'string' && u.includes('/api/product-image'))) return kept;

  const { rows } = await pool!.query('SELECT image_url FROM st_products WHERE id = $1', [productId]);
  const raw: string | null = rows[0]?.image_url ?? null;
  let stored: string[] = [];
  if (raw) {
    if (raw.startsWith('[')) {
      try {
        stored = JSON.parse(raw);
      } catch {}
    } else {
      stored = [raw];
    }
  }

  const resolved: string[] = [];
  for (const url of kept) {
    if (typeof url !== 'string') continue;
    if (!url.includes('/api/product-image')) {
      resolved.push(url);
      continue;
    }
    const params = new URL(url, 'http://local').searchParams;
    if (params.get('id') !== productId) continue; // imagem de outro produto: descarta
    const idx = parseInt(params.get('index') || '0', 10) || 0;
    const original = stored[idx];
    if (original && !original.includes('/api/product-image')) resolved.push(original);
  }
  return Array.from(new Set(resolved));
}

async function guard(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!pool) {
    return NextResponse.json(
      { error: 'Banco de dados não conectado. Verifique DATABASE_URL no .env' },
      { status: 500 },
    );
  }
  await ensureProductsTable();
  return null;
}

export async function DELETE(request: Request) {
  const blocked = await guard(request);
  if (blocked) return blocked;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

  try {
    await pool!.query('DELETE FROM st_products WHERE id = $1', [id]);
    revalidateTag(PRODUCTS_TAG, { expire: 0 }); // mudança do admin aparece já no próximo acesso
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = await guard(request);
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await request.formData();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao processar arquivo/formulário' }, { status: 500 });
  }

  try {
    const images = await readImages(form);
    if ('error' in images) return NextResponse.json({ error: images.error }, { status: 413 });

    const type = field(form, 'type');
    const name = field(form, 'name');
    const description = field(form, 'description');
    const category = field(form, 'category');
    const price = field(form, 'price');
    const priceUnpainted = field(form, 'price_unpainted');
    const pricePainted = field(form, 'price_painted');
    const pricePaintedBox = field(form, 'price_painted_box');
    const priceOriginal = field(form, 'price_original');
    const bundleItems = field(form, 'bundle_items');

    // Gera um id legível a partir do nome, sem colidir com os existentes
    const baseSlug = slugify(name || 'produto');
    let productId = baseSlug;
    const { rows: existingRows } = await pool!.query('SELECT id FROM st_products WHERE id LIKE $1', [`${baseSlug}%`]);
    const existingIds = new Set(existingRows.map((r: { id: string }) => r.id));
    let counter = 1;
    while (existingIds.has(productId)) productId = `${baseSlug}-${counter++}`;
    const storedImages = await storeImages(productId, images, 0);

    const { rows } = await pool!.query(
      `INSERT INTO st_products (id, type, category, name, price, price_unpainted, price_painted, price_painted_box, description, image_url, bundle_items, price_original)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        productId,
        type,
        category || null,
        name,
        num(price),
        num(priceUnpainted),
        num(pricePainted),
        num(pricePaintedBox),
        description,
        JSON.stringify(storedImages),
        bundleItems || null,
        num(priceOriginal),
      ],
    );
    const created = rows[0];
    revalidateTag(PRODUCTS_TAG, { expire: 0 }); // mudança do admin aparece já no próximo acesso

    // Publica no Mercado Livre depois de responder ao admin (after() mantém a função viva até terminar)
    if (images.files.length > 0) {
      after(async () => {
        try {
          const ml = await publishProductToML(
            { name: name || '', price, priceUnpainted, type, description, category },
            images.files,
          );
          await pool!.query(
            `INSERT INTO st_product_integrations (product_id, platform, external_id, external_url, sync_status, last_sync)
             VALUES ($1, 'mercadolivre', $2, $3, 'synced', CURRENT_TIMESTAMP)
             ON CONFLICT (product_id, platform)
             DO UPDATE SET external_id = EXCLUDED.external_id, external_url = EXCLUDED.external_url,
                           sync_status = EXCLUDED.sync_status, last_sync = CURRENT_TIMESTAMP`,
            [created.id, ml.id, ml.permalink],
          );
          console.log('Produto enviado ao ML com sucesso:', ml.id);
        } catch (e) {
          console.error('Erro ao enviar produto ao ML em background:', (e as Error).message);
        }
      });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const blocked = await guard(request);
  if (blocked) return blocked;

  let form: FormData;
  try {
    form = await request.formData();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao processar formulário de edição' }, { status: 500 });
  }

  try {
    const id = field(form, 'id');
    if (!id) return NextResponse.json({ error: 'ID do produto ausente' }, { status: 400 });

    let imageUrls: string[] = [];
    const kept = field(form, 'keptImages');
    if (kept) {
      try {
        imageUrls = JSON.parse(kept);
      } catch {}
    }
    imageUrls = await resolveKeptImages(id, imageUrls);
    const images = await readImages(form);
    if ('error' in images) return NextResponse.json({ error: images.error }, { status: 413 });
    imageUrls.push(...(await storeImages(id, images, imageUrls.length)));

    const { rows } = await pool!.query(
      `UPDATE st_products
          SET category = $1, name = $2, price = $3, price_unpainted = $4, price_painted = $5, description = $6,
              image_url = $7, bundle_items = $9, price_painted_box = $10, price_original = $11
        WHERE id = $8
        RETURNING *`,
      [
        field(form, 'category') || null,
        field(form, 'name'),
        num(field(form, 'price')),
        num(field(form, 'price_unpainted')),
        num(field(form, 'price_painted')),
        field(form, 'description'),
        JSON.stringify(imageUrls),
        id,
        field(form, 'bundle_items') || null,
        num(field(form, 'price_painted_box')),
        num(field(form, 'price_original')),
      ],
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    revalidateTag(PRODUCTS_TAG, { expire: 0 }); // mudança do admin aparece já no próximo acesso
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
