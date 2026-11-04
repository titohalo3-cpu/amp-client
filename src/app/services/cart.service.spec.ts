import { TestBed } from '@angular/core/testing';
import { Videogame } from '../models/videogame.interface';
import { CartService } from './cart.service';

describe('CartService', () => {
  let cart: CartService;
  const juego = { id: 1, titulo: 'Juego de prueba', precio: 60, oferta: 50 } as Videogame;
  const otro = { id: 2, titulo: 'Otro juego', precio: 10, oferta: 0 } as Videogame;

  beforeEach(() => {
    localStorage.clear(); // que no se cuele un carrito guardado
    TestBed.configureTestingModule({});
    cart = TestBed.inject(CartService);
  });

  it('empieza vacío', () => {
    expect(cart.items()).toEqual([]);
    expect(cart.totalUnidades()).toBe(0);
  });

  it('suma unidades del mismo juego en una sola línea', () => {
    cart.add(juego);
    cart.add(juego);
    expect(cart.items().length).toBe(1);
    expect(cart.totalUnidades()).toBe(2);
  });

  it('cuenta juegos distintos en líneas distintas', () => {
    cart.add(juego);
    cart.add(otro);
    expect(cart.items().length).toBe(2);
    expect(cart.totalUnidades()).toBe(2);
  });

  it('aplica la oferta al precio total', () => {
    cart.add(juego); // 60 € con 50 % = 30 €
    cart.add(otro); // 10 €
    expect(cart.totalPrecio()).toBe(40);
  });

  it('quita la línea cuando la cantidad llega a 0', () => {
    cart.add(juego);
    cart.remove(1);
    expect(cart.items()).toEqual([]);
    expect(cart.totalUnidades()).toBe(0);
  });

  it('vacía el carrito con clear()', () => {
    cart.add(juego);
    cart.add(otro);
    cart.clear();
    expect(cart.totalUnidades()).toBe(0);
  });
});
