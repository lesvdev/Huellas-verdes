import React, { useState } from 'react';
import { EspecieFotografia } from '../types';
import { CasdShield } from './CasdShield';
import { Download, Eye, Printer, CheckCircle, HelpCircle, Loader2, Leaf } from 'lucide-react';
import { downloadA5FramedImage } from '../utils/frameGenerator';

interface FramedPhotoCardProps {
  especie: EspecieFotografia;
  onSelect?: (especie: EspecieFotografia) => void;
  showActions?: boolean;
  compact?: boolean;
  showInfoOverlay?: boolean;
}

export const FramedPhotoCard: React.FC<FramedPhotoCardProps> = ({
  especie,
  onSelect,
  showActions = true,
  compact = false,
  showInfoOverlay = false,
}) => {
  const [downloading, setDownloading] = useState(false);
  const isVertical = especie.orientacion === 'vertical';

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      await downloadA5FramedImage(especie);
    } catch (err) {
      console.error('Error al generar imagen A5:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(especie);
      setTimeout(() => window.print(), 300);
    }
  };

  return (
    <div
      id={`specimen-card-${especie.id}`}
      onClick={() => onSelect && onSelect(especie)}
      className={`group relative overflow-hidden rounded-xl border-4 border-[#0e6b38] ring-1 ring-[#fcf9de]/70 bg-stone-900 shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 select-none ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isVertical ? 'aspect-[1/1.414]' : 'aspect-[1.414/1]'
      } w-full flex flex-col justify-between`}
    >
      {/* Background Photograph */}
      <div className="absolute inset-0 z-0">
        <img
          src={especie.imageUrl}
          alt={especie.nombreComun}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle gradient to enhance text legibility only when overlays or badges exist */}
        <div className={`absolute inset-0 pointer-events-none ${
          showInfoOverlay 
            ? 'bg-gradient-to-t from-black/60 via-transparent to-black/20' 
            : 'bg-gradient-to-t from-black/25 via-transparent to-black/10'
        }`} />
      </div>

      {/* Floating Action Buttons on Hover */}
      {showActions && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(especie);
            }}
            title="Ver detalle de la fotografía"
            className="p-2 rounded-full bg-stone-900/80 text-white hover:bg-emerald-700 backdrop-blur-sm shadow-md transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            title="Descargar Foto con Marco A5 para imprimir"
            className="p-2 rounded-full bg-emerald-700/90 text-white hover:bg-emerald-600 backdrop-blur-sm shadow-md transition-colors"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            title="Imprimir formato A5"
            className="p-2 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 backdrop-blur-sm shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      )}

      {!showInfoOverlay ? (
        <>
          {/* Subtle Top Tags for species identification in clean mode */}
          <div className="relative z-10 p-3 flex items-start justify-between gap-2 pointer-events-none">
            <div className="bg-black/55 backdrop-blur-md border border-white/20 text-white rounded-lg px-2.5 py-1 text-xs shadow-md">
              <span className="font-extrabold text-white text-xs leading-tight flex items-center gap-1.5 drop-shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                {especie.nombreComun}
              </span>
              <span className="text-[10px] italic text-emerald-200 font-medium block">
                {especie.nombreCientifico}
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md border ${
                especie.esNativa
                  ? 'bg-emerald-950/75 text-emerald-200 border-emerald-400/40'
                  : 'bg-amber-950/75 text-amber-200 border-amber-400/40'
              }`}
            >
              {especie.esNativa ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <HelpCircle className="w-3 h-3 text-amber-400" />}
              {especie.esNativa ? 'Nativa' : 'No Nativa'}
            </span>
          </div>

          {/* Center hover invitation badge */}
          <div className="relative z-10 flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-[#0e6b38] font-extrabold text-xs shadow-lg backdrop-blur-xs">
              <Eye className="w-3.5 h-3.5 text-[#0e6b38]" />
              <span>Ver Fotografía y Ficha</span>
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Orientation Tag / Native Pill */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold shadow-md backdrop-blur-sm border ${
                especie.esNativa
                  ? 'bg-emerald-800/90 text-emerald-100 border-emerald-400/40'
                  : 'bg-amber-800/90 text-amber-100 border-amber-400/40'
              }`}
            >
              {especie.esNativa ? <CheckCircle className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
              {especie.esNativa ? 'Nativa de B/bermeja' : 'No Nativa'}
            </span>
          </div>

          {/* Content Badges strictly matching the PDF Layout */}
          <div className="relative z-10 p-3 md:p-4 flex flex-col justify-between h-full pointer-events-none">
        {isVertical ? (
          /* ================= VERTICAL LAYOUT (Page 1 PDF) ================= */
          <>
            {/* Top Right Section */}
            <div className="flex justify-end mt-7 md:mt-8">
              <div className="w-[68%] md:w-[62%] flex flex-col gap-1.5 md:gap-2">
                <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9px] md:text-[11px] shadow-sm leading-tight">
                  <span className="font-bold drop-shadow-xs">Origen: </span>
                  <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.origen}</span>
                </div>

                <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9px] md:text-[11px] shadow-sm leading-tight">
                  <span className="font-bold drop-shadow-xs">Habitat: </span>
                  <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.habitat}</span>
                </div>

                <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9px] md:text-[11px] shadow-sm leading-tight">
                  <span className="font-bold text-[8.5px] md:text-[10px] drop-shadow-xs">¿Es nativa de Barrancabermeja?: </span>
                  <span className="font-bold text-amber-300 drop-shadow-xs">{especie.esNativa ? 'Sí' : 'No'}</span>
                </div>

                <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9px] md:text-[11px] shadow-sm leading-tight">
                  <span className="font-bold drop-shadow-xs">Importancia Ecologica: </span>
                  <span className="font-medium text-stone-100 line-clamp-2 drop-shadow-xs">{especie.importanciaEcologica}</span>
                </div>

                {/* Characteristics Box on Bottom Right */}
                {!compact && (
                  <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg p-2 md:p-2.5 text-[9px] md:text-[11px] shadow-sm mt-1">
                    <p className="font-bold mb-0.5 text-white drop-shadow-xs">Características:</p>
                    <p className="text-stone-100 leading-snug line-clamp-3 md:line-clamp-4 font-normal drop-shadow-xs">
                      {especie.caracteristicas}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Left Badges (above banner) */}
            <div className="w-[62%] md:w-[58%] flex flex-col gap-1.5 md:gap-2 mb-2">
              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[10px] md:text-xs shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Nombre Común: </span>
                <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.nombreComun}</span>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9.5px] md:text-[11px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Nombre Cientifico: </span>
                <span className="italic font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.nombreCientifico}</span>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9.5px] md:text-[11px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Especie: </span>
                <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.especie}</span>
              </div>
            </div>
          </>
        ) : (
          /* ================= HORIZONTAL LAYOUT (Page 2 PDF) ================= */
          <div className="flex justify-between items-end h-full mb-1">
            {/* Left Column (Bottom Left Badges) */}
            <div className="w-[48%] flex flex-col gap-1.5 md:gap-2 mb-1">
              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[10px] md:text-xs shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Nombre Común: </span>
                <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.nombreComun}</span>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9.5px] md:text-[11px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Nombre Cientifico: </span>
                <span className="italic font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.nombreCientifico}</span>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2.5 py-1 text-[9.5px] md:text-[11px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Especie: </span>
                <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.especie}</span>
              </div>
            </div>

            {/* Right Column (Top to Mid Right Badges + Characteristics) */}
            <div className="w-[48%] flex flex-col gap-1 md:gap-1.5">
              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2 py-0.5 md:py-1 text-[8.5px] md:text-[10px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Origen: </span>
                <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.origen}</span>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2 py-0.5 md:py-1 text-[8.5px] md:text-[10px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Habitat: </span>
                <span className="font-medium text-stone-100 line-clamp-1 drop-shadow-xs">{especie.habitat}</span>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2 py-0.5 md:py-1 text-[8px] md:text-[9.5px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">¿Es nativa de Barrancabermeja?: </span>
                <span className="font-bold text-amber-300 drop-shadow-xs">{especie.esNativa ? 'Sí' : 'No'}</span>
              </div>

              <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg px-2 py-0.5 md:py-1 text-[8.5px] md:text-[10px] shadow-sm leading-tight">
                <span className="font-bold drop-shadow-xs">Importancia Ecologica: </span>
                <span className="font-medium text-stone-100 line-clamp-1 md:line-clamp-2 drop-shadow-xs">{especie.importanciaEcologica}</span>
              </div>

              {!compact && (
                <div className="bg-emerald-950/40 backdrop-blur-md border border-white/25 text-white rounded-lg p-1.5 md:p-2 text-[8px] md:text-[9.5px] shadow-sm">
                  <p className="font-bold mb-0.5 text-white drop-shadow-xs">Características:</p>
                  <p className="text-stone-100 leading-tight line-clamp-2 md:line-clamp-3 drop-shadow-xs">
                    {especie.caracteristicas}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )}

      {/* Institutional Footer Banner (Matches PDF strictly!) */}
      <div className="relative z-20 w-full bg-[#0e6b38] border-t-2 border-[#fcf9de] text-white px-2.5 py-1.5 md:px-4 md:py-2 flex items-center justify-between shadow-lg">
        {/* CASD Shield on Left */}
        <div className="shrink-0 flex items-center">
          <CasdShield size={isVertical ? 38 : 34} />
        </div>

        {/* 3 Lines of Institutional Text */}
        <div className="grow text-center px-1.5 leading-tight">
          <p className="font-extrabold text-[9.5px] sm:text-[11px] md:text-[12.5px] tracking-wide text-white drop-shadow-xs">
            Proyecto Álbum Digital Huellas Verdes de Barrancabermeja
          </p>
          <p className="font-semibold text-[8px] sm:text-[9.5px] md:text-[11px] text-[#fcf9de]">
            Especialidad de Análisis Químico
          </p>
          <p className="font-normal text-[7px] sm:text-[8px] md:text-[9.5px] text-emerald-100 opacity-95">
            En alianzas de las Instituciones Educativas CASD JPP - BDP
          </p>
        </div>

        {/* Subtle balance spacer matching shield width */}
        <div className="shrink-0 w-[38px] hidden md:block" />
      </div>
    </div>
  );
};
