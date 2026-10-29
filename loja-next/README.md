# Saving Throw — app Next.js (loja + admin)

App único que serve o site público (savingthrow.com.br) e o painel administrativo.
Substitui o app Vite em `../frontend` e as funções em `../api`.

## Estrutura

```
src/app/
  layout.tsx            raiz: <html>, CSS global, metadata padrão de SEO
  (loja)/               site público (o grupo não aparece na URL)
    layout.tsx          Header, Footer e JSON-LD da organização
    page.tsx            home
    miniaturas/ arsenal/ oneshots/ produto/[id]/
    sistema/ habilidades/ sons/ modelador/ instrucoes-mesa/
  (admin)/              painel (custos, produtos, clientes, integrações)
    layout.tsx          sem Header/Footer, sempre noindex
    admin/page.tsx      /admin
  api/                  rotas de API (produtos, admin, Mercado Livre, Shopee, ...)
  sitemap.ts            /sitemap.xml (páginas fixas + todos os produtos, regerado a cada hora)
  robots.ts             /robots.txt (bloqueia /admin e /api)
  not-found.tsx         404
src/components/         Header, Footer, home/, legacy/ (páginas portadas do Vite)
src/lib/
  site.ts               URL, nome, textos e helpers de SEO (pageMetadata, listingMetadata, jsonLd)
  products.ts api.ts    acesso ao catálogo (Postgres, cache de 5 min)
  auth.ts gm-auth.ts    login do admin e dos mestres
```

## SEO

- Toda página pública exporta metadata com `pageMetadata()` (title, description,
  canonical, Open Graph e Twitter). Para uma página nova, copie o padrão de `(loja)/sons/page.tsx`.
- Catálogos usam `listingMetadata()`: buscas e filtros ficam `noindex`; páginas 2+ têm canonical próprio.
- Página de produto gera JSON-LD `Product` (preço em BRL) e `BreadcrumbList`.
- Scripts de terceiros só carregam onde são usados (YouTube em Sons/Sistema, model-viewer no Modelador).
- `www.savingthrow.com.br` redireciona (301) para `savingthrow.com.br` (`next.config.ts`).

## Rodando

```bash
cp .env.example .env.local   # preencha DATABASE_URL, ADMIN_*, JWT_SECRET...
npm install
npm run dev
```

As imagens/sons ficam em `../frontend/public/assets` e são copiados para `public/` pelo
`scripts/sync-assets.mjs` (roda antes de `dev` e `build`).

## Colocar em produção (troca do Vite pelo Next)

1. Na Vercel, projeto `saving-throw` → Settings → Build: **Root Directory = `loja-next`**,
   Framework = Next.js, e remova o Output Directory `frontend/dist`.
2. Copie as variáveis de ambiente de `.env.example` para o projeto.
3. Faça o deploy de um preview, teste loja, `/admin` e login do Mercado Livre, e então promova.
4. No Google Search Console: verifique o domínio e envie `https://savingthrow.com.br/sitemap.xml`.
5. Depois de estável, apague `../frontend/src`, `../api`, `../vercel.json` e `../package.json` da raiz
   e mova `../frontend/public/assets` para `public/assets` (removendo o `sync-assets`).
