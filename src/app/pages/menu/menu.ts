import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

/**
 * Barra de navegación. Las opciones dependen de si hay sesión y del rol.
 * El contador del carrito lee una signal del CartService.
 */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
})
export class Menu {
  protected auth = inject(AuthService);
  protected cart = inject(CartService);

  /** Menú desplegado en móvil. */
  protected abierto = signal(false);

  /** Admin y trabajador ven la parte de gestión. */
  protected esGestor = computed(() => this.auth.hasRole('admin', 'trabajador'));

  salir(): void {
    this.cart.clear();
    this.abierto.set(false);
    this.auth.logout();
  }
}
