import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { Filtro, Orden } from '../../models/videogame.interface';
import { FILTRO_INICIAL } from '../../services/videogame.service';

/**
 * Componente ÚNICO de filtro. Se usa en el catálogo y en el panel de gestión.
 * Recibe los géneros con @Input y emite el filtro con @Output cada vez que cambia.
 */
@Component({
  selector: 'app-filter-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-bar.html',
})
export class FilterBar implements OnInit {
  @Input() generos: string[] = [];
  @Output() filtroChange = new EventEmitter<Filtro>();

  private fb = inject(NonNullableFormBuilder);
  private destroyRef = inject(DestroyRef);

  protected form = this.fb.group({
    texto: FILTRO_INICIAL.texto,
    genero: FILTRO_INICIAL.genero,
    soloOfertas: FILTRO_INICIAL.soloOfertas,
    valoracionMin: FILTRO_INICIAL.valoracionMin,
    orden: FILTRO_INICIAL.orden as Orden,
  });

  ngOnInit(): void {
    // Cada cambio del formulario (esperando 250 ms a que se deje de escribir) se emite al padre.
    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filtroChange.emit(this.form.getRawValue()));
  }

  limpiar(): void {
    this.form.reset(); // vuelve a los valores iniciales
  }
}
