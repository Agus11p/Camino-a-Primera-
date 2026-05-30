export type PiernaHabil = 'Diestro' | 'Zurdo';

export type PosicionTactica =
  | 'Arquero'
  | 'Central Izquierdo'
  | 'Central Derecho'
  | 'Lateral Izquierdo'
  | 'Lateral Derecho'
  | 'Mediocampista Defensivo'
  | 'Mediocampista Ofensivo'
  | 'Mediocampista Externo Izquierdo'
  | 'Mediocampista Externo Derecho'
  | 'Extremo Izquierdo'
  | 'Extremo Derecho'
  | 'Mediapunta'
  | 'Delantero Centro';

export const POSICIONES_TACTICAS: PosicionTactica[] = [
  'Arquero',
  'Central Izquierdo',
  'Central Derecho',
  'Lateral Izquierdo',
  'Lateral Derecho',
  'Mediocampista Defensivo',
  'Mediocampista Ofensivo',
  'Mediocampista Externo Izquierdo',
  'Mediocampista Externo Derecho',
  'Extremo Izquierdo',
  'Extremo Derecho',
  'Mediapunta',
  'Delantero Centro',
];

export const HABILIDADES_DISPONIBLES = [
  'Velocidad',
  'Definición',
  'Pase',
  'Potencia',
  'Regate',
  'Cabezazo',
  'Resistencia',
  'Entrada',
  'Reflejos',
  'Centrar',
];

export interface PlayerProfile {
  nombre: string;
  club: string;
  edad: number;
  peso: number;
  altura: number;
  piernaHabil: PiernaHabil;
  posicion: PosicionTactica;
  habilidad1: string;
  habilidad2: string;
  habilidades?: string[];
}

export interface ActivityLog {
  id: string;
  tipo: 'Entrenamiento' | 'Partido';
  fecha: string; // ISO date string (YYYY-MM-DD)
  goles: number; // 0 for Entrenamiento
  asistencias: number; // 0 for Entrenamiento
  reflexion: string;
  timestamp: number;
}

export interface DynamicGoal {
  id: string;
  texto: string;
  completado: boolean;
  plazo: 'Corto' | 'Mediano' | 'Largo';
}

export interface BadgeCount {
  name: string;
  count: number;
  description: string;
}
