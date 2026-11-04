import { Videogame } from './videogame.interface';

/** Una línea del carrito: el juego y cuántas unidades lleva. */
export interface CartItem {
  videogame: Videogame;
  cantidad: number;
}
