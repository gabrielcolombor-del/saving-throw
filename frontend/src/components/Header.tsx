import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "text-amber-600 border-b-2 border-amber-600 pb-1 md:border-black" 
      : "hover:opacity-70";
  };

  return (
    <header className="bg-parchment text-black sticky top-0 z-50 shadow-md border-b border-black/10">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link to="/" className="flex items-center text-2xl md:text-3xl tracking-wide font-title drop-shadow-sm">
            Saving Throw
          </Link>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden text-black focus:outline-none text-2xl cursor-pointer"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
        
        <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-6 w-full md:w-auto mt-2 md:mt-0 transition-all`}>
          <nav className="flex flex-col md:flex-row items-center gap-4 font-semibold text-xs md:text-sm uppercase tracking-wide w-full md:w-auto text-center">
            <Link to="/oneshots" className={`transition-all w-full py-2 md:py-0 md:whitespace-nowrap ${isActive('/oneshots')}`}>One Shots</Link>
            <Link to="/miniaturas" className={`transition-all w-full py-2 md:py-0 md:whitespace-nowrap ${isActive('/miniaturas')}`}>Miniaturas</Link>
            <Link to="/arsenal" className={`transition-all w-full py-2 md:py-0 md:whitespace-nowrap ${isActive('/arsenal')}`}>Arsenal de RPG</Link>
            <Link to="/sistema" className={`transition-all w-full py-2 md:py-0 md:whitespace-nowrap ${isActive('/sistema')}`}>Sistema ST</Link>
            <Link to="/habilidades" className={`transition-all w-full py-2 md:py-0 md:whitespace-nowrap ${isActive('/habilidades')}`}>Habilidades & Feitiços</Link>
            <Link to="/sons" className={`transition-all w-full py-2 md:py-0 md:whitespace-nowrap ${isActive('/sons')}`}>Efeitos Sonoros</Link>
          </nav>

          <a href="https://wa.me/5527997947604" target="_blank" rel="noreferrer" className="w-full md:w-auto bg-black text-[#EBE3CB] hover:bg-zinc-800 hover:text-white transition-all px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shrink-0">
            <i className="fa-brands fa-whatsapp text-sm"></i> Fale Conosco
          </a>
        </div>
      </div>
    </header>
  );
}
