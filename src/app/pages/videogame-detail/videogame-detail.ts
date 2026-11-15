import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Videogame } from '../../models/videogame.interface';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { VideogameService } from '../../services/videogame.service';
import { PrecioFinalPipe } from '../../shared/precio-final.pipe';

/** Ficha completa de un juego. Ruta con parámetro: detalle/:id */
@Component({
  selector: 'app-videogame-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, PrecioFinalPipe],
  templateUrl: './videogame-detail.html',
})
export class VideogameDetail {
  private route = inject(ActivatedRoute);
  private juegosSrv = inject(VideogameService);
  private cart = inject(CartService);
  private avisos = inject(NotificationService);
  private auth = inject(AuthService);

  /** El :id de la URL (detalle/:id). */
  private id = this.route.snapshot.paramMap.get('id')!;

  /** undefined = cargando · null = no existe · Videogame = encontrado */
  protected juego = signal<Videogame | null | undefined>(undefined);

  protected esGestor = computed(() => this.auth.hasRole('admin', 'trabajador'));

  constructor() {
    // GET /videojuegos/:id
    this.juegosSrv.getById(this.id).subscribe({
      next: (juego) => this.juego.set(juego),
      error: () => this.juego.set(null),
    });
  }

  agregar(juego: Videogame): void {
    this.cart.add(juego);
    this.avisos.ok(`"${juego.titulo}" añadido al carrito`);
  }
}
