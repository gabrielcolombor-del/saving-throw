import type { Metadata } from 'next';

/*
 * Dados institucionais usados em metadata, sitemap e JSON-LD.
 * Fonte única: altere aqui e todas as páginas acompanham.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://savingthrow.com.br').replace(/\/$/, '');
export const SITE_NAME = 'Saving Throw';
export const SITE_TAGLINE = 'Miniaturas de RPG, Arsenal e Kits de Aventura';
export const SITE_DESCRIPTION =
  'Boutique de RPG de mesa: miniaturas em resina 3D com pintura artística, escudo do mestre e acessórios em MDF, kits de aventura One Shot e o Sistema Saving Throw. Envio para todo o Brasil.';
export const DEFAULT_OG_IMAGE = '/assets/imagens/banner.png';
export const LOGO_PATH = '/assets/imagens/logo quadrada.png';

export const INSTAGRAM_URL = 'https://instagram.com/savingthrowrpg';
export const WHATSAPP_URL = 'https://wa.me/5527997947604';

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
};

/**
 * Metadata de uma página pública: canonical, Open Graph e Twitter completos.
 * Necessário porque o openGraph de uma página substitui o do layout por inteiro
 * (sem este helper, siteName, locale e imagem padrão se perderiam).
 */
export function pageMetadata({ title, description, path, image, imageAlt, type = 'website', noindex }: PageMetaInput): Metadata {
  const img = encodePath(image || DEFAULT_OG_IMAGE);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: 'pt_BR',
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      images: [{ url: img, alt: imageAlt || title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [img],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

type SearchParams = { [key: string]: string | string[] | undefined } | undefined;

/**
 * Catálogos com filtros: a página 1 sem filtro é a canônica; páginas seguintes
 * apontam para si mesmas; buscas e filtros por categoria não são indexados
 * (evita centenas de URLs quase iguais no Google).
 */
export function listingMetadata(base: PageMetaInput, searchParams: SearchParams): Metadata {
  const page = Number(searchParams?.page) || 1;
  const filtered = Boolean(searchParams?.search || searchParams?.category);
  if (filtered) return pageMetadata({ ...base, noindex: true });
  if (page > 1) {
    return pageMetadata({ ...base, title: `${base.title} — Página ${page}`, path: `${base.path}?page=${page}` });
  }
  return pageMetadata(base);
}

/** Codifica só os espaços dos nomes de arquivo (ex.: "one shots.jpg"); não mexe em query strings já codificadas. */
export function encodePath(path: string): string {
  return path.replace(/ /g, '%20');
}

/** URL absoluta a partir de um caminho do site. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${encodePath(path.startsWith('/') ? path : `/${path}`)}`;
}

/** Serializa JSON-LD escapando `<` para não permitir fechar a tag <script>. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Corta um texto para caber numa meta description (~155 caracteres) sem quebrar palavra. */
export function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}
