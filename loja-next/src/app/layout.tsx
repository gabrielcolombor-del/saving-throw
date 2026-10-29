import type { Metadata, Viewport } from 'next';
import { preconnect, preload } from 'react-dom';
import './globals.css';
import { DEFAULT_OG_IMAGE, OG_SIZE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site';

/*
 * Layout raiz: só o que é comum à loja e ao admin (html, CSS global, metadata padrão).
 * Header/Footer da loja ficam em app/(loja)/layout.tsx; o painel tem o próprio em app/(admin).
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'miniaturas de RPG',
    'miniaturas em resina',
    'miniatura personalizada RPG',
    'escudo do mestre',
    'acessórios de RPG',
    'one shot RPG',
    'kit de aventura RPG',
    'RPG de mesa',
    'Dungeons & Dragons',
    'Saving Throw',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: '/',
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${SITE_NAME} — ${SITE_TAGLINE}`, ...OG_SIZE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Abre a conexão com o CDN dos ícones antes do CSS ser descoberto (ganha uma ida e volta).
  preconnect('https://cdnjs.cloudflare.com', { crossOrigin: 'anonymous' });
  // Fontes do texto e dos títulos: baixam junto com o HTML, então a troca (font-display: swap)
  // acontece antes da primeira pintura e o layout não "pula" (CLS).
  preload('/assets/Alsina.TTF', { as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' });
  preload('/assets/ShindlerFont.ttf', { as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' });
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="font-sans antialiased bg-black text-white selection:bg-[#EBE3CB] selection:text-black min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
