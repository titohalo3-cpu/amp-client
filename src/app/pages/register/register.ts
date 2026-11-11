import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { emailDisponible, passwordsIguales } from '../../shared/validators';

/** Formulario reactivo de registro con validadores síncronos, de grupo y asíncrono. */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private avisos = inject(NotificationService);

  protected error = signal('');

  protected form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      // [valor inicial, validadores síncronos, validadores asíncronos]
      email: ['', [Validators.required, Validators.email], [emailDisponible(this.auth)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*\d)(?=.*[a-zA-Z]).+$/)]],
      confirmar: ['', Validators.required],
      terminos: [false, Validators.requiredTrue],
    },
    { validators: passwordsIguales }, // validador de grupo
  );

  /** ¿Mostrar el error de este campo? (solo si el usuario ya lo ha tocado) */
  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.touched && control.invalid;
  }

  enviar(): void {
    this.error.set('');
    // pending = el validador asíncrono todavía está preguntando al servidor
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    const { confirmar, terminos, ...datos } = this.form.getRawValue();
    this.auth.register(datos).subscribe({
      next: () => {
        this.avisos.ok('Cuenta creada. Ya puedes entrar.');
        this.router.navigate(['/login']);
      },
      error: (e: Error) => this.error.set(e.message),
    });
  }
}
