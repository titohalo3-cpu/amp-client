import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Filtro, Videogame } from '../../models/videogame.interface';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { FILTRO_INICIAL, VideogameService } from '../../services/videogame.service';
import { FilterBar } from '../../shared/filter-bar/filter-bar';
import { VideogameCard } from '../videogame-card/videogame-card';

/**
 * Componente PADRE del catálogo.
 * Pide los juegos por HTTP, guarda el filtro que le llega de FilterBar
 * y pinta una VideogameCard por cada juego visible.
 */
@Component({
  selector: 'app-videogame-list',
  imports: [FilterBar, VideogameCard],
  templateUrl: './videogame-list.html',
})
export class VideogameList {
  private juegosSrv = inject(VideogameService);
  private cart = inject(CartService);
  private avisos = inject(NotificationService);

  /** Todos los juegos. undefined mientras llega la respuesta HTTP. */
  protected juegos = toSignal(this.juegosSrv.getAll());

  /** Último filtro emitido por FilterBar. */
  protected filtro = signal<Filtro>(FILTRO_INICIAL);

  protected generos = computed(() => [...new Set((this.juegos() ?? []).map((j) => j.genero))].sort());

  /** Se recalcula solo cuando cambian los juegos o el filtro. */
  protected visibles = computed(() => this.juegosSrv.filtrarYOrdenar(this.juegos() ?? [], this.filtro()));

  /** Se ejecuta cuando una ficha emite (agregar). */
  agregar(juego: Videogame): void {
    this.cart.add(juego);
    this.avisos.ok(`"${juego.titulo}" añadido al carrito`);
  }
}
