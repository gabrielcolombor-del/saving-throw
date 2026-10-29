import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // O código legado (páginas em components/legacy) registra listeners no useEffect sem cleanup,
  // como no Vite (que rodava sem StrictMode). Em dev, o StrictMode duplicaria esses listeners.
  reactStrictMode: false,

  turbopack: {
    // O repositório tem package-lock na raiz e aqui; este app é a raiz do build.
    root: path.join(__dirname),
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Microfone/câmera ficam bloqueados; o site não usa. (Sem COOP: quebraria o popup do login do Google.)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Um único domínio canônico: www respondia 200 com o mesmo conteúdo (conteúdo duplicado no Google).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.savingthrow.com.br' }],
        destination: 'https://savingthrow.com.br/:path*',
        permanent: true,
      },
      // Links antigos do site em Vite (Instagram, WhatsApp, Mercado Livre): /produto?id=xxx → /produto/xxx
      {
        source: '/produto',
        has: [{ type: 'query', key: 'id', value: '(?<id>.+)' }],
        destination: '/produto/:id',
        permanent: true,
      },
      { source: '/produto', destination: '/miniaturas', permanent: false },
      // O escudo fixo no código foi unificado com o cadastrado no banco (preço e página únicos).
      { source: '/produto/escudo-mestre', destination: '/produto/escudo-do-mestre-personalizado', permanent: true },
      // Antigo formato do roteador do admin
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
