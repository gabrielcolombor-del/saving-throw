"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function ArsenalFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialSearch = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(initialSearch);

  const updateFilters = useCallback((search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    params.set('page', '1');
    
    router.push(`/arsenal?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== (searchParams.get('search') || '')) {
         updateFilters(searchValue);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchValue, searchParams, updateFilters]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-8 flex flex-col md:flex-row gap-4 justify-end items-center">
        <div className="relative w-full md:w-64">
            <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar no arsenal..." 
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded focus:border-amber-600 focus:outline-none text-sm transition-colors"
            />
            <i className="fa-solid fa-search absolute left-3 top-2.5 text-zinc-400"></i>
        </div>
    </div>
  );
}
