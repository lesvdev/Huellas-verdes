import React, { useState, useMemo } from 'react';
import { EspecieFotografia } from '../types';
import { BookOpen, Search, X, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

interface QuickIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  especies: EspecieFotografia[];
  onSelectEspecie: (especie: EspecieFotografia) => void;
}

export const QuickIndexModal: React.FC<QuickIndexModalProps> = ({
  isOpen,
  onClose,
  especies,
  onSelectEspecie,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return especies
      .filter((e) => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        return (
          e.nombreComun.toLowerCase().includes(q) ||
          e.nombreCientifico.toLowerCase().includes(q) ||
          e.especie.toLowerCase().includes(q) ||
          e.habitat.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.nombreComun.localeCompare(b.nombreComun));
  }, [especies, query]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, EspecieFotografia[]>();
    filtered.forEach((e) => {
      const letter = e.nombreComun.charAt(0).toUpperCase();
      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push(e);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0e6b38] text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-800 text-[#fcf9de]">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-white">
                Índice del Álbum Digital
              </h3>
              <p className="text-xs text-emerald-100">
                Directorio alfabético de especímenes registrados ({especies.length} fotografías)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search inside Index */}
        <div className="p-4 border-b border-stone-200 bg-stone-50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en el índice por nombre común, científico o hábitat..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Index List Grouped by Letter */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-6">
          {grouped.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <p className="font-semibold text-base">No se encontraron especies en el índice</p>
              <p className="text-xs text-stone-400 mt-1">Prueba con otro término de búsqueda</p>
            </div>
          ) : (
            grouped.map(([letter, items]) => (
              <div key={letter} className="relative">
                <div className="sticky top-0 z-10 flex items-center gap-3 bg-white/95 backdrop-blur-xs py-1.5 border-b border-stone-200 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {letter}
                  </span>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {items.length} {items.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectEspecie(item);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50/50 hover:bg-emerald-50/50 text-left transition-all shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.nombreComun}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-200 shadow-xs group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-stone-900 text-sm truncate group-hover:text-emerald-800 transition-colors">
                            {item.nombreComun}
                          </p>
                          <p className="text-xs italic text-stone-500 truncate">
                            {item.nombreCientifico}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded-sm ${
                                item.esNativa
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.esNativa ? <CheckCircle2 className="w-2.5 h-2.5" /> : <HelpCircle className="w-2.5 h-2.5" />}
                              {item.esNativa ? 'Nativa' : 'Introducida'}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {item.orientacion === 'vertical' ? 'A5 Vertical' : 'A5 Horizontal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
