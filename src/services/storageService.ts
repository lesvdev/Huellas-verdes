import { EspecieFotografia, MetricasAlbum } from '../types';
import { ESPECIES_INICIALES } from '../data/initialData';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';

const STORAGE_KEY = 'huellas_verdes_especies_v1';
const SHIELD_URL_KEY = 'huellas_verdes_custom_shield';

// Contraseña maestra de seguridad del administrador.
// Solo puede ser modificada directamente aquí en el código de programación fuente.
export const CODIGO_MAESTRO_ADMIN = 'analisis2026';

// Nombres de colecciones en Firestore
const ESPECIES_COLLECTION = 'especies';
const CONFIG_COLLECTION = 'config';
const SHIELD_DOC_ID = 'institucional';

// Test inicial de conexión requerido
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase en modo sin conexión o pendiente de inicialización.');
    }
  }
}
testFirestoreConnection();

export const storageService = {
  // Obtener especies locales como respaldo inmediato para no retrasar el renderizado inicial
  getLocalEspecies(): EspecieFotografia[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return ESPECIES_INICIALES;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ESPECIES_INICIALES;
    } catch {
      return ESPECIES_INICIALES;
    }
  },

  // Sincronización en tiempo real con Firestore para que todo el mundo vea los cambios al instante
  subscribeEspecies(onUpdate: (especies: EspecieFotografia[]) => void): () => void {
    const colRef = collection(db, ESPECIES_COLLECTION);
    
    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        // Si Firestore está recién creado y vacío, sembramos automáticamente las especies iniciales del proyecto
        console.log('Sembrando catálogo inicial de Huellas Verdes en Firestore...');
        await this.sembrarEspeciesIniciales();
        return;
      }

      const especiesRemotas: EspecieFotografia[] = [];
      snapshot.forEach((docSnap) => {
        especiesRemotas.push(docSnap.data() as EspecieFotografia);
      });

      // Ordenar: primero las destacadas, luego por fecha descendente o id
      especiesRemotas.sort((a, b) => {
        if (a.destacada && !b.destacada) return -1;
        if (!a.destacada && b.destacada) return 1;
        return (b.fechaRegistro || '').localeCompare(a.fechaRegistro || '');
      });

      // Guardar copia local de respaldo
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(especiesRemotas));
      } catch (e) {
        console.warn('No se pudo guardar copia local:', e);
      }

      onUpdate(especiesRemotas);
    }, (error) => {
      // Si se supera la cuota diaria gratuita de Firestore (Quota limit exceeded) o hay fallo de red,
      // la aplicación conmuta silenciosamente al catálogo local en caché para que nunca se interrumpa el servicio
      if (error && error.message && error.message.includes('Quota limit exceeded')) {
        console.warn('Cuota gratuita diaria de lectura de Firestore alcanzada. Usando catálogo en caché de alta velocidad.');
      } else {
        console.warn('Sincronización de Firestore usando respaldo local:', error?.message);
      }
      onUpdate(this.getLocalEspecies());
    });

    return unsubscribe;
  },

  // Sembrado masivo del catálogo inicial en la nube de Firestore
  async sembrarEspeciesIniciales(): Promise<void> {
    try {
      const batch = writeBatch(db);
      for (const especie of ESPECIES_INICIALES) {
        const docRef = doc(db, ESPECIES_COLLECTION, especie.id);
        batch.set(docRef, especie);
      }
      await batch.commit();
      console.log('Catálogo inicial sembrado exitosamente en Firestore.');
    } catch (err) {
      console.error('Error al sembrar especies en Firestore:', err);
    }
  },

  // Guardar o actualizar especie en Firestore y respaldo local
  async guardarEspecie(nuevaEspecie: Omit<EspecieFotografia, 'id' | 'fechaRegistro'> & { id?: string; fechaRegistro?: string }): Promise<EspecieFotografia> {
    const id = nuevaEspecie.id || `hv-${Date.now()}`;
    const fechaRegistro = nuevaEspecie.fechaRegistro || new Date().toISOString().split('T')[0];
    
    const registroCompleto: EspecieFotografia = {
      ...nuevaEspecie,
      id,
      fechaRegistro,
    };

    // 1. Guardado en Firestore Cloud (accesible desde cualquier parte del mundo)
    try {
      const docRef = doc(db, ESPECIES_COLLECTION, id);
      await setDoc(docRef, registroCompleto, { merge: true });
    } catch (e) {
      console.error('Error al guardar en Firestore, guardando localmente:', e);
    }

    // 2. Guardado en caché local
    const lista = this.getLocalEspecies();
    const idx = lista.findIndex(e => e.id === id);
    const nuevaLista = idx >= 0 ? lista.map(e => e.id === id ? registroCompleto : e) : [registroCompleto, ...lista];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevaLista));
    } catch {}

    return registroCompleto;
  },

  // Eliminar especie de Firestore y local
  async eliminarEspecie(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, ESPECIES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Error al eliminar en Firestore:', e);
    }

    const lista = this.getLocalEspecies().filter(e => e.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
      return true;
    } catch {
      return false;
    }
  },

  // Restablecer al catálogo oficial predeterminado en la nube
  async restablecerPredeterminados(): Promise<EspecieFotografia[]> {
    try {
      const colRef = collection(db, ESPECIES_COLLECTION);
      const snapshot = await getDocs(colRef);
      const batch = writeBatch(db);
      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();

      await this.sembrarEspeciesIniciales();
    } catch (e) {
      console.error('Error al restablecer en Firestore:', e);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ESPECIES_INICIALES));
    } catch {}

    return ESPECIES_INICIALES;
  },

  // Métricas estadísticas del catálogo
  getMetricas(especies?: EspecieFotografia[]): MetricasAlbum {
    const lista = especies || this.getLocalEspecies();
    const totalFotos = lista.length;
    const totalNativas = lista.filter(e => e.esNativa).length;
    const totalNoNativas = totalFotos - totalNativas;
    const porcentajeNativas = totalFotos > 0 ? Math.round((totalNativas / totalFotos) * 100) : 0;

    const conteoHabitats: Record<string, number> = {};
    lista.forEach(e => {
      const h = e.habitat ? e.habitat.split(',')[0].trim() : 'Sin definir';
      conteoHabitats[h] = (conteoHabitats[h] || 0) + 1;
    });

    return {
      totalFotos,
      totalNativas,
      totalNoNativas,
      porcentajeNativas,
      totalHabitats: Object.keys(conteoHabitats).length,
      conteoHabitats,
    };
  },

  // Exportar métricas a formato Excel / CSV
  exportarCSV(especies?: EspecieFotografia[]): void {
    const lista = especies || this.getLocalEspecies();
    const headers = [
      'ID',
      'Nombre Común',
      'Nombre Científico',
      'Especie / Taxón',
      '¿Es Nativa de Barrancabermeja?',
      'Origen',
      'Hábitat',
      'Características',
      'Importancia Ecológica',
      'Orientación A5',
      'Autor de la Fotografía',
      'Lugar de Registro',
      'Fecha de Registro',
      'URL Imagen',
    ];

    const escapeCSV = (str: string | boolean | undefined) => {
      if (str === undefined || str === null) return '""';
      const val = typeof str === 'boolean' ? (str ? 'SÍ' : 'NO') : String(str);
      return `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    };

    const rows = lista.map(e => [
      escapeCSV(e.id),
      escapeCSV(e.nombreComun),
      escapeCSV(e.nombreCientifico),
      escapeCSV(e.especie),
      escapeCSV(e.esNativa),
      escapeCSV(e.origen),
      escapeCSV(e.habitat),
      escapeCSV(e.caracteristicas),
      escapeCSV(e.importanciaEcologica),
      escapeCSV(e.orientacion),
      escapeCSV(e.autorFoto || 'Estudiante CASD'),
      escapeCSV(e.lugarBarrancabermeja || 'Barrancabermeja'),
      escapeCSV(e.fechaRegistro),
      escapeCSV(e.imageUrl),
    ].join(','));

    // UTF-8 BOM (\uFEFF) para visualización correcta de tildes y ñ en Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Huellas_Verdes_Barrancabermeja_Metricas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  getAdminPin(): string {
    return CODIGO_MAESTRO_ADMIN;
  },

  getShieldUrl(): string {
    return localStorage.getItem(SHIELD_URL_KEY) || '/escudo-casd.png';
  },

  async setShieldUrl(url: string): Promise<void> {
    try {
      localStorage.setItem(SHIELD_URL_KEY, url);
      const docRef = doc(db, CONFIG_COLLECTION, SHIELD_DOC_ID);
      await setDoc(docRef, { shieldUrl: url, actualizadoEn: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Error al guardar escudo en Firestore:', e);
    }
  },

  subscribeShieldUrl(onUpdate: (url: string) => void): () => void {
    const docRef = doc(db, CONFIG_COLLECTION, SHIELD_DOC_ID);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().shieldUrl) {
        const url = docSnap.data().shieldUrl as string;
        localStorage.setItem(SHIELD_URL_KEY, url);
        onUpdate(url);
      }
    }, () => {
      onUpdate(this.getShieldUrl());
    });
  }
};
