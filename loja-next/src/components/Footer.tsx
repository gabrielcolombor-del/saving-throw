import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-parchment text-black py-6 border-t border-black/10 mt-auto">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center shrink-0">
          <Link href="/">
            <img src="/assets/imagens/logo retangular.png" alt="Saving Throw Logo" className="h-10 md:h-14 w-auto opacity-90 hover:opacity-100 transition-opacity drop-shadow-sm" />
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center text-center gap-2 sm:gap-6 text-xs font-bold uppercase tracking-wider text-parchment-dark/70">
          <p>&copy; 2026 Saving Throw. Todos os direitos reservados.</p>
          <span className="hidden sm:block text-black/20">•</span>
          <p>Forjado de RPGista para RPGista.</p>
        </div>

        <div className="flex gap-4 shrink-0">
          <a href="https://instagram.com/savingthrowrpg" target="_blank" rel="noreferrer" className="w-10 h-10 bg-black text-[#EBE3CB] rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all hover:-translate-y-1">
            <i className="fa-brands fa-instagram text-lg"></i>
          </a>
          <a href="https://wa.me/5527997947604" target="_blank" rel="noreferrer" className="w-10 h-10 bg-black text-[#EBE3CB] rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all hover:-translate-y-1">
            <i className="fa-brands fa-whatsapp text-lg"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
