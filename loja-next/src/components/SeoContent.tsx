import { jsonLd } from '@/lib/site';

/*
 * Blocos de conteúdo pensados para busca orgânica: texto explicativo da categoria
 * e perguntas frequentes (com FAQPage em JSON-LD). Renderizados no servidor.
 * Os textos ficam em lib/seo-content.ts — só afirmações que o próprio site já faz.
 */

export type Faq = { q: string; a: string };

export function CategoryIntro({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <section className="bg-zinc-50 text-zinc-800 py-16 border-t border-zinc-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-title text-3xl md:text-4xl text-zinc-900 mb-6">{title}</h2>
        <div className="space-y-4 text-sm md:text-base leading-relaxed text-zinc-600">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ title = 'Perguntas Frequentes', items }: { title?: string; items: Faq[] }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section className="bg-white text-zinc-800 py-16 border-t border-zinc-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="font-title text-3xl md:text-4xl text-zinc-900 mb-8 text-center">{title}</h2>
        <div className="divide-y divide-zinc-200 border-y border-zinc-200">
          {items.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-zinc-900">
                <h3 className="text-sm md:text-base">{f.q}</h3>
                <i className="fa-solid fa-chevron-down text-amber-600 text-xs transition-transform group-open:rotate-180" aria-hidden="true"></i>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
