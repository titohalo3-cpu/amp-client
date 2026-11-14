import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
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

  /**
   * 1. paramMap emite los parámetros de la URL (y vuelve a emitir si cambia el id).
   * 2. Sacamos el id y lo pasamos a número.
   * 3. switchMap lanza la petición HTTP (y cancela la anterior si había una).
   * undefined = cargando · null = no existe · Videogame = encontrado
   */
  protected juego = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')!),
      switchMap((id) => this.juegosSrv.getById(id).pipe(catchError(() => of(null)))),
    ),
  );

  protected esGestor = computed(() => this.auth.hasRole('admin', 'trabajador'));

  agregar(juego: Videogame): void {
    this.cart.add(juego);
    this.avisos.ok(`"${juego.titulo}" añadido al carrito`);
  }
}
