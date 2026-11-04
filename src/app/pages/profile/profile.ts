import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SaleService } from '../../services/sale.service';
import { VideogameService } from '../../services/videogame.service';

/** Perfil: datos de la sesión, cambio de nombre, permisos del rol y mis compras. */
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  protected auth = inject(AuthService);
  private sales = inject(SaleService);
  private juegosSrv = inject(VideogameService);
  private avisos = inject(NotificationService);
  private fb = inject(NonNullableFormBuilder);

  private juegos = toSignal(this.juegosSrv.getAll(), { initialValue: [] });

  protected form = this.fb.group({
    nombre: [this.auth.session()?.user.nombre ?? '', [Validators.required, Validators.minLength(3)]],
  });

  protected permisos = computed(() => {
    switch (this.auth.rol()) {
      case 'admin':
        return ['Catálogo y carrito', 'Gestionar videojuegos', 'Gestionar ventas', 'Gestionar usuarios y roles'];
      case 'trabajador':
        return ['Catálogo y carrito', 'Gestionar videojuegos', 'Gestionar ventas'];
      default:
        return ['Catálogo y carrito', 'Comprar y ver mis compras'];
    }
  });

  protected misCompras = computed(() => {
    const id = this.auth.session()?.user.id;
    return this.sales
      .ventas()
      .filter((v) => v.userId === id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  ngOnInit(): void {
    this.sales.cargar().subscribe();
  }

  titulo(id: number): string {
    return this.juegos().find((j) => j.id === id)?.titulo ?? 'Juego eliminado';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.actualizarNombre(this.form.getRawValue().nombre).subscribe(() => this.avisos.ok('Nombre actualizado'));
  }
}
