import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { SaleService } from '../../services/sale.service';
import { PrecioFinalPipe } from '../../shared/precio-final.pipe';
import { precioFinal } from '../../shared/precio';

/** Página del carrito: sumar, restar, vaciar y pagar (crea las ventas). */
@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe, PrecioFinalPipe],
  templateUrl: './cart.html',
})
export class Cart {
  protected cart = inject(CartService);
  private sales = inject(SaleService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private avisos = inject(NotificationService);

  protected pagando = signal(false);

  /** Convierte cada línea del carrito en una venta (POST /sales) y espera a todas. */
  pagar(): void {
    const userId = this.auth.session()!.user.id;
    const hoy = new Date().toISOString().slice(0, 10);

    const peticiones = this.cart.items().map(({ videogame, cantidad }) => {
      const precioUnitario = precioFinal(videogame);
      return this.sales.crear({
        videogameId: videogame.id,
        userId,
        cantidad,
        precioUnitario,
        total: Math.round(precioUnitario * cantidad * 100) / 100,
        fecha: hoy,
        estado: 'pendiente',
      });
    });

    this.pagando.set(true);
    forkJoin(peticiones).subscribe({
      next: () => {
        this.cart.clear(); // el contador del menú vuelve a 0
        this.avisos.ok('¡Compra realizada! La tienes en tu perfil.');
        this.router.navigate(['/perfil']);
      },
      error: () => this.pagando.set(false),
    });
  }
}
