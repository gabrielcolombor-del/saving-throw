"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function MiniaturasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  
  const [searchValue, setSearchValue] = useState(initialSearch);

  const updateFilters = useCallback((cat: string, search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }

    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    params.set('page', '1'); // reset to page 1 on filter change
    
    router.push(`/miniaturas?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleCategory = (cat: string) => {
    updateFilters(cat, searchValue);
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== (searchParams.get('search') || '')) {
         updateFilters(currentCategory, searchValue);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue, currentCategory, searchParams, updateFilters]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button onClick={() => handleCategory('')} className={`px-4 py-2 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors ${currentCategory === '' ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}>Todos</button>
            <button onClick={() => handleCategory('npcs')} className={`px-4 py-2 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors ${currentCategory === 'npcs' ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}>NPCs</button>
            <button onClick={() => handleCategory('monstros')} className={`px-4 py-2 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors ${currentCategory === 'monstros' ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}>Monstros</button>
            <button onClick={() => handleCategory('cenario')} className={`px-4 py-2 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors ${currentCategory === 'cenario' ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'}`}>Cenário</button>
            <button onClick={() => handleCategory('pacotes')} className={`px-4 py-2 text-xs font-bold uppercase rounded flex-shrink-0 transition-colors ${currentCategory === 'pacotes' ? 'bg-black text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-amber-700'}`}>
                <i className="fa-solid fa-box-open mr-1"></i> Pacotes
            </button>
        </div>
        
        <div className="relative w-full md:w-64">
            <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar miniatura..." 
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded focus:border-amber-600 focus:outline-none text-sm transition-colors"
            />
            <i className="fa-solid fa-search absolute left-3 top-2.5 text-zinc-400"></i>
        </div>
    </div>
  );
}
