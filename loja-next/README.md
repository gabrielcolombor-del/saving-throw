# Saving Throw — app Next.js (loja + admin)

App único que serve o site público (savingthrow.com.br) e o painel administrativo.
Publicado pela Vercel (projeto `saving-throw`, Root Directory = `loja-next`).

## Estrutura

```
src/app/
  layout.tsx            raiz: <html>, CSS global, metadata padrão de SEO
  (loja)/               site público (o grupo não aparece na URL)
    layout.tsx          Header, Footer, JSON-LD da organização, Vercel Analytics/Speed Insights
    page.tsx            home
    miniaturas/         catálogo + [categoria]/ (herois-e-npcs, monstros — ver lib/categories.ts)
    arsenal/ oneshots/ produto/[id]/
    sistema/ habilidades/ sons/ instrucoes-mesa/
    modelador/          A Forja 3D — em desenvolvimento (noindex; depende de ../3d-backend)
  (admin)/              painel (custos, produtos, clientes, integrações)
    layout.tsx          sem Header/Footer, sempre noindex
    admin/page.tsx      /admin
  api/                  rotas de API (produtos, admin, Mercado Livre, Shopee, ...)
  sitemap.ts            /sitemap.xml (páginas, categorias e produtos; regerado a cada hora)
  feed.xml/route.ts     /feed.xml — feed do Google Merchant Center (Shopping)
  robots.ts             /robots.txt (bloqueia /admin e /api)
  not-found.tsx         404
src/components/         Header, Footer, SeoContent, home/, legacy/ (páginas portadas do Vite)
src/lib/
  site.ts               URL, nome, textos e helpers de SEO (pageMetadata, listingMetadata, jsonLd)
  seo-content.ts        textos de categoria e FAQ
  categories.ts         categorias de miniaturas com página própria
  products.ts api.ts    acesso ao catálogo (Postgres, cache de 5 min)
  storage.ts            fotos de produto no Supabase Storage (bucket "produtos")
  auth.ts gm-auth.ts    login do admin e dos mestres
public/assets/          imagens, fontes, sons e PDFs do site
scripts/
  optimize-images.mjs   gera WebP e cards 1200x630 de public/assets/imagens (npm run optimize-images)
```

## SEO

- Toda página pública exporta metadata com `pageMetadata()` (title, description,
  canonical, Open Graph e Twitter). Para uma página nova, copie o padrão de `(loja)/sons/page.tsx`.
- Catálogos usam `listingMetadata()`: buscas ficam `noindex`; páginas 2+ têm canonical próprio.
- Página de produto gera JSON-LD `Product` (preço em BRL) e `BreadcrumbList`; categorias geram
  `CollectionPage`/`ItemList`.
- Fotos de produto vão para o Supabase Storage em WebP (1600px + miniatura 480px) com nome legível.
- Imagens do site: depois de adicionar uma em `public/assets/imagens`, rode `npm run optimize-images`
  e use o `.webp` gerado no código.
- Scripts de terceiros só carregam onde são usados (YouTube em Sons/Sistema, model-viewer no Modelador).
- `www.savingthrow.com.br` redireciona (301) para `savingthrow.com.br` (`next.config.ts`).

## Rodando

```bash
cp .env.example .env.local   # preencha DATABASE_URL, ADMIN_*, JWT_SECRET...
npm install
npm run dev
```

## Fora do Google, de propósito

- `/admin` (sempre `noindex`, bloqueado no robots).
- `/modelador` enquanto o servidor 3D (`../3d-backend`) não estiver hospedado. Para publicar:
  hospede o backend, configure `NEXT_PUBLIC_3D_BACKEND_URL` na Vercel, remova `noindex` da página e
  devolva a rota ao `sitemap.ts`.

## Backup das imagens migradas

As fotos antigas (base64) estão em `backup.st_products_images` no Supabase. Para restaurar um produto:

```sql
UPDATE st_products p SET image_url = b.image_url FROM backup.st_products_images b WHERE b.id = p.id AND p.id = '<id>';
```

Quando não houver mais necessidade, apague com `DROP SCHEMA backup CASCADE;` (libera ~47 MB do banco).
