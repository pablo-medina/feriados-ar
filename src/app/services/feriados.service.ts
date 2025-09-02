import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, map, tap, of } from 'rxjs';
import { Feriado, FeriadoResponse } from '../models/feriado.model';

@Injectable({
  providedIn: 'root'
})
export class FeriadosService {
  private readonly API_BASE_URL = 'https://api.argentinadatos.com/v1/feriados';
  private readonly CACHE_KEY = 'feriados_cache';
  private readonly CACHE_EXPIRY_KEY = 'feriados_cache_expiry';
  private readonly CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 365 días
  private readonly WEEKLY_UPDATE_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días

  private feriadosSubject = new BehaviorSubject<Feriado[]>([]);
  public feriados$ = this.feriadosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // Signals para reactividad
  public feriados = signal<Feriado[]>([]);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.loadFromCache();
  }

  /**
   * Obtiene los feriados del año especificado
   */
  getFeriados(anio: number = new Date().getFullYear(), forceRefresh: boolean = false): Observable<Feriado[]> {
    // Si hay datos en caché válidos, usarlos inmediatamente
    if (!forceRefresh && this.isCacheValid(anio)) {
      const cachedData = this.getCachedData(anio);
      if (cachedData) {
        this.updateState(cachedData, false, null);
        
        // Si la caché es antigua, intentar actualizar en background
        if (this.shouldUpdateCache(anio)) {
          this.updateInBackground(anio);
        }
        
        return of(cachedData);
      }
    }

    // Si no hay caché válida o es un refresh manual, cargar desde la API
    this.updateState([], true, null);

    return this.http.get<Feriado[]>(`${this.API_BASE_URL}/${anio}`).pipe(
      map(feriados => this.processFeriados(feriados)),
      tap(feriados => {
        this.cacheData(anio, feriados);
        this.updateState(feriados, false, null);
      }),
      catchError(error => {
        const errorMessage = this.getErrorMessage(error);
        
        // Intentar cargar desde caché aunque esté expirado
        const cachedData = this.getCachedData(anio);
        if (cachedData) {
          // Si es un refresh manual y falló, mostrar el error
          if (forceRefresh) {
            this.updateState(cachedData, false, errorMessage);
          } else {
            // Si es carga automática, usar caché silenciosamente
            this.updateState(cachedData, false, null);
          }
          return of(cachedData);
        }
        
        // Si no hay caché, mostrar error
        this.updateState([], false, errorMessage);
        return of([]);
      })
    );
  }

  /**
   * Fuerza la actualización de los datos
   */
  refresh(anio: number = new Date().getFullYear()): Observable<Feriado[]> {
    return this.getFeriados(anio, true);
  }

  /**
   * Obtiene los feriados del mes actual
   */
  getFeriadosDelMes(anio?: number, mes?: number): Feriado[] {
    const fechaActual = new Date();
    const anioTarget = anio || fechaActual.getFullYear();
    const mesTarget = mes !== undefined ? mes : fechaActual.getMonth() + 1;

    return this.feriados().filter(feriado => {
      // Crear la fecha en zona horaria local para evitar problemas de UTC
      const [anio, mes, dia] = feriado.fecha.split('-').map(Number);
      const fechaFeriado = new Date(anio, mes - 1, dia); // mes - 1 porque getMonth() devuelve 0-11
      
      return fechaFeriado.getFullYear() === anioTarget && 
             fechaFeriado.getMonth() + 1 === mesTarget;
    });
  }

  /**
   * Verifica si una fecha es feriado
   */
  esFeriado(fecha: Date): Feriado | null {
    const fechaStr = fecha.toISOString().split('T')[0];
    return this.feriados().find(f => f.fecha === fechaStr) || null;
  }

  /**
   * Obtiene el próximo feriado
   */
  getProximoFeriado(): Feriado | null {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const feriadosFuturos = this.feriados()
      .filter(f => {
        // Crear la fecha en zona horaria local para evitar problemas de UTC
        const [anio, mes, dia] = f.fecha.split('-').map(Number);
        const fechaFeriado = new Date(anio, mes - 1, dia); // mes - 1 porque getMonth() devuelve 0-11
        return fechaFeriado >= hoy;
      })
      .sort((a, b) => {
        // Crear las fechas en zona horaria local para evitar problemas de UTC
        const [anioA, mesA, diaA] = a.fecha.split('-').map(Number);
        const [anioB, mesB, diaB] = b.fecha.split('-').map(Number);
        const fechaA = new Date(anioA, mesA - 1, diaA);
        const fechaB = new Date(anioB, mesB - 1, diaB);
        return fechaA.getTime() - fechaB.getTime();
      });
    
    return feriadosFuturos.length > 0 ? feriadosFuturos[0] : null;
  }

  private processFeriados(feriados: any[]): Feriado[] {
    return feriados.map(f => ({
      fecha: f.fecha,
      nombre: f.nombre,
      tipo: f.tipo || 'inamovible',
      info: f.info
    })).sort((a, b) => {
      // Crear las fechas en zona horaria local para evitar problemas de UTC
      const [anioA, mesA, diaA] = a.fecha.split('-').map(Number);
      const [anioB, mesB, diaB] = b.fecha.split('-').map(Number);
      const fechaA = new Date(anioA, mesA - 1, diaA);
      const fechaB = new Date(anioB, mesB - 1, diaB);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  private updateState(feriados: Feriado[], loading: boolean, error: string | null): void {
    this.feriados.set(feriados);
    this.loading.set(loading);
    this.error.set(error);

    this.feriadosSubject.next(feriados);
    this.loadingSubject.next(loading);
    this.errorSubject.next(error);
  }

  private cacheData(anio: number, feriados: Feriado[]): void {
    try {
      const cacheData = {
        anio,
        feriados,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error al guardar en caché:', error);
    }
  }

  private getCachedData(anio: number): Feriado[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      if (cacheData.anio === anio) {
        return cacheData.feriados;
      }
    } catch (error) {
      console.warn('Error al leer caché:', error);
    }
    return null;
  }

  private isCacheValid(anio: number): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const cacheData = JSON.parse(cached);
      if (cacheData.anio !== anio) return false;

      const now = Date.now();
      const cacheAge = now - cacheData.timestamp;
      
      // La caché es válida si es del mismo año y no ha pasado más de 365 días
      return cacheAge < this.CACHE_DURATION;
    } catch (error) {
      return false;
    }
  }

  private shouldUpdateCache(anio: number): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return true;

      const cacheData = JSON.parse(cached);
      if (cacheData.anio !== anio) return true;

      const now = Date.now();
      const cacheAge = now - cacheData.timestamp;
      
      // Actualizar semanalmente si hay conexión
      return cacheAge > this.WEEKLY_UPDATE_INTERVAL;
    } catch (error) {
      return true;
    }
  }

  private loadFromCache(): void {
    const anioActual = new Date().getFullYear();
    const cachedData = this.getCachedData(anioActual);
    if (cachedData) {
      this.updateState(cachedData, false, null);
    }
  }

  private updateInBackground(anio: number): void {
    // Actualizar en background sin mostrar loading
    this.http.get<Feriado[]>(`${this.API_BASE_URL}/${anio}`).pipe(
      map(feriados => this.processFeriados(feriados)),
      tap(feriados => {
        this.cacheData(anio, feriados);
        // Actualizar el estado sin mostrar loading
        this.updateState(feriados, false, null);
      }),
      catchError(error => {
        // En background, no mostrar errores
        console.warn('Error en actualización background:', error);
        return of([]);
      })
    ).subscribe();
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Sin conexión a internet';
    } else if (error.status >= 500) {
      return 'Error del servidor';
    } else if (error.status === 404) {
      return 'Datos no encontrados';
    } else {
      return 'Error al cargar los datos';
    }
  }
}
