import React, { useState } from 'react';
import { CasdShield } from './CasdShield';
import { 
  Images, 
  UploadCloud, 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Menu, 
  X, 
  Sparkles 
} from 'lucide-react';

export type TabType = 'galeria' | 'subir' | 'admin' | 'autores';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenIndex: () => void;
  totalFotos: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenIndex,
  totalFotos,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'galeria' as TabType, label: 'Álbum Digital', icon: Images },
    { id: 'subir' as TabType, label: 'Subir Foto A5', icon: UploadCloud },
    { id: 'admin' as TabType, label: 'Administrador', icon: ShieldCheck },
    { id: 'autores' as TabType, label: 'Autores y Docentes', icon: Users },
  ];

  const handleNav = (tab: TabType) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top institutional strip */}
      <div className="bg-[#0e6b38] text-[#fcf9de] px-4 py-1 text-[11px] font-bold tracking-wide flex items-center justify-between border-b border-[#0b542c]">
        <div className="flex items-center gap-2 truncate">
          <span className="hidden sm:inline">INSTITUCIÓN EDUCATIVA CASD JOSÉ PRUDENCIO PADILLA • BDP</span>
          <span className="sm:hidden">I.E. CASD JPP • BDP</span>
          <span>•</span>
          <span className="text-emerald-200 font-semibold truncate">Especialidad de Análisis Químico</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-emerald-100 font-medium shrink-0">
          <span>Barrancabermeja, Santander</span>
          <span>•</span>
          <span>Conservación del Magdalena Medio</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => handleNav('galeria')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <CasdShield size={46} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-stone-900 text-base sm:text-lg tracking-tight group-hover:text-[#0e6b38] transition-colors">
                Huellas Verdes
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-semibold leading-none mt-1">
              Barrancabermeja - Esp. Análisis Químico
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0e6b38] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Index Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Index Trigger */}
          <button
            type="button"
            onClick={onOpenIndex}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 text-xs font-extrabold transition-all shadow-xs cursor-pointer"
            title="Abrir directorio e índice de fotografías"
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Índice</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[10px] font-mono">
              {totalFotos}
            </span>
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                  isActive
                    ? 'bg-[#0e6b38] text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
