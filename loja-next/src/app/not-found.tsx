import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: true },
};

// Fica na raiz do app (vale para qualquer URL inexistente), então traz o Header/Footer da loja por conta própria.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center min-h-[500px] text-center px-4">
        <h1 className="text-4xl font-title text-amber-500 mb-4">Página não encontrada</h1>
        <p className="text-zinc-500 mb-6">O endereço pode ter mudado ou o produto saiu do catálogo.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="bg-[#EBE3CB] text-black px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
          >
            Voltar para a Página Inicial
          </Link>
          <Link
            href="/miniaturas"
            className="border border-zinc-700 text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-900 transition-colors"
          >
            Ver Miniaturas
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
