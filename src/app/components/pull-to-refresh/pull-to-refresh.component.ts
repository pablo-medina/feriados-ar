import { Component, EventEmitter, Output, ElementRef, ViewChild, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pull-to-refresh',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div 
      #container 
      class="pull-to-refresh-container"
      [class.refreshing]="isRefreshing()"
      [class.pulling]="isPulling()"
      [style.transform]="'translateY(' + translateY() + 'px)'"
      [style.transition]="!isPulling() ? 'transform 0.3s ease' : 'none'">
      
      <div class="refresh-indicator" [style.opacity]="indicatorOpacity()">
        @if (isRefreshing()) {
          <mat-spinner diameter="24"></mat-spinner>
        } @else {
          <mat-icon 
            class="refresh-icon"
            [style.transform]="'rotate(' + iconRotation() + 'deg)'">
            keyboard_arrow_down
          </mat-icon>
        }
        <span class="refresh-text">
          @if (isRefreshing()) {
            Actualizando...
          } @else if (canRefresh()) {
            Suelta para actualizar
          } @else {
            Desliza hacia abajo
          }
        </span>
      </div>
      
      <div class="content" #content>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './pull-to-refresh.component.scss'
})
export class PullToRefreshComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  @ViewChild('content', { static: true }) content!: ElementRef<HTMLDivElement>;
  
  @Output() refresh = new EventEmitter<void>();

  // Signals para reactividad
  public isPulling = signal(false);
  public isRefreshing = signal(false);
  public translateY = signal(0);
  public indicatorOpacity = signal(0);
  public iconRotation = signal(0);
  public canRefresh = signal(false);

  private startY = 0;
  private currentY = 0;
  private maxPull = 80;
  private threshold = 60;
  private resistance = 2.5;
  private isActive = false;

  ngOnInit() {
    this.setupTouchListeners();
  }

  ngOnDestroy() {
    this.removeTouchListeners();
  }

  private setupTouchListeners() {
    const container = this.container.nativeElement;
    
    // Touch events
    container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    container.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    
    // Mouse events for desktop testing
    container.addEventListener('mousedown', this.onMouseDown.bind(this));
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    container.addEventListener('mouseup', this.onMouseUp.bind(this));
    container.addEventListener('mouseleave', this.onMouseUp.bind(this));
  }

  private removeTouchListeners() {
    const container = this.container.nativeElement;
    
    container.removeEventListener('touchstart', this.onTouchStart.bind(this));
    container.removeEventListener('touchmove', this.onTouchMove.bind(this));
    container.removeEventListener('touchend', this.onTouchEnd.bind(this));
    
    container.removeEventListener('mousedown', this.onMouseDown.bind(this));
    container.removeEventListener('mousemove', this.onMouseMove.bind(this));
    container.removeEventListener('mouseup', this.onMouseUp.bind(this));
    container.removeEventListener('mouseleave', this.onMouseUp.bind(this));
  }

  private onTouchStart(event: TouchEvent) {
    if (this.isRefreshing() || !this.isAtTop()) return;
    
    this.startY = event.touches[0].clientY;
    this.isActive = true;
  }

  private onTouchMove(event: TouchEvent) {
    if (!this.isActive || this.isRefreshing()) return;
    
    this.currentY = event.touches[0].clientY;
    const deltaY = this.currentY - this.startY;
    
    if (deltaY > 0) {
      event.preventDefault();
      this.updatePullState(deltaY);
    }
  }

  private onTouchEnd() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.handlePullEnd();
  }

  private onMouseDown(event: MouseEvent) {
    if (this.isRefreshing() || !this.isAtTop()) return;
    
    this.startY = event.clientY;
    this.isActive = true;
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isActive || this.isRefreshing()) return;
    
    this.currentY = event.clientY;
    const deltaY = this.currentY - this.startY;
    
    if (deltaY > 0) {
      event.preventDefault();
      this.updatePullState(deltaY);
    }
  }

  private onMouseUp() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.handlePullEnd();
  }

  private updatePullState(deltaY: number) {
    // Aplicar resistencia para hacer el pull más natural
    const pull = Math.min(deltaY / this.resistance, this.maxPull);
    
    this.isPulling.set(true);
    this.translateY.set(pull);
    
    // Calcular opacidad del indicador
    const opacity = Math.min(pull / this.threshold, 1);
    this.indicatorOpacity.set(opacity);
    
    // Rotar el ícono basado en el progreso
    const rotation = Math.min((pull / this.threshold) * 180, 180);
    this.iconRotation.set(rotation);
    
    // Determinar si se puede refrescar
    this.canRefresh.set(pull >= this.threshold);
  }

  private handlePullEnd() {
    const shouldRefresh = this.canRefresh();
    
    this.isPulling.set(false);
    
    if (shouldRefresh && !this.isRefreshing()) {
      this.triggerRefresh();
    } else {
      this.resetState();
    }
  }

  private triggerRefresh() {
    this.isRefreshing.set(true);
    this.translateY.set(this.threshold);
    this.indicatorOpacity.set(1);
    this.iconRotation.set(0);
    this.canRefresh.set(false);
    
    this.refresh.emit();
  }

  public completeRefresh() {
    this.isRefreshing.set(false);
    this.resetState();
  }

  private resetState() {
    this.translateY.set(0);
    this.indicatorOpacity.set(0);
    this.iconRotation.set(0);
    this.canRefresh.set(false);
  }

  private isAtTop(): boolean {
    const content = this.content.nativeElement;
    return content.scrollTop === 0;
  }
}
