import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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

/** Peticiones HTTP de videojuegos (CRUD), y filtro y orden del catálogo. */
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
