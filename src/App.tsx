import React, { useState, useEffect } from 'react';
import { EspecieFotografia } from './types';
import { storageService } from './services/storageService';
import { Header, TabType } from './components/Header';
import { GalleryView } from './components/GalleryView';
import { UploadForm } from './components/UploadForm';
import { AdminPanel } from './components/AdminPanel';
import { AuthorsSection } from './components/AuthorsSection';
import { SpecimenModal } from './components/SpecimenModal';
import { QuickIndexModal } from './components/QuickIndexModal';
import { CasdShield } from './components/CasdShield';
import { Heart, Sparkles, MapPin, Leaf, Shield, FileSpreadsheet, Cloud } from 'lucide-react';

export default function App() {
  const [especies, setEspecies] = useState<EspecieFotografia[]>(() => storageService.getLocalEspecies());
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabType>('galeria');
  const [selectedEspecie, setSelectedEspecie] = useState<EspecieFotografia | null>(null);
  const [isIndexOpen, setIsIndexOpen] = useState(false);

  // Subscribe to real-time Cloud Firestore updates
  useEffect(() => {
    const unsubscribe = storageService.subscribeEspecies((remotas) => {
      setEspecies(remotas);
      setIsSyncing(false);
    });
    return () => unsubscribe();
  }, []);

  // Handler: Add new species from upload form
  const handleAddEspecie = async (nueva: EspecieFotografia) => {
    // Optimistic local update
    setEspecies((prev) => [nueva, ...prev.filter((e) => e.id !== nueva.id)]);
    setCurrentTab('galeria');
    setSelectedEspecie(nueva);
    // Persist to Firestore Cloud
    await storageService.guardarEspecie(nueva);
  };

  // Handler: Update species from admin panel
  const handleUpdateEspecie = async (actualizada: EspecieFotografia) => {
    // Optimistic local update
    setEspecies((prev) => prev.map((e) => (e.id === actualizada.id ? actualizada : e)));
    if (selectedEspecie && selectedEspecie.id === actualizada.id) {
      setSelectedEspecie(actualizada);
    }
    // Persist to Firestore Cloud
    await storageService.guardarEspecie(actualizada);
  };

  // Handler: Delete species from admin panel
  const handleDeleteEspecie = async (id: string) => {
    // Optimistic local update
    setEspecies((prev) => prev.filter((e) => e.id !== id));
    if (selectedEspecie && selectedEspecie.id === id) {
      setSelectedEspecie(null);
    }
    // Persist to Firestore Cloud
    await storageService.eliminarEspecie(id);
  };

  // Handler: Reset to default CASD dataset in Cloud
  const handleResetPredeterminados = async () => {
    const restablecidas = await storageService.restablecerPredeterminados();
    setEspecies(restablecidas);
  };

  // Modal Specimen Navigation
  const handleNextSpecimen = () => {
    if (!selectedEspecie) return;
    const currentIndex = especies.findIndex((e) => e.id === selectedEspecie.id);
    if (currentIndex >= 0 && currentIndex < especies.length - 1) {
      setSelectedEspecie(especies[currentIndex + 1]);
    } else {
      setSelectedEspecie(especies[0]);
    }
  };

  const handlePrevSpecimen = () => {
    if (!selectedEspecie) return;
    const currentIndex = especies.findIndex((e) => e.id === selectedEspecie.id);
    if (currentIndex > 0) {
      setSelectedEspecie(especies[currentIndex - 1]);
    } else {
      setSelectedEspecie(especies[especies.length - 1]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] text-stone-800 font-sans">
      {/* Top Navbar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenIndex={() => setIsIndexOpen(true)}
        totalFotos={especies.length}
      />

      {/* Main Tab Content */}
      <main className="grow">
        {currentTab === 'galeria' && (
          <GalleryView
            especies={especies}
            onSelectEspecie={setSelectedEspecie}
            onOpenUpload={() => setCurrentTab('subir')}
            onOpenIndex={() => setIsIndexOpen(true)}
            isSyncing={isSyncing}
          />
        )}

        {currentTab === 'subir' && (
          <UploadForm
            onAddEspecie={handleAddEspecie}
            onCancel={() => setCurrentTab('galeria')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            especies={especies}
            onUpdateEspecie={handleUpdateEspecie}
            onDeleteEspecie={handleDeleteEspecie}
            onResetPredeterminados={handleResetPredeterminados}
            onOpenUpload={() => setCurrentTab('subir')}
            onSelectEspecie={setSelectedEspecie}
          />
        )}

        {currentTab === 'autores' && <AuthorsSection />}
      </main>

      {/* Specimen Detail Modal with A5 Print & High-Res Download */}
      <SpecimenModal
        especie={selectedEspecie}
        onClose={() => setSelectedEspecie(null)}
        onNext={handleNextSpecimen}
        onPrev={handlePrevSpecimen}
      />

      {/* Quick Index / Table of Contents Modal */}
      <QuickIndexModal
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        especies={especies}
        onSelectEspecie={(esp) => {
          setSelectedEspecie(esp);
          setIsIndexOpen(false);
        }}
      />

      {/* Institutional Footer */}
      <footer className="mt-12 bg-stone-900 text-stone-300 border-t-4 border-[#0e6b38] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Identity & CASD Shield */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <CasdShield size={50} />
                <div>
                  <h4 className="font-extrabold text-white text-base leading-tight">
                    Proyecto Álbum Digital Huellas Verdes
                  </h4>
                  <p className="text-xs text-emerald-400 font-semibold">
                    Barrancabermeja, Santander • Colombia
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-lg">
                Iniciativa de investigación escolar de la <strong>Especialidad de Análisis Químico</strong> en alianza con las <strong>Instituciones Educativas CASD JPP - BDP</strong>. Diseñado para documentar la riqueza ecológica y promover la protección de los humedales del Magdalena Medio.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                Secciones del Álbum
              </h5>
              <ul className="text-xs space-y-1.5 text-stone-400">
                <li>
                  <button
                    onClick={() => setCurrentTab('galeria')}
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Galería de Especies
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('subir')}
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Subir Fotografía A5
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsIndexOpen(true)}
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Directorio e Índice Alfabético
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Panel Administrador
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('autores')}
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Autores y Docentes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentTab('guia')}
                    className="hover:text-emerald-300 transition-colors"
                  >
                    Guía de Despliegue Firebase / Vercel
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Institutional Data */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                Contacto Institucional
              </h5>
              <p className="text-xs text-stone-400 leading-relaxed">
                <strong>I.E. CASD José Prudencio Padilla</strong><br />
                Especialidad de Análisis Químico<br />
                Docente de Apoyo Tecnológico: Luis Suárez V.<br />
                <span className="text-emerald-400 font-mono text-[11px]">luis.suarezv@casd.edu.co</span>
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => storageService.exportarCSV(especies)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 text-emerald-200 border border-emerald-700 text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Descargar Métricas CSV</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p>
              © {new Date().getFullYear()} Proyecto Huellas Verdes de Barrancabermeja. Especialidad de Análisis Químico CASD JPP - BDP.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-stone-400">
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Cloud className="w-3.5 h-3.5" />
                <span>Base de Datos Cloud Firestore Sincronizada</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                <span>Compromiso con la conservación local</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
