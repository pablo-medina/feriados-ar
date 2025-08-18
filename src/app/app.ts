import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeriadosListComponent } from './components/feriados-list/feriados-list.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeriadosListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('feriados-ar');
  
  // Inyectar el servicio de tema para que se inicialice
  private themeService = inject(ThemeService);
}
