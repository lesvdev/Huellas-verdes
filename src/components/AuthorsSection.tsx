import React from 'react';
import { CasdShield } from './CasdShield';
import { 
  GraduationCap, 
  Users, 
  Cpu, 
  Award, 
  Leaf, 
  HeartHandshake, 
  School, 
  Mail, 
  ExternalLink,
  MapPin,
  Sparkles
} from 'lucide-react';

export const AuthorsSection: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in space-y-10">
      {/* Hero Banner with Institutional CASD Shield */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e6b38] via-[#115b32] to-[#07391d] text-white p-6 sm:p-10 shadow-xl border border-emerald-800">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="shrink-0 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <CasdShield size={96} />
          </div>

          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-600/50 text-[#fcf9de] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Institución Educativa CASD José Prudencio Padilla • BDP
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Álbum Digital Huellas Verdes de Barrancabermeja
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed">
              Especialidad de Análisis Químico • En alianzas de las Instituciones Educativas CASD JPP - BDP. Iniciativa pedagógica y científica para el inventario, preservación y divulgación biocultural de la flora y fauna de Barrancabermeja y el Magdalena Medio.
            </p>
          </div>
        </div>

        {/* Decorative background leaf patterns */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1. SECCIÓN PRINCIPAL: AUTORES DEL PROYECTO (EQUIPO INVESTIGADOR ESTUDIANTIL) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[#0e6b38] text-xs font-extrabold uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#0e6b38]" />
              <span>Investigadores Principales</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Autores del Proyecto
            </h2>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#0e6b38] border border-emerald-300 shadow-xs">
            Estudiantes • Especialidad de Análisis Químico
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start sm:items-center gap-3 shadow-xs">
          <HeartHandshake className="w-5 h-5 shrink-0 text-[#0e6b38] mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong>Semillero de Investigación:</strong> Este álbum botánico y ecológico es el resultado del trabajo de campo, fotografía, muestreo y catalogación rigurosa llevado a cabo por los estudiantes autores del proyecto de las Instituciones Educativas <strong>CASD José Prudencio Padilla</strong> y <strong>BDP</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          {[
            {
              nombre: 'Adriana carolina Rodríguez Sánchez',
              foto: 'public/Autores/Adriana carolina Rodríguez Sánchez.jpeg',              
            },
            {
              numero: '2',
              rol: 'Análisis Botánico y Taxonómico',
              descripcion: 'Clasificación de familias botánicas, nombres científicos y verificación de condición nativa.',
              genero: 'F',
            },
            {
              numero: '3',
              rol: 'Investigación Ecológica y Ecosistémica',
              descripcion: 'Identificación de servicios ecosistémicos, roles tróficos e interacciones biológicas.',
              genero: 'M',
            },
            {
              numero: '4',
              rol: 'Curaduría y Diagramación A5',
              descripcion: 'Catalogación técnica, estandarización de fichas y estructuración del álbum digital e impreso.',
              genero: 'F',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border-2 border-emerald-100 hover:border-[#0e6b38] shadow-xs hover:shadow-lg transition-all text-center flex flex-col items-center justify-between group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-2xl mb-3 shadow-inner group-hover:scale-105 transition-transform">
                {item.genero === 'M' ? '👨‍🎓' : '👩‍🎓'}
              </div>
              <div className="space-y-1.5 w-full">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0e6b38] bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-block">
                  Autor / Integrante {item.numero}
                </span>
                <h4 className="font-extrabold text-stone-900 text-sm">
                  Estudiante Investigador/a
                </h4>
                <p className="text-[11px] font-bold text-emerald-800 leading-snug">
                  {item.rol}
                </p>
                <p className="text-[11px] text-stone-500 leading-relaxed pt-1">
                  {item.descripcion}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 w-full text-[10px] text-stone-500 font-semibold flex items-center justify-center gap-1">
                <Leaf className="w-3 h-3 text-[#0e6b38]" />
                <span>CASD JPP - BDP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SEGUNDA SECCIÓN: DOCENTE DE LA ESPECIALIDAD DE ANÁLISIS QUÍMICO */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center gap-2 text-[#0e6b38] text-xs font-extrabold uppercase tracking-wider">
          <GraduationCap className="w-4 h-4 text-[#0e6b38]" />
          <span>Dirección Pedagógica y Científica</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
          Docente de la Especialidad de Análisis Químico
        </h2>

        <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-emerald-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0e6b38] to-[#12552f] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
              <Leaf className="w-8 h-8 text-[#fcf9de]" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#0e6b38] border border-emerald-200">
                  Líder del Proyecto • Dirección Científica
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  Especialidad de Análisis Químico
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900">
                Luz Mery Posada Otalora - Docente de Análisis Químico
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 font-semibold flex items-center gap-1.5">
                <School className="w-4 h-4 text-[#0e6b38]" />
                <span>luz.posada@casd.edu.co</span>
                <span>Institución Educativa CASD José Prudencio Padilla • Área de Ciencias Naturales</span>
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1 max-w-3xl">
                Orientación pedagógica y metodológica del proyecto <strong>Huellas Verdes</strong>, dirección del trabajo de campo, validación botánica y ecológica de las especies de Barrancabermeja y articulación con los estándares científicos de la especialidad de Análisis Químico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TERCERA SECCIÓN (ABAJO, SIN TANTA RELEVANCIA): DOCENTE DE APOYO TECNOLÓGICO */}
      <div className="pt-2 border-t border-stone-200">
        <div className="bg-stone-50/80 rounded-xl p-4 sm:p-5 border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-200/80 text-stone-600 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                  Apoyo Tecnológico
                </span>
                <span className="text-xs font-bold text-stone-700">
                  Docente Luis Enrique Suárez V.
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Institución Educativa CASD JPP • Asesoría técnica en desarrollo web y formato A5
              </p>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1 self-end sm:self-center">
            <Mail className="w-3.5 h-3.5 text-stone-400" />
            <span>luis.suarezv@casd.edu.co</span>
          </div>
        </div>
      </div>

      {/* Environmental Commitment & Context */}
      <div className="bg-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-200 space-y-3">
        <div className="flex items-center gap-2 text-[#0e6b38] font-bold text-xs uppercase tracking-wider">
          <MapPin className="w-4 h-4" />
          <span>Compromiso Ambiental y Territorial</span>
        </div>
        <h3 className="text-xl font-extrabold text-stone-900">
          Barrancabermeja: Tierra de Humedales, Ciénagas y Biodiversidad
        </h3>
        <p className="text-stone-700 text-sm leading-relaxed">
          El proyecto <strong>Huellas Verdes</strong> nace en el corazón de Barrancabermeja como una respuesta académica y ciudadana ante los desafíos de conservación del Magdalena Medio. A través del registro fotográfico estandarizado en formato A5, el semillero busca empoderar a la comunidad educativa para reconocer las especies nativas frente a las introducidas, valorar los servicios ecosistémicos que prestan las ciénagas (San Silvestre, Miramar, El Castillo) y fomentar una cultura de protección ecológica permanente.
        </p>
      </div>
    </div>
  );
};
