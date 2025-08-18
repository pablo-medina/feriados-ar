import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DEFAULT_THEME: Theme = 'light';

  // Signal para el tema actual
  public currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Effect que se ejecuta cuando cambia el tema
    effect(() => {
      this.applyTheme(this.currentTheme());
    });

    // Aplicar tema inicial
    this.applyTheme(this.currentTheme());
  }

  /**
   * Cambia entre modo claro y oscuro
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Establece un tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.saveTheme(theme);
  }

  /**
   * Obtiene si el tema actual es oscuro
   */
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }

  /**
   * Aplica el tema al DOM
   */
  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    // Remover clases de tema anteriores
    body.classList.remove('light-theme', 'dark-theme');
    
    // Agregar nueva clase de tema
    body.classList.add(`${theme}-theme`);
    
    // Actualizar color-scheme para que los componentes nativos también cambien
    body.style.colorScheme = theme;
  }

  /**
   * Obtiene el tema guardado en localStorage
   */
  private getStoredTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.THEME_KEY) as Theme;
      return stored && (stored === 'light' || stored === 'dark') ? stored : this.DEFAULT_THEME;
    }
    return this.DEFAULT_THEME;
  }

  /**
   * Guarda el tema en localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }
}
