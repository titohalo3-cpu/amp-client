export type EstadoVenta = 'pendiente' | 'completada' | 'cancelada';

/** Una venta registrada en la tienda (una línea por juego comprado). */
export interface Sale {
  id: number;
  videogameId: number;
  userId: number;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string; // 'AAAA-MM-DD'
  estado: EstadoVenta;
}
