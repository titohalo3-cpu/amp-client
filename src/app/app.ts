import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './pages/menu/menu';
import { NotificationService } from './services/notification.service';

/** Componente raíz: menú arriba, la página de la ruta actual debajo y los avisos. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu],
  templateUrl: './app.html',
})
export class App {
  protected avisos = inject(NotificationService);
}
