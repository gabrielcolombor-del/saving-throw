import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
      <h1 className="text-4xl font-title text-amber-500 mb-4">Página em Construção</h1>
      <p className="text-zinc-500 mb-6">Esta página não foi encontrada.</p>
      <Link
        href="/"
        className="bg-[#EBE3CB] text-black px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}
