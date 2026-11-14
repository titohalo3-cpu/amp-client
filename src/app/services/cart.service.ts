import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem } from '../models/cart-item.interface';
import { Videogame } from '../models/videogame.interface';
import { precioFinal } from '../shared/precio';

/**
 * Estado del carrito con signals.
 * El menú lee totalUnidades() y se actualiza solo cuando se añade o quita un juego.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.leerCarrito());

  readonly items = this._items.asReadonly();
  readonly totalUnidades = computed(() => this._items().reduce((n, item) => n + item.cantidad, 0));
  readonly totalPrecio = computed(() =>
    this._items().reduce((suma, item) => suma + precioFinal(item.videogame) * item.cantidad, 0),
  );

  constructor() {
    // Cada vez que cambia el carrito se guarda en localStorage.
    effect(() => localStorage.setItem('carrito', JSON.stringify(this._items())));
  }

  /** Añade una unidad. Si el juego ya está, suma 1 a su cantidad. */
  add(juego: Videogame): void {
    this._items.update((items) => {
      const existe = items.some((i) => i.videogame.id === juego.id);
      return existe
        ? items.map((i) => (i.videogame.id === juego.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...items, { videogame: juego, cantidad: 1 }];
    });
  }

  /** Quita una unidad. Si llega a 0, la línea desaparece. */
  remove(id: string): void {
    this._items.update((items) =>
      items
        .map((i) => (i.videogame.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
        .filter((i) => i.cantidad > 0),
    );
  }

  clear(): void {
    this._items.set([]);
  }

  private leerCarrito(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem('carrito') ?? '[]');
    } catch {
      return [];
    }
  }
}
