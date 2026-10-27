import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getProductByIdUncached, listProductsUncached } from '@/lib/products';

const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!pool && !id) {
    return NextResponse.json({ error: 'Banco de dados não conectado.', products: [], total: 0 }, { status: 500 });
  }

  try {
    if (id) {
      const product = await getProductByIdUncached(id);
      if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
      return NextResponse.json({ product }, { headers: CACHE_HEADERS });
    }

    const result = await listProductsUncached({
      type: searchParams.get('type'),
      category: searchParams.get('category'),
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '8', 10),
    });
    return NextResponse.json(result, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro interno no banco de dados' }, { status: 500 });
  }
}
