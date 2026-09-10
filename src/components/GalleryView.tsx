import React, { useState, useMemo } from 'react';
import { EspecieFotografia, CategoriaFiltro, Orientacion } from '../types';
import { FramedPhotoCard } from './FramedPhotoCard';
import { 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Leaf, 
  ArrowUpDown, 
  X, 
  Plus, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface GalleryViewProps {
  especies: EspecieFotografia[];
  onSelectEspecie: (especie: EspecieFotografia) => void;
  onOpenUpload: () => void;
  onOpenIndex: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  especies,
  onSelectEspecie,
  onOpenUpload,
  onOpenIndex,
}) => {
  // Search & Filter State
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<CategoriaFiltro>('todas');
  const [habitatFiltro, setHabitatFiltro] = useState<string>('todos');
  const [orientacionFiltro, setOrientacionFiltro] = useState<'todas' | Orientacion>('todas');
  const [orden, setOrden] = useState<'recientes' | 'nombre-az' | 'cientifico-az'>('recientes');

  // Distinct habitats list
  const listaHabitats = useMemo(() => {
    const set = new Set<string>();
    especies.forEach((e) => {
      if (e.habitat) {
        // First main chunk of habitat
        const h = e.habitat.split(',')[0].trim();
        set.add(h);
      }
    });
    return Array.from(set);
  }, [especies]);

  // Filtered & Sorted Especies
  const especiesFiltradas = useMemo(() => {
    return especies
      .filter((e) => {
        // Text Search
        const q = busqueda.toLowerCase().trim();
        if (q) {
          const matchTexto =
            e.nombreComun.toLowerCase().includes(q) ||
            e.nombreCientifico.toLowerCase().includes(q) ||
            e.especie.toLowerCase().includes(q) ||
            e.habitat.toLowerCase().includes(q) ||
            e.origen.toLowerCase().includes(q) ||
            e.caracteristicas.toLowerCase().includes(q) ||
            e.importanciaEcologica.toLowerCase().includes(q) ||
            (e.autorFoto && e.autorFoto.toLowerCase().includes(q));
          if (!matchTexto) return false;
        }

        // Native / Non-native filter
        if (categoria === 'nativas' && !e.esNativa) return false;
        if (categoria === 'no-nativas' && e.esNativa) return false;

        // Habitat filter
        if (habitatFiltro !== 'todos') {
          if (!e.habitat.toLowerCase().includes(habitatFiltro.toLowerCase())) {
            return false;
          }
        }

        // Orientation filter
        if (orientacionFiltro !== 'todas') {
          if (e.orientacion !== orientacionFiltro) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (orden === 'nombre-az') {
          return a.nombreComun.localeCompare(b.nombreComun);
        }
        if (orden === 'cientifico-az') {
          return a.nombreCientifico.localeCompare(b.nombreCientifico);
        }
        // default: recientes
        return b.id.localeCompare(a.id);
      });
  }, [especies, busqueda, categoria, habitatFiltro, orientacionFiltro, orden]);

  // Reset all filters
  const resetFilters = () => {
    setBusqueda('');
    setCategoria('todas');
    setHabitatFiltro('todos');
    setOrientacionFiltro('todas');
    setOrden('recientes');
  };

  const hasActiveFilters =
    busqueda !== '' ||
    categoria !== 'todas' ||
    habitatFiltro !== 'todos' ||
    orientacionFiltro !== 'todas';

  // Stats calculation
  const totalNativas = especies.filter((e) => e.esNativa).length;
  const porcentajeNativas = especies.length > 0 ? Math.round((totalNativas / especies.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in space-y-6">
      {/* Top Welcome & Environmental Context Strip */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#0e6b38] to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            <span>Álbum Digital Biocultural</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Huellas Verdes de Barrancabermeja
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Explora la galería fotográfica botánica y zoológica con marco institucional A5 de la Institución Educativa CASD JPP - BDP. Selecciona cualquier lámina para ampliarla, descargarla en 300 DPI o imprimirla.
          </p>
        </div>

        {/* Quick KPI stats in header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="block text-xl font-extrabold text-[#fcf9de]">{especies.length}</span>
            <span className="text-[10px] uppercase font-bold text-emerald-200">Fotografías</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="block text-xl font-extrabold text-emerald-300">{porcentajeNativas}%</span>
            <span className="text-[10px] uppercase font-bold text-emerald-200">Nativas B/bermeja</span>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTER CONTROLS BAR ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre común, nombre científico, especie, hábitat, características..."
            className="w-full pl-11 pr-10 py-3 bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0e6b38] focus:border-transparent transition-all shadow-xs"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills & Selects */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Native Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCategoria('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoria === 'todas'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Todas ({especies.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoria('nativas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                categoria === 'nativas'
                  ? 'bg-[#0e6b38] text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>🌿 Nativas de Barrancabermeja ({totalNativas})</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoria('no-nativas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                categoria === 'no-nativas'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>🌍 Introducidas / No Nativas ({especies.length - totalNativas})</span>
            </button>
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Habitat Select */}
            <select
              value={habitatFiltro}
              onChange={(e) => setHabitatFiltro(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Hábitats</option>
              {listaHabitats.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {/* Orientation Select */}
            <select
              value={orientacionFiltro}
              onChange={(e) => setOrientacionFiltro(e.target.value as 'todas' | Orientacion)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="todas">Formato A5: Todos</option>
              <option value="vertical">A5 Vertical (Retrato)</option>
              <option value="horizontal">A5 Horizontal (Paisaje)</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
              >
                <option value="recientes">Más recientes</option>
                <option value="nombre-az">Nombre Común (A-Z)</option>
                <option value="cientifico-az">Nombre Científico (A-Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-bold flex items-center gap-1 hover:bg-stone-100 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <p className="font-semibold">
          Mostrando <strong>{especiesFiltradas.length}</strong> de {especies.length} especímenes en el álbum digital
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenIndex}
            className="text-emerald-800 hover:text-emerald-950 font-bold underline underline-offset-2 flex items-center gap-1"
          >
            <span>Ver Índice Alfabético</span>
          </button>
        </div>
      </div>

      {/* ================= ALBUM GRID ================= */}
      {especiesFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">
            No se encontraron fotografías con esos criterios
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Intenta cambiar el texto de búsqueda o restablecer los filtros para ver todas las especies de Barrancabermeja.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 items-start">
          {especiesFiltradas.map((especie) => (
            <FramedPhotoCard
              key={especie.id}
              especie={especie}
              onSelect={onSelectEspecie}
              showActions={true}
              showInfoOverlay={false}
            />
          ))}
        </div>
      )}

      {/* Bottom Floating "Subir Foto" Call-to-action */}
      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-extrabold text-emerald-950 text-base">
            ¿Tienes una nueva fotografía de la fauna o flora de Barrancabermeja?
          </h4>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Sube tu foto y completa la ficha técnica. El sistema generará la lámina con el marco institucional A5 listo para imprimir.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenUpload}
          className="px-5 py-2.5 rounded-xl bg-[#0e6b38] hover:bg-[#0b542c] text-white text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Subir Nueva Fotografía</span>
        </button>
      </div>
    </div>
  );
};
