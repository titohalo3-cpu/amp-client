import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, ElementRef, afterRenderEffect, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Videogame } from '../../models/videogame.interface';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { SaleService } from '../../services/sale.service';
import { VideogameService } from '../../services/videogame.service';
import { PrecioFinalPipe } from '../../shared/precio-final.pipe';
import { VideogameCard } from '../videogame-card/videogame-card';

Chart.register(...registerables);
Chart.defaults.color = '#9aa0ad';
Chart.defaults.borderColor = '#2a2e38';
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const PALETA = ['#ff4d2e', '#7b6cff', '#2fbf71', '#f5b942', '#22b8cf', '#e64980', '#a9e34b', '#fd7e14', '#9aa0ad', '#748ffc', '#63e6be', '#ffa8a8'];

/** Pantalla de inicio: resumen, ofertas en directo, gráficos y más vendidos. */
@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, CurrencyPipe, DatePipe, RouterLink, PrecioFinalPipe, VideogameCard],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private juegosSrv = inject(VideogameService);
  private cart = inject(CartService);
  private avisos = inject(NotificationService);
  protected sales = inject(SaleService);
  protected auth = inject(AuthService);

  /** Observable que se refresca cada 30 s. Se muestra con el pipe async. */
  protected ofertas$ = this.juegosSrv.ofertas$;

  /** Observable convertido en signal. */
  protected juegos = toSignal(this.juegosSrv.getAll(), { initialValue: [] as Videogame[] });

  protected esGestor = computed(() => this.auth.hasRole('admin', 'trabajador'));

  /** Los 5 juegos con más unidades vendidas (sin contar canceladas). */
  protected topVendidos = computed(() => {
    const unidades = new Map<number, number>();
    for (const v of this.sales.validas()) {
      unidades.set(v.videogameId, (unidades.get(v.videogameId) ?? 0) + v.cantidad);
    }
    return this.juegos()
      .map((juego) => ({ juego, unidades: unidades.get(juego.id) ?? 0 }))
      .filter((t) => t.unidades > 0)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5);
  });

  /** Ingresos de cada mes (ventas no canceladas). */
  protected ventasPorMes = computed(() => {
    const meses = new Array(12).fill(0);
    for (const v of this.sales.validas()) {
      meses[Number(v.fecha.slice(5, 7)) - 1] += v.total;
    }
    return meses.map((m) => Math.round(m * 100) / 100);
  });

  /** Unidades vendidas por género. */
  protected unidadesPorGenero = computed(() => {
    const porGenero = new Map<string, number>();
    for (const v of this.sales.validas()) {
      const genero = this.juegos().find((j) => j.id === v.videogameId)?.genero ?? 'Otros';
      porGenero.set(genero, (porGenero.get(genero) ?? 0) + v.cantidad);
    }
    return [...porGenero.entries()].sort((a, b) => b[1] - a[1]);
  });

  private lienzoMes = viewChild<ElementRef<HTMLCanvasElement>>('graficoMes');
  private lienzoGenero = viewChild<ElementRef<HTMLCanvasElement>>('graficoGenero');

  constructor() {
    this.sales.cargar().subscribe();

    // Se ejecuta después de pintar y cada vez que cambian los datos que lee:
    // destruye los gráficos viejos y crea los nuevos.
    afterRenderEffect((onCleanup) => {
      const mes = this.lienzoMes()?.nativeElement;
      const genero = this.lienzoGenero()?.nativeElement;
      if (!mes || !genero) return;

      const barras = new Chart(mes, {
        type: 'bar',
        data: {
          labels: MESES,
          datasets: [{ label: 'Ingresos (€)', data: this.ventasPorMes(), backgroundColor: '#ff4d2e', borderRadius: 6 }],
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });

      const generos = this.unidadesPorGenero();
      const donut = new Chart(genero, {
        type: 'doughnut',
        data: {
          labels: generos.map(([g]) => g),
          datasets: [{ data: generos.map(([, n]) => n), backgroundColor: PALETA, borderWidth: 0 }],
        },
        options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right' } } },
      });

      onCleanup(() => {
        barras.destroy();
        donut.destroy();
      });
    });
  }

  agregar(juego: Videogame): void {
    this.cart.add(juego);
    this.avisos.ok(`"${juego.titulo}" añadido al carrito`);
  }
}
