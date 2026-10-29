import { createHash } from 'node:crypto';
import sharp from 'sharp';

/*
 * Imagens de produto no Supabase Storage (bucket público "produtos").
 *
 * Antes, as fotos ficavam em base64 dentro de st_products.image_url (~47 MB no banco):
 * cada listagem/página puxava megabytes do Postgres e o Google Imagens via só
 * "/api/product-image?id=...". Agora cada foto vira dois WebP otimizados com nome legível:
 *   produtos/<id>/<id>-<n>-<hash>.webp        (até 1600px, página do produto e Open Graph)
 *   produtos/<id>/<id>-<n>-<hash>-thumb.webp  (480px, cards das listagens)
 * O banco guarda só a URL pública da versão grande; a miniatura sai por convenção (thumbUrl).
 */

export const PRODUCT_BUCKET = 'produtos';

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function storageConfigured(): boolean {
  return config() !== null;
}

/** Cria o bucket público se ainda não existir (idempotente). */
export async function ensureProductBucket(): Promise<void> {
  const cfg = config();
  if (!cfg) throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados');
  const headers = { Authorization: `Bearer ${cfg.key}`, apikey: cfg.key };
  const existing = await fetch(`${cfg.url}/storage/v1/bucket/${PRODUCT_BUCKET}`, { headers });
  if (existing.ok) return;
  const res = await fetch(`${cfg.url}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: PRODUCT_BUCKET,
      name: PRODUCT_BUCKET,
      public: true,
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: ['image/webp'],
    }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`Falha ao criar bucket: ${res.status} ${await res.text()}`);
}

async function putObject(path: string, body: Buffer): Promise<void> {
  const cfg = config()!;
  const res = await fetch(`${cfg.url}/storage/v1/object/${PRODUCT_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      apikey: cfg.key,
      'Content-Type': 'image/webp',
      'Cache-Control': 'max-age=31536000',
      'x-upsert': 'true',
    },
    body: new Uint8Array(body),
  });
  if (!res.ok) throw new Error(`Falha no upload de ${path}: ${res.status} ${await res.text()}`);
}

export function publicUrl(path: string): string {
  return `${config()!.url}/storage/v1/object/public/${PRODUCT_BUCKET}/${path}`;
}

/** URL da miniatura de uma imagem do Storage; outras URLs voltam iguais. */
export function thumbUrl(url: string): string {
  return url.includes(`/storage/v1/object/public/${PRODUCT_BUCKET}/`) && url.endsWith('.webp') && !url.endsWith('-thumb.webp')
    ? url.replace(/\.webp$/, '-thumb.webp')
    : url;
}

const safeSlug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'produto';

/**
 * Otimiza e envia uma imagem de produto. O hash do conteúdo no nome deixa a URL imutável
 * (cache de 1 ano seguro) e torna o reenvio da mesma foto idempotente.
 */
export async function uploadProductImage(productId: string, index: number, input: Buffer): Promise<string> {
  const base = sharp(input, { failOn: 'none' }).rotate();
  const [full, thumb] = await Promise.all([
    base.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    base.clone().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer(),
  ]);
  const slug = safeSlug(productId);
  const hash = createHash('sha1').update(full).digest('hex').slice(0, 8);
  const path = `${slug}/${slug}-${index + 1}-${hash}`;
  await putObject(`${path}.webp`, full);
  await putObject(`${path}-thumb.webp`, thumb);
  return publicUrl(`${path}.webp`);
}

/** Converte um data URL base64 em Buffer (ou null se não for um). */
export function decodeDataUrl(value: string): Buffer | null {
  const m = value.match(/^data:image\/[\w+.-]+;base64,([\s\S]*)$/);
  return m ? Buffer.from(m[1], 'base64') : null;
}
