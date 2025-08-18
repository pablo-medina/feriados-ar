export interface Feriado {
  fecha: string;
  nombre: string;
  tipo: 'inamovible' | 'trasladable';
  info?: string;
}

export interface FeriadoResponse {
  feriados: Feriado[];
  año: number;
}

export enum TipoFeriado {
  INAMOVIBLE = 'inamovible',
  TRASLADABLE = 'trasladable'
}
