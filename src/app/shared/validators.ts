import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Validador de grupo: los campos password y confirmar deben ser iguales. */
export const passwordsIguales: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const password = grupo.get('password')?.value;
  const confirmar = grupo.get('confirmar')?.value;
  return password === confirmar ? null : { noCoinciden: true };
};
