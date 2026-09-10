import React, { useState, useRef, useId } from 'react';
import { EspecieFotografia, Orientacion } from '../types';
import { FramedPhotoCard } from './FramedPhotoCard';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  Check, 
  HelpCircle, 
  Download, 
  AlertCircle,
  Camera,
  Layers,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadA5FramedImage } from '../utils/frameGenerator';

interface UploadFormProps {
  onAddEspecie: (especie: EspecieFotografia) => void;
  onCancel?: () => void;
}

const EJEMPLOS_PREDEFINIDOS = [
  {
    nombreComun: 'Totumo / Jícaro',
    nombreCientifico: 'Crescentia cujete',
    especie: 'Crescentia cujete (Bignoniaceae)',
    esNativa: true,
    origen: 'América Tropical / Cuencas del Magdalena',
    habitat: 'Planicies aluviales y zonas bajas cálidas de Barrancabermeja',
    caracteristicas: 'Árbol pequeño o mediano (hasta 10 m) de ramas tortuosas. Fruto globoso de corteza leñosa muy dura que nace directamente del tronco (caulifloria).',
    importanciaEcologica: 'Especie biocultural fundamental. Sus flores son polinizadas por murciélagos nectarívoros y sus frutos sirven de refugio y alimento a roedores.',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    orientacion: 'vertical' as Orientacion,
    lugarBarrancabermeja: 'Corregimiento El Centro',
  },
  {
    nombreComun: 'Colibrí Esmeralda',
    nombreCientifico: 'Chlorostilbon gibsoni',
    especie: 'Chlorostilbon gibsoni (Trochilidae)',
    esNativa: true,
    origen: 'Valle interandino del Río Magdalena',
    habitat: 'Arbustos en flor, bordes de bosque y parques urbanos de la ciudad',
    caracteristicas: 'Ave pequeña (7-8 cm) de pico recto y corto. Plumaje verde esmeralda iridiscente resplandeciente en machos con cola ahorquillada azul oscura.',
    importanciaEcologica: 'Polinizador de alta eficiencia de especies nativas como guayacanes y ceibas, manteniendo el flujo genético de la flora local.',
    imageUrl: 'https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=1400&q=80',
    orientacion: 'horizontal' as Orientacion,
    lugarBarrancabermeja: 'Jardines del CASD JPP',
  }
];

