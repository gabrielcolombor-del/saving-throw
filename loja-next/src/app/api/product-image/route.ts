import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const FALLBACK = '/assets/imagens/minis.png';
const IMMUTABLE = 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400, immutable';

export async function GET(request: Request) {
  if (!pool) return new NextResponse('Banco de dados não conectado.', { status: 500 });

  const sp = new URL(request.url).searchParams;
  const id = sp.get('id');
  const thumb = sp.get('thumb') === '1';
  const index = parseInt(sp.get('index') || '0', 10) || 0;
  if (!id) return new NextResponse('ID is required', { status: 400 });

  try {
    const { rows } = await pool.query('SELECT image_url FROM st_products WHERE id = $1', [id]);
    let img: string | undefined = rows[0]?.image_url;
    if (!img) return NextResponse.redirect(new URL(FALLBACK, request.url), 302);

    if (img.startsWith('[')) {
      try {
        const parsed = JSON.parse(img);
        img = parsed[index] || parsed[0];
      } catch {}
    }

    if (img && img.startsWith('data:image')) {
      const m = img.match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
      if (m) {
        const buffer = Buffer.from(m[2], 'base64');
        try {
          const optimized = await sharp(buffer)
            .resize({ width: thumb ? 400 : 800, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();
          return new NextResponse(new Uint8Array(optimized), {
            headers: { 'Content-Type': 'image/webp', 'Cache-Control': IMMUTABLE },
          });
        } catch (err) {
          console.error('Erro no Sharp:', err);
          return new NextResponse(new Uint8Array(buffer), {
            headers: { 'Content-Type': m[1], 'Cache-Control': IMMUTABLE },
          });
        }
      }
    }

    // Caminho comum (/assets/...). Evita loop caso a imagem aponte para esta própria rota (bug do admin legado).
    if (!img || img.includes('/api/product-image')) return NextResponse.redirect(new URL(FALLBACK, request.url), 302);
    return NextResponse.redirect(new URL(img, request.url), 302);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
