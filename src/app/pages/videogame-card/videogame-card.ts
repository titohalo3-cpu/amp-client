import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Videogame } from '../../models/videogame.interface';
import { PrecioFinalPipe } from '../../shared/precio-final.pipe';

/**
 * Componente HIJO: ficha de un videojuego.
 * Recibe el juego con @Input y avisa al padre con @Output cuando se pulsa "+ Carrito".
 * No sabe nada del carrito: solo emite el evento.
 */
@Component({
  selector: 'app-videogame-card',
  imports: [RouterLink, CurrencyPipe, PrecioFinalPipe],
  templateUrl: './videogame-card.html',
})
export class VideogameCard {
  @Input({ required: true }) juego!: Videogame;
  @Output() agregar = new EventEmitter<Videogame>();
}
