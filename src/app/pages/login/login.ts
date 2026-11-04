import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MODO_DEMO } from '../../api.config';
import { reiniciarDemo } from '../../core/interceptors/mock-api.interceptor';
import { AuthService } from '../../services/auth.service';

/** Formulario reactivo de inicio de sesión. */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected readonly demo = MODO_DEMO;
  protected error = signal('');
  protected cargando = signal(false);

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Rellena el formulario con una cuenta de prueba (para la demo). */
  rellenar(email: string, password: string): void {
    this.form.setValue({ email, password });
  }

  /** Solo en la versión publicada: vuelve a los datos iniciales. */
  restablecer(): void {
    reiniciarDemo();
    localStorage.removeItem('carrito');
    location.reload();
  }

  enviar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // así se ven todos los errores
      return;
    }
    this.cargando.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (ok) => {
        this.cargando.set(false);
        if (ok) this.router.navigate(['/dashboard']);
        else this.error.set('Email o contraseña incorrectos');
      },
      error: () => this.cargando.set(false),
    });
  }
}
