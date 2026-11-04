import { Videogame } from '../models/videogame.interface';

/** Precio con el descuento aplicado y redondeado a 2 decimales. */
export function precioFinal(juego: Videogame): number {
  return Math.round(juego.precio * (1 - juego.oferta / 100) * 100) / 100;
}
