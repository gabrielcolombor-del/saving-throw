import type { Metadata } from 'next';

/*
 * Painel administrativo (custos, produtos, clientes, integrações).
 * Fica fora do layout da loja: sem Header/Footer, sem JSON-LD e nunca indexado.
 * As rotas /api/admin/* validam o token no servidor (lib/auth.ts).
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex-grow flex flex-col">{children}</main>;
}
