import React, { useState, useMemo } from 'react';
import { EspecieFotografia, MetricasAlbum } from '../types';
import { storageService } from '../services/storageService';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff,
  Plus, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  TrendingUp, 
  Compass, 
  Check, 
  X, 
  Download,
  Database,
  Shield,
  Upload,
  Cloud,
  UploadCloud
} from 'lucide-react';

interface AdminPanelProps {
  especies: EspecieFotografia[];
  onUpdateEspecie: (especie: EspecieFotografia) => void;
  onDeleteEspecie: (id: string) => void;
  onResetPredeterminados: () => void;
  onOpenUpload: () => void;
  onSelectEspecie: (especie: EspecieFotografia) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  especies,
  onUpdateEspecie,
  onDeleteEspecie,
  onResetPredeterminados,
  onOpenUpload,
  onSelectEspecie,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Table & Filter State
  const [searchFilter, setSearchFilter] = useState('');
  const [editingEspecie, setEditingEspecie] = useState<EspecieFotografia | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Administrator view-only master credential
  const [showMasterCredential, setShowMasterCredential] = useState(false);

  const [showShieldManager, setShowShieldManager] = useState(false);
  const [currentShield, setCurrentShield] = useState<string>(() => storageService.getShieldUrl());
  const [shieldMsg, setShieldMsg] = useState<string | null>(null);

