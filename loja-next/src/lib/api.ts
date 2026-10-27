import { cache } from 'react';
import { getProductById, listProducts, type Product, type ProductList } from '@/lib/products';

/*
 * Acesso a dados para os Server Components.
 * Antes, estas funções faziam fetch HTTP para a própria /api/products (via NEXT_PUBLIC_API_URL),
 * o que quebrava no build (servidor ainda não está no ar) e gerava uma ida e volta extra.
 * Agora consultam o banco direto, com cache de 5 minutos invalidado pelo admin.
 */

type Params = Record<string, string | number | undefined>;

export async function fetchProducts(params: Params): Promise<ProductList & { product?: Product | null }> {
  try {
    if (params.id) {
      const product = await getProductById(String(params.id));
      return { products: product ? [product] : [], total: product ? 1 : 0, page: 1, limit: 1, totalPages: 1, product };
    }
    return await listProducts({
      type: params.type ? String(params.type) : null,
      category: params.category ? String(params.category) : null,
      search: params.search ? String(params.search) : null,
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 8,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, page: 1, limit: 0, totalPages: 0 };
  }
}

export const fetchProductById = cache(async (id: string): Promise<Product | null> => {
  try {
    return await getProductById(id);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
});
