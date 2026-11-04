import { Pipe, PipeTransform } from '@angular/core';
import { Videogame } from '../models/videogame.interface';
import { precioFinal } from './precio';

/** Pipe propio. Uso en plantilla: juego | precioFinal | currency:'EUR' */
@Pipe({ name: 'precioFinal' })
export class PrecioFinalPipe implements PipeTransform {
  transform(juego: Videogame): number {
    return precioFinal(juego);
  }
}
