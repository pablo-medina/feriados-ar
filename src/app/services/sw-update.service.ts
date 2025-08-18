import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UpdateInfo {
  available: boolean;
  current: string;
  availableVersion: string;
}

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {
  private swUpdate = inject(SwUpdate);
  private snackBar = inject(MatSnackBar);
  
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor() {
    this.initializeUpdateChecks();
  }

  private initializeUpdateChecks() {
    if (this.swUpdate.isEnabled) {
      // Verificar actualizaciones al inicializar
      this.checkForUpdate();

      // Verificar actualizaciones periódicamente (cada 30 minutos)
      setInterval(() => {
        this.checkForUpdate();
      }, 30 * 60 * 1000);

      // Escuchar eventos de actualización
      this.swUpdate.versionUpdates.subscribe(event => {
        console.log('Evento de actualización del service worker:', event);
        
        switch (event.type) {
          case 'VERSION_READY':
            this.handleVersionReady(event);
            break;
          case 'VERSION_INSTALLATION_FAILED':
            this.handleInstallationFailed(event);
            break;
          case 'NO_NEW_VERSION_DETECTED':
            console.log('No hay nuevas versiones disponibles');
            break;
        }
      });

      // Escuchar errores irrecuperables
      this.swUpdate.unrecoverable.subscribe(event => {
        console.error('Error irrecuperable del service worker:', event);
        this.showErrorMessage('Error crítico en la aplicación. Por favor, recarga la página.');
      });
    }
  }

  public checkForUpdate(): Promise<boolean> {
    if (this.swUpdate.isEnabled) {
      return this.swUpdate.checkForUpdate();
    }
    return Promise.resolve(false);
  }

  public activateUpdate(): Promise<boolean> {
    if (this.swUpdate.isEnabled) {
      return this.swUpdate.activateUpdate();
    }
    return Promise.resolve(false);
  }

  public forceRefresh(): void {
    // Limpiar cache del service worker y recargar
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Eliminando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('Cache limpiado, recargando aplicación...');
        this.showInfoMessage('Cache limpiado. Recargando aplicación...');
        setTimeout(() => {
          (window as any).location?.reload();
        }, 1000);
      }).catch(error => {
        console.error('Error al limpiar cache:', error);
        this.showErrorMessage('Error al limpiar cache');
      });
    } else {
      // Fallback: recargar directamente
      (window as any).location?.reload();
    }
  }

  private handleVersionReady(event: any) {
    console.log('Nueva versión disponible:', event);
    this.updateAvailableSubject.next(true);
    this.showUpdateNotification();
  }

  private handleInstallationFailed(event: any) {
    console.error('Error al instalar la actualización:', event);
    this.showErrorMessage('Error al instalar la actualización');
  }

  private showUpdateNotification() {
    const snackBarRef = this.snackBar.open(
      '🔄 Hay una nueva versión disponible',
      'Actualizar ahora',
      {
        duration: 0, // No se cierra automáticamente
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['update-snackbar'],
        data: { type: 'update' }
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.performUpdate();
    });
  }

  private async performUpdate() {
    try {
      await this.activateUpdate();
      this.updateAvailableSubject.next(false);
      
      // Mostrar mensaje de éxito antes de recargar
      this.snackBar.open('✅ Actualización aplicada', 'Recargando...', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar']
      });

      // Recargar la página después de un breve delay
      setTimeout(() => {
        (window as any).location?.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error al activar la actualización:', error);
      this.showErrorMessage('Error al aplicar la actualización');
    }
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(`❌ ${message}`, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string) {
    this.snackBar.open(`ℹ️ ${message}`, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['info-snackbar']
    });
  }

  public forceUpdate(): void {
    this.performUpdate();
  }

  public isUpdateAvailable(): boolean {
    return this.updateAvailableSubject.value;
  }
}
