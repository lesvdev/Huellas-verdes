import React, { useState } from 'react';
import { EspecieFotografia } from '../types';
import { FramedPhotoCard } from './FramedPhotoCard';
import { downloadA5FramedImage } from '../utils/frameGenerator';
import { 
  X, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  User, 
  MapPin, 
  Info, 
  Leaf, 
  Globe, 
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Layers,
  ExternalLink
} from 'lucide-react';

interface SpecimenModalProps {
  especie: EspecieFotografia | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const SpecimenModal: React.FC<SpecimenModalProps> = ({
  especie,
  onClose,
  onNext,
  onPrev,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<'foto' | 'marco'>('foto');

  if (!especie) return null;

  const handleDownloadFramed = async () => {
    try {
      setDownloading(true);
      await downloadA5FramedImage(especie);
    } catch (err) {
      console.error('Error al generar A5:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadRawPhoto = () => {
    const link = document.createElement('a');
    link.href = especie.imageUrl;
    link.download = `Foto_${especie.nombreComun.replace(/\s+/g, '_')}_Barrancabermeja.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0e6b38] text-white border-b border-[#0b542c] shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-200">
              <Leaf className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight text-white">
                  {especie.nombreComun}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-[#0b542c] text-emerald-200 border border-emerald-600/40">
                  {especie.orientacion === 'vertical' ? 'A5 Vertical' : 'A5 Horizontal'}
                </span>
              </div>
              <p className="text-xs sm:text-sm italic text-emerald-100 font-medium mt-0.5">
                {especie.nombreCientifico}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                title="Especie anterior"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                title="Especie siguiente"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-emerald-100 hover:text-white transition-colors ml-1 sm:ml-2 cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Left Photo & Right Information */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-y-auto grow">
          
          {/* ================= LEFT COLUMN: ONLY PHOTO ================= */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center gap-3.5">
            
            {/* View Mode Toggle: Solo Foto vs Con Marco A5 */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold self-center sm:self-start">
              <button
                type="button"
                onClick={() => setViewMode('foto')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'foto'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Solo Fotografía</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('marco')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'marco'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vista Diagramada A5</span>
              </button>
            </div>

            {/* Photo Container: El marco institucional del proyecto se mantiene siempre para identidad visual */}
            <div className="w-full max-w-md mx-auto shadow-xl rounded-xl overflow-hidden">
              <FramedPhotoCard 
                especie={especie} 
                showActions={false} 
                showInfoOverlay={viewMode === 'marco'} 
              />
            </div>

            {/* Action Buttons Below Photo */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={handleDownloadRawPhoto}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-800 font-semibold text-xs hover:bg-stone-200 border border-stone-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="Descargar la foto original limpia"
              >
                <ImageIcon className="w-4 h-4 text-stone-600" />
                <span>Descargar Foto</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFramed}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e6b38] text-white font-bold text-xs hover:bg-[#0b542c] active:scale-95 transition-all shadow-xs cursor-pointer"
                title="Generar lámina A5 (300 DPI) con diseño del proyecto"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando A5...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar Marco A5 (300 DPI)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 border border-stone-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="Imprimir formato A5 para el álbum físico"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>Imprimir A5</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ALL INFORMATION ================= */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4 bg-stone-50/90 p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
            
            {/* Title & Native Status */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Información de la Fotografía
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    especie.esNativa
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {especie.esNativa ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <HelpCircle className="w-3.5 h-3.5 text-amber-700" />}
                  {especie.esNativa ? 'Nativa de Barrancabermeja' : 'No Nativa / Introducida'}
                </span>
              </div>

              <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">
                {especie.nombreComun}
              </h2>
              <p className="text-base font-semibold italic text-[#0e6b38] mt-0.5">
                {especie.nombreCientifico}
              </p>
            </div>

            {/* Information Grid */}
            <div className="divide-y divide-stone-200 text-xs sm:text-sm">
              
              {/* Especie */}
              <div className="py-2.5 flex flex-col">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Especie / Taxonomía:
                </span>
                <span className="text-stone-900 font-semibold mt-0.5">
                  {especie.especie}
                </span>
              </div>

              {/* ¿Es nativa? */}
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  ¿Es nativa de Barrancabermeja?:
                </span>
                <span className={`font-bold px-2.5 py-0.5 rounded-md text-xs ${
                  especie.esNativa 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {especie.esNativa ? 'Sí, es autóctona' : 'No, es introducida'}
                </span>
              </div>

              {/* Origen */}
              <div className="py-2.5 flex flex-col">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-stone-400" />
                  Origen:
                </span>
                <span className="text-stone-800 font-medium mt-0.5">
                  {especie.origen}
                </span>
              </div>

              {/* Habitat */}
              <div className="py-2.5 flex flex-col">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  Hábitat en Barrancabermeja:
                </span>
                <span className="text-stone-800 font-medium mt-0.5">
                  {especie.habitat}
                </span>
              </div>

              {/* Caracteristicas */}
              <div className="py-2.5 flex flex-col">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-stone-400" />
                  Características:
                </span>
                <p className="text-stone-700 text-xs sm:text-[13px] mt-1.5 leading-relaxed bg-white p-3 rounded-xl border border-stone-200/90 shadow-2xs">
                  {especie.caracteristicas}
                </p>
              </div>

              {/* Importancia Ecologica */}
              <div className="py-2.5 flex flex-col">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  Importancia Ecológica:
                </span>
                <p className="text-emerald-950 text-xs sm:text-[13px] mt-1.5 leading-relaxed bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 shadow-2xs">
                  {especie.importanciaEcologica}
                </p>
              </div>
            </div>

            {/* Author and Date Footer */}
            <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Fotógrafo: <strong className="text-stone-700">{especie.autorFoto || 'Estudiante CASD'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Fecha: {especie.fechaRegistro}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
