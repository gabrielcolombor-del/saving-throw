import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { INSTAGRAM_URL, LOGO_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl, jsonLd } from '@/lib/site';

/* Dados estruturados da marca: valem para todas as páginas públicas. */
const organizationLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl(LOGO_PATH),
      description: SITE_DESCRIPTION,
      sameAs: [INSTAGRAM_URL],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+55-27-99794-7604',
        availableLanguage: 'Portuguese',
        areaServed: 'BR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function LojaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd) }} />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
