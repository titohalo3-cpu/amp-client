import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { VideogameService } from '../../services/videogame.service';

/**
 * Alta y edición de videojuegos. Ruta: admin/videojuego/:id
 * - Si :id es 'nuevo' → formulario vacío y POST al guardar.
 * - Si :id es un número → carga el juego y PUT al guardar.
 */
@Component({
  selector: 'app-videogame-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './videogame-form.html',
})
export class VideogameForm {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private juegosSrv = inject(VideogameService);
  private avisos = inject(NotificationService);
  private fb = inject(NonNullableFormBuilder);

  protected id = this.route.snapshot.paramMap.get('id') ?? 'nuevo';
  protected esNuevo = this.id === 'nuevo';
  protected guardando = signal(false);

  protected generos = ['Acción', 'Aventura', 'Carreras', 'Deportes', 'Metroidvania', 'Plataformas', 'Puzles', 'RPG', 'Roguelike', 'Sandbox', 'Simulación', 'Terror'];

  protected form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    genero: ['', Validators.required],
    plataformas: ['', Validators.required], // texto separado por comas
    precio: [19.99, [Validators.required, Validators.min(0.01)]],
    oferta: [0, [Validators.required, Validators.min(0), Validators.max(90)]],
    valoracion: [4, [Validators.required, Validators.min(0), Validators.max(5)]],
    stock: [10, [Validators.required, Validators.min(0)]],
    fechaLanzamiento: [new Date().toISOString().slice(0, 10), Validators.required],
    imagen: ['img/generica.svg', Validators.required],
    descripcion: ['', Validators.maxLength(300)],
  });

  constructor() {
    if (!this.esNuevo) {
      this.juegosSrv.getById(Number(this.id)).subscribe((juego) =>
        // patchValue rellena los campos que coinciden por nombre
        this.form.patchValue({ ...juego, plataformas: juego.plataformas.join(', ') }),
      );
    }
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
    const valores = this.form.getRawValue();
    const datos = {
      ...valores,
      plataformas: valores.plataformas
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p !== ''),
    };
    const peticion = this.esNuevo
      ? this.juegosSrv.create(datos)
      : this.juegosSrv.update({ ...datos, id: Number(this.id) });

    this.guardando.set(true);
    peticion.subscribe({
      next: (juego) => {
        this.avisos.ok(this.esNuevo ? `"${juego.titulo}" añadido al catálogo` : 'Cambios guardados');
        this.router.navigate(['/admin'], { queryParams: { pestana: 'juegos' } });
      },
      error: () => this.guardando.set(false),
    });
  }
}
