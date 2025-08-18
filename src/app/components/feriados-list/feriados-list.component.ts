import { Component, computed, inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { FeriadosService } from '../../services/feriados.service';
import { ThemeService } from '../../services/theme.service';
import { SwUpdateService } from '../../services/sw-update.service';
import { Feriado } from '../../models/feriado.model';
import { PullToRefreshComponent } from '../pull-to-refresh/pull-to-refresh.component';
import { AppInfoDialogComponent } from '../app-info-dialog/app-info-dialog.component';

@Component({
  selector: 'app-feriados-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTabsModule,
    MatRippleModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    PullToRefreshComponent
  ],
  templateUrl: './feriados-list.component.html',
  styleUrl: './feriados-list.component.scss'
})
export class FeriadosListComponent implements OnInit, AfterViewInit {
  private feriadosService = inject(FeriadosService);
  private themeService = inject(ThemeService);
  private swUpdateService = inject(SwUpdateService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild('pullToRefresh') pullToRefresh!: PullToRefreshComponent;

  public currentYear = signal(new Date().getFullYear());
  public selectedTabIndex = signal(0);
  public isInitialized = signal(false);
  public checkingUpdate = signal(false);
  public clearingCache = signal(false);

  // Computed properties para reactividad
  public feriados = this.feriadosService.feriados;
  public loading = this.feriadosService.loading;
  public error = this.feriadosService.error;
  
  // Theme properties
  public isDarkMode = this.themeService.currentTheme.asReadonly();

  public feriadosDelAnio = computed(() => {
    const feriados = this.feriados();
    const anio = this.currentYear();
    return feriados.filter(f => new Date(f.fecha).getFullYear() === anio);
  });

  public proximoFeriado = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const feriadosFuturos = this.feriadosDelAnio()
      .filter(f => new Date(f.fecha) >= hoy)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    return feriadosFuturos.length > 0 ? feriadosFuturos[0] : null;
  });

  public feriadosPorMes = computed(() => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return meses.map((nombreMes, index) => ({
      nombre: nombreMes,
      numero: index + 1,
      feriados: this.feriadosDelAnio().filter(f => 
        new Date(f.fecha).getMonth() === index
      )
    })).filter(mes => mes.feriados.length > 0);
  });

  public estadisticas = computed(() => {
    const feriados = this.feriadosDelAnio();
    const inamovibles = feriados.filter(f => f.tipo === 'inamovible').length;
    const trasladables = feriados.filter(f => f.tipo === 'trasladable').length;
    
    return {
      total: feriados.length,
      inamovibles,
      trasladables
    };
  });

  public feriadosHoy = computed(() => {
    return this.feriadosDelAnio().filter(f => this.esFeriadoHoy(f.fecha));
  });

  ngOnInit() {
    this.loadFeriados();
    
    // Suscribirse a errores para mostrar snackbar
    this.feriadosService.error$.subscribe(error => {
      if (error) {
        this.snackBar.open(error, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngAfterViewInit() {
    // Pequeño delay para mostrar animaciones de entrada
    setTimeout(() => {
      this.isInitialized.set(true);
    }, 100);
  }

  loadFeriados() {
    this.feriadosService.getFeriados(this.currentYear()).subscribe({
      next: (feriados) => {
        console.log(`Feriados cargados para el año ${this.currentYear()}:`, feriados.length);
      },
      error: (error) => {
        console.error('Error al cargar feriados:', error);
        this.showErrorMessage('Error al cargar los feriados');
      }
    });
  }

  onRefresh() {
    this.feriadosService.refresh(this.currentYear()).subscribe({
      next: () => {
        console.log('Datos actualizados correctamente');
      }
    });
  }

  onCheckAppUpdate() {
    this.checkingUpdate.set(true);
    this.swUpdateService.checkForUpdate().then(hasUpdate => {
      if (hasUpdate) {
        this.showInfoMessage('Nueva versión disponible. Se mostrará una notificación para actualizar.');
      } else {
        this.showInfoMessage('La aplicación está actualizada');
      }
    }).catch(error => {
      console.error('Error al verificar actualizaciones:', error);
      this.showErrorMessage('Error al verificar actualizaciones');
    }).finally(() => {
      this.checkingUpdate.set(false);
    });
  }

  onForceRefresh() {
    this.clearingCache.set(true);
    this.swUpdateService.forceRefresh();
    // El estado se resetea cuando se recarga la página
  }

  onShowAppInfo() {
    const buildDate = new Date();
    this.dialog.open(AppInfoDialogComponent, {
      data: {
        name: 'Feriados Argentina',
        version: '1.0.0',
        dataSource: 'API pública Argentina Datos',
        repository: 'https://github.com/pablo-medina/feriados-ar',
        buildDate: buildDate.toLocaleString('es-AR')
      },
      width: '520px'
    });
  }

  onPullRefresh() {
    this.feriadosService.refresh(this.currentYear()).subscribe({
      next: () => {
        this.pullToRefresh.completeRefresh();
      },
      error: () => {
        this.pullToRefresh.completeRefresh();
        this.showErrorMessage('Error al actualizar los datos');
      }
    });
  }

  onYearChange(year: number) {
    console.log('Cambiando año a:', year);
    
    // Evitar cambios innecesarios
    if (year === this.currentYear()) {
      return;
    }
    
    this.currentYear.set(year);
    this.showInfoMessage(`Cargando feriados del año ${year}...`);
    
    this.loadFeriados();
  }

  formatearFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return fecha.toLocaleDateString('es-AR', opciones);
  }

  getFechaCorta(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  getDiaSemana(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-AR', { weekday: 'short' });
  }

  getMes(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-AR', { month: 'short' });
  }

  getDiasHastaFeriado(fechaStr: string): number {
    const hoy = new Date();
    const feriado = new Date(fechaStr);
    const diffTime = feriado.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  esFeriadoPasado(fechaStr: string): boolean {
    const hoy = new Date();
    const feriado = new Date(fechaStr);
    hoy.setHours(0, 0, 0, 0);
    feriado.setHours(0, 0, 0, 0);
    return feriado < hoy;
  }

  esFeriadoHoy(fechaStr: string): boolean {
    const hoy = new Date();
    const feriado = new Date(fechaStr);
    return hoy.toDateString() === feriado.toDateString();
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }

  onToggleTheme() {
    this.themeService.toggleTheme();
    const newTheme = this.themeService.currentTheme();
    this.showInfoMessage(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });
  }
}
