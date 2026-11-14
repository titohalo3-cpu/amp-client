import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, switchMap, timer } from 'rxjs';
import { API_URL } from '../api.config';
import { Filtro, Orden, Videogame } from '../models/videogame.interface';
import { precioFinal } from '../shared/precio';

export const FILTRO_INICIAL: Filtro = {
  texto: '',
  genero: '',
  soloOfertas: false,
  valoracionMin: 0,
  orden: 'valoracion',
};

/** Ofertas y la hora a la que se pidieron (para enseñar que se refrescan). */
export interface OfertasEnDirecto {
  juegos: Videogame[];
  hora: Date;
}

/** Peticiones HTTP de videojuegos, lista de ofertas en directo, filtros y orden. */
@Injectable({ providedIn: 'root' })
export class VideogameService {
  private http = inject(HttpClient);
  private url = `${API_URL}/videojuegos`;

  getAll(): Observable<Videogame[]> {
    return this.http.get<Videogame[]>(this.url);
  }

  getById(id: string): Observable<Videogame> {
    return this.http.get<Videogame>(`${this.url}/${id}`);
  }

  create(juego: Omit<Videogame, 'id'>): Observable<Videogame> {
    return this.http.post<Videogame>(this.url, juego);
  }

  update(juego: Videogame): Observable<Videogame> {
    return this.http.put<Videogame>(`${this.url}/${juego.id}`, juego);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /**
   * Lista constante de ofertas: se pide al suscribirse y luego cada 30 segundos.
   * switchMap cancela la petición anterior si aún no ha respondido.
   * shareReplay hace que varios componentes compartan la misma petición.
   */
  readonly ofertas$: Observable<OfertasEnDirecto> = timer(0, 30_000).pipe(
    switchMap(() => this.getAll()),
    map((juegos) => ({
      juegos: juegos.filter((j) => j.oferta > 0).sort((a, b) => b.oferta - a.oferta),
      hora: new Date(),
    })),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Aplica el filtro y el orden a una lista de juegos (no hace petición). */
  filtrarYOrdenar(juegos: Videogame[], f: Filtro): Videogame[] {
    const texto = f.texto.trim().toLowerCase();
    const comparar: Record<Orden, (a: Videogame, b: Videogame) => number> = {
      valoracion: (a, b) => b.valoracion - a.valoracion,
      az: (a, b) => a.titulo.localeCompare(b.titulo, 'es'),
      recientes: (a, b) => b.fechaLanzamiento.localeCompare(a.fechaLanzamiento),
      'precio-asc': (a, b) => precioFinal(a) - precioFinal(b),
      'precio-desc': (a, b) => precioFinal(b) - precioFinal(a),
    };
    return juegos
      .filter(
        (j) =>
          (!texto || j.titulo.toLowerCase().includes(texto)) &&
          (!f.genero || j.genero === f.genero) &&
          (!f.soloOfertas || j.oferta > 0) &&
          j.valoracion >= f.valoracionMin,
      )
      .sort(comparar[f.orden]);
  }
}
