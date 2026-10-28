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
      // Antigo formato do roteador do admin
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
