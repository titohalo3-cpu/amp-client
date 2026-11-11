import { FormControl, FormGroup } from '@angular/forms';
import { cantidadDisponible, fechaNoFutura, passwordsIguales, sinRepetidos } from './validators';

describe('Validadores propios', () => {
  it('passwordsIguales detecta contraseñas distintas', () => {
    const grupo = new FormGroup({ password: new FormControl('abc123'), confirmar: new FormControl('abc999') });
    expect(passwordsIguales(grupo)).toEqual({ noCoinciden: true });
    grupo.controls.confirmar.setValue('abc123');
    expect(passwordsIguales(grupo)).toBeNull();
  });

  it('fechaNoFutura rechaza fechas posteriores a hoy', () => {
    expect(fechaNoFutura(new FormControl('2999-01-01'))).toEqual({ fechaFutura: true });
    expect(fechaNoFutura(new FormControl('2020-05-10'))).toBeNull();
  });

  it('sinRepetidos detecta plataformas duplicadas', () => {
    expect(sinRepetidos(new FormControl(['PC', 'PC']))).toEqual({ repetidos: true });
    expect(sinRepetidos(new FormControl(['PC', 'Switch']))).toBeNull();
  });

  it('cantidadDisponible no deja vender más que el stock', () => {
    const validador = cantidadDisponible((id) => (id === 1 ? 5 : undefined));
    const grupo = new FormGroup({ videogameId: new FormControl(1), cantidad: new FormControl(8) });
    expect(validador(grupo)).toEqual({ sinStock: { stock: 5 } });
    grupo.controls.cantidad.setValue(5);
    expect(validador(grupo)).toBeNull();
  });
});
