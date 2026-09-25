import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-parchment text-black py-12 border-t border-black/10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center">
          <Link to="/">
            <img src="/assets/imagens/logo retangular.png" alt="Saving Throw Logo" className="h-16 md:h-24 w-auto opacity-90 hover:opacity-100 transition-opacity drop-shadow-sm" />
          </Link>
        </div>
        
        <div className="flex gap-6">
          <a href="#" className="w-10 h-10 bg-black text-[#EBE3CB] rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all hover:-translate-y-1">
            <i className="fa-brands fa-instagram text-lg"></i>
          </a>
          <a href="#" className="w-10 h-10 bg-black text-[#EBE3CB] rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all hover:-translate-y-1">
            <i className="fa-brands fa-tiktok text-lg"></i>
          </a>
          <a href="https://wa.me/5527997947604" target="_blank" rel="noreferrer" className="w-10 h-10 bg-black text-[#EBE3CB] rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all hover:-translate-y-1">
            <i className="fa-brands fa-whatsapp text-lg"></i>
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-black/10 text-center flex flex-col md:flex-row justify-between text-xs font-bold uppercase tracking-wider text-parchment-dark/70">
        <p>&copy; 2026 Saving Throw. Todos os direitos reservados.</p>
        <p className="mt-2 md:mt-0">Forjado de RPGista para RPGista.</p>
      </div>
    </footer>
  );
}