export const UploadForm: React.FC<UploadFormProps> = ({ onAddEspecie, onCancel }) => {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State matching the 8 required fields + extras
  const [nombreComun, setNombreComun] = useState('');
  const [nombreCientifico, setNombreCientifico] = useState('');
  const [especie, setEspecie] = useState('');
  const [esNativa, setEsNativa] = useState<boolean>(true);
  const [origen, setOrigen] = useState('');
  const [habitat, setHabitat] = useState('');
  const [caracteristicas, setCaracteristicas] = useState('');
  const [importanciaEcologica, setImportanciaEcologica] = useState('');
  const [orientacion, setOrientacion] = useState<Orientacion>('vertical');
  const [autorFoto, setAutorFoto] = useState('');
  const [lugarBarrancabermeja, setLugarBarrancabermeja] = useState('');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1200&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live preview specimen object
  const previewSpecimen: EspecieFotografia = {
    id: 'preview-temp',
    nombreComun: nombreComun.trim() || 'Nombre Común de la Especie',
    nombreCientifico: nombreCientifico.trim() || 'Nombre Científico (Género y especie)',
    especie: especie.trim() || 'Familia / Taxón de la Especie',
    esNativa,
    origen: origen.trim() || 'Origen geográfico',
    habitat: habitat.trim() || 'Hábitat en Barrancabermeja',
    caracteristicas: caracteristicas.trim() || 'Descripción de las características morfológicas, follaje, floración o comportamiento...',
    importanciaEcologica: importanciaEcologica.trim() || 'Importancia biológica, rol en el ecosistema, polinización o protección de cuencas...',
    orientacion,
    imageUrl,
    autorFoto: autorFoto.trim() || 'Estudiante CASD',
    fechaRegistro: new Date().toISOString().split('T')[0],
    lugarBarrancabermeja: lugarBarrancabermeja.trim() || 'Barrancabermeja',
  };

  // Handle image upload from file or drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      setErrorMsg(null);

      // Auto detect orientation from image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width > img.height) {
          setOrientacion('horizontal');
        } else {
          setOrientacion('vertical');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const loadExample = (index: number) => {
    const ex = EJEMPLOS_PREDEFINIDOS[index];
    if (!ex) return;
    setNombreComun(ex.nombreComun);
    setNombreCientifico(ex.nombreCientifico);
    setEspecie(ex.especie);
    setEsNativa(ex.esNativa);
    setOrigen(ex.origen);
    setHabitat(ex.habitat);
    setCaracteristicas(ex.caracteristicas);
    setImportanciaEcologica(ex.importanciaEcologica);
    setOrientacion(ex.orientacion);
    setImageUrl(ex.imageUrl);
    setLugarBarrancabermeja(ex.lugarBarrancabermeja);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate 8 required fields
    if (!nombreComun.trim()) {
      setErrorMsg('Por favor ingresa el Nombre Común.');
      return;
    }
    if (!nombreCientifico.trim()) {
      setErrorMsg('Por favor ingresa el Nombre Científico.');
      return;
    }
    if (!especie.trim()) {
      setErrorMsg('Por favor ingresa la Especie o Familia taxonómica.');
      return;
    }
    if (!origen.trim()) {
      setErrorMsg('Por favor especifica el Origen.');
      return;
    }
    if (!habitat.trim()) {
      setErrorMsg('Por favor describe el Hábitat.');
      return;
    }
    if (!caracteristicas.trim()) {
      setErrorMsg('Por favor ingresa las Características.');
      return;
    }
    if (!importanciaEcologica.trim()) {
      setErrorMsg('Por favor ingresa la Importancia Ecológica.');
      return;
    }

    setIsSubmitting(true);

    const nuevoRegistro: EspecieFotografia = {
      id: `hv-${Date.now()}`,
      nombreComun: nombreComun.trim(),
      nombreCientifico: nombreCientifico.trim(),
      especie: especie.trim(),
      esNativa,
      origen: origen.trim(),
      habitat: habitat.trim(),
      caracteristicas: caracteristicas.trim(),
      importanciaEcologica: importanciaEcologica.trim(),
      orientacion,
      imageUrl,
      autorFoto: autorFoto.trim() || 'Estudiante CASD JPP',
      fechaRegistro: new Date().toISOString().split('T')[0],
      lugarBarrancabermeja: lugarBarrancabermeja.trim() || 'Barrancabermeja',
      destacada: false,
    };

    try {
      onAddEspecie(nuevoRegistro);
      setSuccessMsg('¡Fotografía y ficha técnica añadidas exitosamente al álbum con marco A5!');

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0e6b38', '#fcf9de', '#40784e', '#d4af37'],
        });
      } catch (err) {
        // Safe fail
      }

      // Reset form after short delay
      setTimeout(() => {
        setSuccessMsg(null);
        setIsSubmitting(false);
      }, 2500);
    } catch (err) {
      setErrorMsg('Error al guardar la fotografía. Inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  const handleDownloadPreview = async () => {
    try {
      await downloadA5FramedImage(previewSpecimen);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Módulo de Registro y Generación A5</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Subir Fotografía y Datos Técnicos
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Ingresa la información requerida de la especie. La aplicación compondrá automáticamente el marco institucional con la tipografía y sellos en formato A5 listo para imprimir.
          </p>
        </div>

        {/* Quick Example Loaders */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500">Cargar Ejemplo:</span>
          <button
            type="button"
            onClick={() => loadExample(0)}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            🌸 Totumo (Vertical)
          </button>
          <button
            type="button"
            onClick={() => loadExample(1)}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
          >
            🦜 Colibrí (Horizontal)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Grid: Form on Left, Live Framed Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= FORM COLUMN ================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-7 border border-stone-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-stone-800">
                1. Fotografía de la Especie (Formato A5)
              </label>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-800 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">
                    Haz clic para cargar o arrastra tu foto aquí
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Soporta imágenes JPG, PNG o WEBP tomadas en Barrancabermeja
                  </p>
                </div>
              </div>

              {/* Or paste image URL or local path */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  O ingresa la ruta local / URL de la imagen:
                </label>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Ejemplo: /fotos/cedro_amargo.jpg o https://..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-500">
                    💡 Si guardas las fotos en la carpeta del proyecto <code className="bg-stone-100 text-emerald-800 px-1 py-0.5 rounded font-mono">public/fotos/</code>, puedes escribir directamente <code className="bg-stone-100 text-stone-700 px-1 py-0.5 rounded font-mono">/fotos/nombre_archivo.jpg</code>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Orientation Selector */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="block text-sm font-bold text-stone-800">
                2. Orientación del Marco A5 (según la toma)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrientacion('vertical')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-sm font-bold transition-all cursor-pointer ${
                    orientacion === 'vertical'
                      ? 'bg-[#0e6b38] text-white border-[#0e6b38] shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <div className="w-4 h-6 border-2 border-current rounded-xs" />
                  <span>A5 Vertical (Retrato)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrientacion('horizontal')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-sm font-bold transition-all cursor-pointer ${
                    orientacion === 'horizontal'
                      ? 'bg-[#0e6b38] text-white border-[#0e6b38] shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <div className="w-6 h-4 border-2 border-current rounded-xs" />
                  <span>A5 Horizontal (Paisaje)</span>
                </button>
              </div>
            </div>

            {/* 3. The 8 Required Fields */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                3. Información de la Especie (8 Campos Requeridos)
              </h3>

              {/* Nombre Común & Nombre Científico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre Común <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreComun}
                    onChange={(e) => setNombreComun(e.target.value)}
                    placeholder="Ej: Guayacán Rosado"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre Científico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreCientifico}
                    onChange={(e) => setNombreCientifico(e.target.value)}
                    placeholder="Ej: Handroanthus roseus"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm italic focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Especie & ¿Es nativa de Barrancabermeja? */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Especie / Taxonomía <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value)}
                    placeholder="Ej: Handroanthus roseus (Bignoniaceae)"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ¿Es nativa de Barrancabermeja? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEsNativa(true)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        esNativa
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>SÍ (Nativa)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEsNativa(false)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        !esNativa
                          ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>NO (Introducida)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Origen & Hábitat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Origen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    placeholder="Ej: Neotrópico / Valle del Magdalena Medio"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Hábitat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={habitat}
                    onChange={(e) => setHabitat(e.target.value)}
                    placeholder="Ej: Humedales y riberas de Barrancabermeja"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Características (Textarea) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Características Morfológicas / Follaje / Aspecto <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={caracteristicas}
                  onChange={(e) => setCaracteristicas(e.target.value)}
                  placeholder="Ej: Árbol de hasta 25 m de copa redondeada. Floración rosa-lila exuberante previa a la caída de hojas..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-y"
                />
              </div>

              {/* Importancia Ecológica (Textarea) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Importancia Ecológica <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={importanciaEcologica}
                  onChange={(e) => setImportanciaEcologica(e.target.value)}
                  placeholder="Ej: Protección de cuencas hídricas, fijación de nitrógeno y polinización por abejas nativas..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-y"
                />
              </div>

              {/* Autor y Lugar (Opcionales para enriquecer catálogo) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Estudiante / Fotógrafo (Autor)
                  </label>
                  <input
                    type="text"
                    value={autorFoto}
                    onChange={(e) => setAutorFoto(e.target.value)}
                    placeholder="Ej: Estudiante 11° Química CASD"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">
                    Lugar específico en Barrancabermeja
                  </label>
                  <input
                    type="text"
                    value={lugarBarrancabermeja}
                    onChange={(e) => setLugarBarrancabermeja(e.target.value)}
                    placeholder="Ej: Ciénaga San Silvestre / Parque de la Vida"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Submit & Cancel Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-100 transition-colors"
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#0e6b38] hover:bg-[#0b542c] text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Guardando en Álbum...' : 'Guardar y Publicar en Álbum'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ================= LIVE PREVIEW COLUMN ================= */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Previsualización en Vivo del Marco A5
              </span>
              <button
                type="button"
                onClick={handleDownloadPreview}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline underline-offset-2"
                title="Descargar esta previsualización"
              >
                <Download className="w-3 h-3" />
                <span>Descargar PNG A5</span>
              </button>
            </div>

            {/* The Framed Card Live Component */}
            <div className="w-full max-w-sm mx-auto shadow-2xl rounded-2xl overflow-hidden border border-stone-300 bg-stone-900">
              <FramedPhotoCard especie={previewSpecimen} showActions={false} />
            </div>

            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-center leading-relaxed">
              💡 <strong>Composición Automática:</strong> A medida que escribes, la lámina A5 integra los datos en las píldoras translúcidas verde oliva y el banner institucional inferior con el escudo del CASD JPP.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
