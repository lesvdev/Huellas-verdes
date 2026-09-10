export type Orientacion = 'vertical' | 'horizontal';

export interface EspecieFotografia {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  especie: string;
  esNativa: boolean; // ¿Es nativa de Barrancabermeja? (true = Sí, false = No)
  origen: string;
  habitat: string;
  caracteristicas: string;
  importanciaEcologica: string;
  orientacion: Orientacion;
  imageUrl: string;
  autorFoto?: string;
  fechaRegistro: string;
  lugarBarrancabermeja?: string;
  destacada?: boolean;
}

export type CategoriaFiltro = 'todas' | 'nativas' | 'no-nativas' | 'flora' | 'fauna';

export interface FiltrosGaleria {
  busqueda: string;
  categoria: CategoriaFiltro;
  habitat: string;
  orientacion: 'todas' | Orientacion;
  orden: 'recientes' | 'nombre-az' | 'nombre-za' | 'cientifico-az';
}

export interface MetricasAlbum {
  totalFotos: number;
  totalNativas: number;
  totalNoNativas: number;
  porcentajeNativas: number;
  totalHabitats: number;
  conteoHabitats: Record<string, number>;
}
