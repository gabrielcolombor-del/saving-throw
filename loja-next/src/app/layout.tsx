import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://savingthrow.com.br'),
  title: 'Saving Throw',
  description: 'Forjado de RPGista para RPGista. Miniaturas, arsenal e sistema de RPG de mesa.',
  icons: { icon: '/assets/imagens/favicon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="font-sans antialiased bg-black text-white selection:bg-[#EBE3CB] selection:text-black min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />

        {/* Scripts globais que o index.html do Vite carregava (players do YouTube e visualizador 3D) */}
        <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
