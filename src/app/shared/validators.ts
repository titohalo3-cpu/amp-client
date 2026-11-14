import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Validador de GRUPO: los campos password y confirmar deben ser iguales. */
export const passwordsIguales: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const password = grupo.get('password')?.value;
  const confirmar = grupo.get('confirmar')?.value;
  return password === confirmar ? null : { noCoinciden: true };
};

/** Validador de CAMPO: una fecha 'AAAA-MM-DD' no puede ser posterior a hoy. */
export const fechaNoFutura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const fecha = control.value as string;
  if (!fecha) return null; // de los vacíos ya se encarga Validators.required
  return fecha > new Date().toISOString().slice(0, 10) ? { fechaFutura: true } : null;
};

/** Validador de FORMARRAY: no se puede repetir el mismo valor (por ejemplo, dos veces "PC"). */
export const sinRepetidos: ValidatorFn = (lista: AbstractControl): ValidationErrors | null => {
  const valores = (lista.value as string[]).filter((v) => v !== '');
  return new Set(valores).size === valores.length ? null : { repetidos: true };
};

/**
 * Validador de GRUPO con parámetro: la cantidad no puede superar el stock del juego elegido.
 * Recibe una función que devuelve el stock de un juego (así no depende de cómo se cargan los juegos).
 */
export function cantidadDisponible(stockDe: (videogameId: string) => number | undefined): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const stock = stockDe(grupo.get('videogameId')?.value);
    const cantidad = Number(grupo.get('cantidad')?.value);
    return stock !== undefined && cantidad > stock ? { sinStock: { stock } } : null;
  };
}

/**
 * Validador ASÍNCRONO: pregunta al servidor si el email está libre.
 * timer(400) espera a que se deje de escribir; si el valor cambia antes,
 * Angular cancela la comprobación anterior y empieza otra.
 */
export function emailDisponible(auth: AuthService): AsyncValidatorFn {
  return (control: AbstractControl) =>
    timer(400).pipe(
      switchMap(() => auth.emailDisponible(control.value)),
      map((libre) => (libre ? null : { emailOcupado: true })),
      catchError(() => of(null)), // si el servidor falla, no bloqueamos el formulario
    );
}
