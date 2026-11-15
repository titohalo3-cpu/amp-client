import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EstadoVenta } from '../../models/sale.interface';
import { User } from '../../models/user.interface';
import { Videogame } from '../../models/videogame.interface';
import { NotificationService } from '../../services/notification.service';
import { SaleService } from '../../services/sale.service';
import { UserService } from '../../services/user.service';
import { VideogameService } from '../../services/videogame.service';
import { precioFinal } from '../../shared/precio';
import { cantidadDisponible, fechaNoFutura } from '../../shared/validators';

/**
 * Alta y edición de ventas desde gestión. Ruta: admin/venta/:id ('nueva' o un número).
 * Formulario reactivo con desplegables que se rellenan por HTTP, un campo que se
 * calcula solo (precio al elegir juego), un total en directo y un validador de grupo (stock).
 */
@Component({
  selector: 'app-sale-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './sale-form.html',
})
export class SaleForm {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sales = inject(SaleService);
  private juegosSrv = inject(VideogameService);
  private usersSrv = inject(UserService);
  private avisos = inject(NotificationService);
  private fb = inject(NonNullableFormBuilder);

  protected id = this.route.snapshot.paramMap.get('id') ?? 'nueva';
  protected esNueva = this.id === 'nueva';
  protected guardando = signal(false);
  protected estados: EstadoVenta[] = ['pendiente', 'completada', 'cancelada'];

  // Datos de los desplegables (Observable → signal)
  protected juegos = toSignal(this.juegosSrv.getAll(), { initialValue: [] as Videogame[] });
  protected usuarios = toSignal(this.usersSrv.getAll(), { initialValue: [] as User[] });

  protected form = this.fb.group(
    {
      videogameId: ['', Validators.required],
      userId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      fecha: [new Date().toISOString().slice(0, 10), [Validators.required, fechaNoFutura]],
      estado: ['pendiente' as EstadoVenta, Validators.required],
    },
    // Validador de grupo: mira dos campos (juego y cantidad) y el stock del juego
    { validators: cantidadDisponible((id) => this.juegos().find((j) => j.id === id)?.stock) },
  );

  /** El valor del formulario como signal: cada vez que se escribe, se actualiza. */
  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected juegoElegido = computed(() => this.juegos().find((j) => j.id === this.valores().videogameId));
  protected total = computed(() => {
    const { cantidad = 0, precioUnitario = 0 } = this.valores();
    return Math.round(Number(cantidad) * Number(precioUnitario) * 100) / 100;
  });

  constructor() {
    if (!this.esNueva) {
      this.sales.obtener(this.id).subscribe((venta) => this.form.patchValue(venta));
    }
  }

  /** Al elegir un juego en el desplegable se pone su precio actual (con la oferta aplicada). */
  ponerPrecio(id: string): void {
    const juego = this.juegos().find((j) => j.id === id);
    if (juego) this.form.controls.precioUnitario.setValue(precioFinal(juego));
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.touched && control.invalid;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const datos = { ...v, cantidad: Number(v.cantidad), total: this.total() };
    const peticion = this.esNueva ? this.sales.crear(datos) : this.sales.modificar({ ...datos, id: this.id });

    this.guardando.set(true);
    peticion.subscribe({
      next: (venta) => {
        this.avisos.ok(this.esNueva ? `Venta #${venta.id.slice(-6)} registrada` : `Venta #${venta.id.slice(-6)} modificada`);
        this.router.navigate(['/admin'], { queryParams: { pestana: 'ventas' } });
      },
      error: () => this.guardando.set(false),
    });
  }
}