  const handleShieldFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      storageService.setShieldUrl(dataUrl);
      setCurrentShield(dataUrl);
      setShieldMsg('¡Escudo institucional actualizado con éxito!');
      setTimeout(() => setShieldMsg(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleResetShield = () => {
    storageService.setShieldUrl('/escudo-casd.png');
    setCurrentShield('/escudo-casd.png');
    setShieldMsg('Escudo restablecido al oficial institucional.');
    setTimeout(() => setShieldMsg(null), 3000);
  };

  // Metrics
  const metricas: MetricasAlbum = useMemo(() => {
    return storageService.getMetricas(especies);
  }, [especies]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = storageService.getAdminPin();
    if (passwordInput.trim() === storedPin) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Contraseña incorrecta. Acceso restringido únicamente para el administrador del proyecto.');
    }
  };

  // Filtered Table Records
  const registrosFiltrados = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return especies;
    return especies.filter(
      (e) =>
        e.nombreComun.toLowerCase().includes(q) ||
        e.nombreCientifico.toLowerCase().includes(q) ||
        e.habitat.toLowerCase().includes(q) ||
        (e.autorFoto && e.autorFoto.toLowerCase().includes(q))
    );
  }, [especies, searchFilter]);

  // Save edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEspecie) return;
    onUpdateEspecie(editingEspecie);
    setEditingEspecie(null);
  };

  // Export full catalog to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(especies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `huellas_verdes_catalogo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import catalog from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const esp of parsed) {
            onUpdateEspecie(esp);
          }
          alert(`¡${parsed.length} especies sincronizadas e importadas en la nube exitosamente!`);
        } else {
          alert('El archivo JSON no contiene una lista válida de especies.');
        }
      } catch {
        alert('Error al procesar el archivo JSON de copia de seguridad.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ================= UN-AUTHENTICATED STATE: LOGIN LOCK =================
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden text-center p-6 sm:p-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#0e6b38] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Acceso a Administración
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 mb-6">
            Módulo restringido para docentes y administradores del proyecto Huellas Verdes CASD JPP. Permite editar, eliminar registros y exportar métricas.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Ingresa la contraseña..."
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#0e6b38] hover:bg-[#0b542c] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear Panel</span>
            </button>
          </form>

          <div className="mt-6 p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-[11px] flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Módulo protegido con credencial privada de administración</span>
          </div>
        </div>
      </div>
    );
  }

  // ================= AUTHENTICATED ADMIN DASHBOARD =================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Panel de Gestión y Métricas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Administración del Álbum Digital
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Gestión de fotografías, modificación de fichas técnicas, métricas ecológicas y exportación a hoja de cálculo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Database Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0e6b38] text-xs font-bold shadow-2xs" title="Conectado a Firebase Cloud Firestore">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5" />
            <span>Nube Firestore Activa</span>
          </div>

          {/* Export to Excel / CSV */}
          <button
            type="button"
            onClick={() => storageService.exportarCSV(especies)}
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Descargar archivo CSV compatible con Microsoft Excel y Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">Hoja de Cálculo</span>
            <span>(.CSV)</span>
          </button>

          {/* Backup JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Descargar copia de seguridad en formato JSON de todas las especies"
          >
            <Download className="w-4 h-4" />
            <span>Copia JSON</span>
          </button>

          {/* Restore JSON */}
          <label
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restaurar catálogo desde archivo JSON"
          >
            <UploadCloud className="w-4 h-4 text-emerald-800" />
            <span>Restaurar</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* New Photo */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="px-3.5 py-2 rounded-xl bg-[#0e6b38] hover:bg-[#0b542c] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Foto</span>
          </button>

          {/* Manage Shield toggle */}
          <button
            type="button"
            onClick={() => setShowShieldManager(!showShieldManager)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-300 transition-colors"
            title="Gestionar Escudo Institucional CASD"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              setIsAuthenticated(false);
              setShowMasterCredential(false);
              setPasswordInput('');
            }}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-300 transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Administrator-only Master Credential Bar */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/80 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                Credencial Maestra de Acceso (Solo Administrador)
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              La contraseña no está expuesta en la interfaz pública ni puede modificarse desde la web. Solo quien tenga acceso al código fuente de programación puede cambiarla.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-stone-800/90 px-3.5 py-2 rounded-xl border border-stone-700 self-stretch md:self-auto justify-between md:justify-start">
          <span className="text-xs text-stone-400 font-medium">Contraseña:</span>
          <code className="text-sm font-mono font-extrabold text-emerald-300 tracking-wider px-2">
            {showMasterCredential ? storageService.getAdminPin() : '••••••••••••'}
          </code>
          <button
            type="button"
            onClick={() => setShowMasterCredential(!showMasterCredential)}
            className="p-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={showMasterCredential ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showMasterCredential ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Manage Shield Dialog */}
      {showShieldManager && (
        <div className="p-4 rounded-xl bg-stone-100 border border-stone-300 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-800" />
              <span>Escudo Institucional (CASD José Prudencio Padilla)</span>
            </h4>
            <button onClick={() => setShowShieldManager(false)} className="text-stone-500 hover:text-stone-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white p-1 border border-stone-300 flex items-center justify-center shrink-0 shadow-xs">
              <img src={currentShield} alt="Escudo actual" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="space-y-2 grow">
              <p className="text-stone-600">
                Se está utilizando el escudo oficial de la institución. Si deseas usar una imagen específica o archivo que tengas, puedes subirlo a continuación:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Escudo Personalizado</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleShieldFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleResetShield}
                  className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold transition-colors"
                >
                  Restablecer al Escudo Oficial
                </button>
              </div>
              {shieldMsg && <p className="text-emerald-800 font-bold">{shieldMsg}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ================= METRICS CARDS SECTION ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Photos */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Fotografías</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-stone-900">{metricas.totalFotos}</p>
          <p className="text-[11px] text-stone-500 mt-1">Láminas A5 registradas</p>
        </div>

        {/* Nativas vs No Nativas */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Especies Nativas</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-emerald-800">{metricas.totalNativas}</p>
            <span className="text-xs font-bold text-emerald-700">({metricas.porcentajeNativas}%)</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${metricas.porcentajeNativas}%` }}
            />
          </div>
        </div>

        {/* No Nativas */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>No Nativas / Introducidas</span>
            <Compass className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-800">{metricas.totalNoNativas}</p>
          <p className="text-[11px] text-stone-500 mt-1">Plantas/animales foráneos</p>
        </div>

        {/* Total Hábitats */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Hábitats Mapeados</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-blue-800">{metricas.totalHabitats}</p>
          <p className="text-[11px] text-stone-500 mt-1">Ecosistemas de B/bermeja</p>
        </div>
      </div>

      {/* ================= DATA MANAGEMENT TABLE ================= */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrar registros por nombre o autor..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">
              Mostrando {registrosFiltrados.length} de {especies.length} fotos
            </span>
            <button
              type="button"
              onClick={onResetPredeterminados}
              className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Restablecer registros predeterminados del CASD"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Table Responsive Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-100 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Foto / ID</th>
                <th className="py-3 px-4">Nombre Común</th>
                <th className="py-3 px-4">Nombre Científico</th>
                <th className="py-3 px-4">Nativa B/bermeja</th>
                <th className="py-3 px-4">Hábitat</th>
                <th className="py-3 px-4">Orientación A5</th>
                <th className="py-3 px-4">Autor / Fecha</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {registrosFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                  {/* Photo & ID */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.nombreComun}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200 shadow-xs"
                      />
                      <span className="font-mono text-[10px] text-stone-400">
                        {item.id.slice(-6)}
                      </span>
                    </div>
                  </td>

                  {/* Nombre Común */}
                  <td className="py-2.5 px-4 font-bold text-stone-900">
                    {item.nombreComun}
                  </td>

                  {/* Nombre Científico */}
                  <td className="py-2.5 px-4 italic text-stone-600">
                    {item.nombreCientifico}
                  </td>

                  {/* Nativa */}
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.esNativa
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.esNativa ? 'SÍ (Nativa)' : 'NO'}
                    </span>
                  </td>

                  {/* Hábitat */}
                  <td className="py-2.5 px-4 max-w-xs truncate text-stone-600">
                    {item.habitat}
                  </td>

                  {/* Orientación */}
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-600 text-[10px]">
                      {item.orientacion === 'vertical' ? 'A5 Vertical' : 'A5 Horizontal'}
                    </span>
                  </td>

                  {/* Autor */}
                  <td className="py-2.5 px-4 text-[11px] text-stone-500">
                    <div>{item.autorFoto || 'Estudiante'}</div>
                    <div className="text-[10px] text-stone-400">{item.fechaRegistro}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View */}
                      <button
                        type="button"
                        onClick={() => onSelectEspecie(item)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        title="Ver Lámina A5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => setEditingEspecie({ ...item })}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                        title="Editar Datos"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                        title="Eliminar Fotografía"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingEspecie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <h3 className="font-bold text-lg text-stone-900">
                Editar Datos de la Especie
              </h3>
              <button
                onClick={() => setEditingEspecie(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nombre Común</label>
                  <input
                    type="text"
                    required
                    value={editingEspecie.nombreComun}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, nombreComun: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nombre Científico</label>
                  <input
                    type="text"
                    required
                    value={editingEspecie.nombreCientifico}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, nombreCientifico: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg italic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Especie / Taxón</label>
                  <input
                    type="text"
                    required
                    value={editingEspecie.especie}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, especie: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">¿Es nativa de Barrancabermeja?</label>
                  <select
                    value={editingEspecie.esNativa ? 'si' : 'no'}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, esNativa: e.target.value === 'si' })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  >
                    <option value="si">SÍ - Nativa de Barrancabermeja</option>
                    <option value="no">NO - Introducida / Foránea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Origen</label>
                  <input
                    type="text"
                    required
                    value={editingEspecie.origen}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, origen: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Hábitat</label>
                  <input
                    type="text"
                    required
                    value={editingEspecie.habitat}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, habitat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Características</label>
                <textarea
                  rows={3}
                  required
                  value={editingEspecie.caracteristicas}
                  onChange={(e) => setEditingEspecie({ ...editingEspecie, caracteristicas: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Importancia Ecológica</label>
                <textarea
                  rows={3}
                  required
                  value={editingEspecie.importanciaEcologica}
                  onChange={(e) => setEditingEspecie({ ...editingEspecie, importanciaEcologica: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Orientación del Marco</label>
                  <select
                    value={editingEspecie.orientacion}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, orientacion: e.target.value as 'vertical' | 'horizontal' })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="vertical">A5 Vertical</option>
                    <option value="horizontal">A5 Horizontal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Autor de la Fotografía</label>
                  <input
                    type="text"
                    value={editingEspecie.autorFoto || ''}
                    onChange={(e) => setEditingEspecie({ ...editingEspecie, autorFoto: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Ruta o Enlace de la Fotografía
                </label>
                <input
                  type="text"
                  required
                  value={editingEspecie.imageUrl}
                  onChange={(e) => setEditingEspecie({ ...editingEspecie, imageUrl: e.target.value })}
                  placeholder="Ej: /fotos/cedro.jpg o https://..."
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                />
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Puedes ingresar la ruta local de la carpeta <code className="bg-stone-100 text-emerald-800 px-1 rounded">public/fotos/</code> (ej: <code className="bg-stone-100 text-stone-700 px-1 rounded">/fotos/mi_especie.jpg</code>) o un enlace web HTTPS.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingEspecie(null)}
                  className="px-4 py-2 rounded-lg border text-stone-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-stone-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-stone-900 text-base">¿Eliminar esta fotografía?</h4>
            <p className="text-xs text-stone-600 mt-1 mb-5">
              Esta acción removerá la fotografía y su lámina A5 del álbum digital.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEspecie(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-sm"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
