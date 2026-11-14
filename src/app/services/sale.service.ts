import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../api.config';
import { Sale } from '../models/sale.interface';

/**
 * Registro, consulta, modificación y borrado de ventas.
 * Guarda la lista en una signal: cuando cambia una venta,
 * la tabla, los indicadores y los gráficos se actualizan solos.
 */
@Injectable({ providedIn: 'root' })
export class SaleService {
  private http = inject(HttpClient);
  private url = `${API_URL}/ventas`;

  private readonly _ventas = signal<Sale[]>([]);
  readonly ventas = this._ventas.asReadonly();

  /** Ventas que cuentan (las canceladas no). */
  readonly validas = computed(() => this._ventas().filter((v) => v.estado !== 'cancelada'));
  readonly ingresos = computed(() =>
    this._ventas()
      .filter((v) => v.estado === 'completada')
      .reduce((suma, v) => suma + v.total, 0),
  );
  readonly unidades = computed(() => this.validas().reduce((n, v) => n + v.cantidad, 0));

  /** Pide todas las ventas y las guarda en la signal. */
  cargar(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.url).pipe(tap((ventas) => this._ventas.set(ventas)));
  }

  /** GET /ventas/:id (para editar una venta). */
  obtener(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.url}/${id}`);
  }

  crear(venta: Omit<Sale, 'id'>): Observable<Sale> {
    return this.http
      .post<Sale>(this.url, venta)
      .pipe(tap((nueva) => this._ventas.update((lista) => [...lista, nueva])));
  }

  modificar(venta: Sale): Observable<Sale> {
    return this.http
      .put<Sale>(`${this.url}/${venta.id}`, venta)
      .pipe(tap((mod) => this._ventas.update((lista) => lista.map((v) => (v.id === mod.id ? mod : v)))));
  }

  eliminar(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(tap(() => this._ventas.update((lista) => lista.filter((v) => v.id !== id))));
  }
}
