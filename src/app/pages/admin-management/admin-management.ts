import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EstadoVenta, Sale } from '../../models/sale.interface';
import { Rol, User } from '../../models/user.interface';
import { Filtro, Videogame } from '../../models/videogame.interface';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SaleService } from '../../services/sale.service';
import { UserService } from '../../services/user.service';
import { FILTRO_INICIAL, VideogameService } from '../../services/videogame.service';
import { FilterBar } from '../../shared/filter-bar/filter-bar';
import { PrecioFinalPipe } from '../../shared/precio-final.pipe';

type Pestana = 'juegos' | 'ventas' | 'usuarios';

/**
 * Panel de gestión (admin y trabajador). Tres tablas:
 * videojuegos, ventas y usuarios (esta última solo para el admin).
 */
@Component({
  selector: 'app-admin-management',
  imports: [CurrencyPipe, DatePipe, RouterLink, FilterBar, PrecioFinalPipe],
  templateUrl: './admin-management.html',
})
export class AdminManagement implements OnInit {
  protected auth = inject(AuthService);
  protected sales = inject(SaleService);
  private juegosSrv = inject(VideogameService);
  private usersSrv = inject(UserService);
  private avisos = inject(NotificationService);
  private route = inject(ActivatedRoute);

  protected pestana = signal<Pestana>((this.route.snapshot.queryParamMap.get('pestana') as Pestana) ?? 'ventas');
  protected esAdmin = computed(() => this.auth.hasRole('admin'));

  // ---------- Videojuegos ----------
  protected juegos = signal<Videogame[]>([]);
  protected filtro = signal<Filtro>(FILTRO_INICIAL);
  protected generos = computed(() => [...new Set(this.juegos().map((j) => j.genero))].sort());
  protected juegosFiltrados = computed(() => this.juegosSrv.filtrarYOrdenar(this.juegos(), this.filtro()));

  // ---------- Ventas ----------
  protected estados: EstadoVenta[] = ['pendiente', 'completada', 'cancelada'];
  protected columna = signal<keyof Sale>('fecha');
  protected asc = signal(false);
  protected estadoFiltro = signal<EstadoVenta | ''>('');
  protected ventasTabla = computed(() => {
    const c = this.columna();
    const dir = this.asc() ? 1 : -1;
    const estado = this.estadoFiltro();
    return this.sales
      .ventas()
      .filter((v) => !estado || v.estado === estado)
      .sort((a, b) => (a[c] > b[c] ? dir : a[c] < b[c] ? -dir : 0));
  });

  // ---------- Usuarios ----------
  protected roles: Rol[] = ['admin', 'trabajador', 'cliente'];
  protected usuarios = signal<User[]>([]);

  ngOnInit(): void {
    this.juegosSrv.getAll().subscribe((juegos) => this.juegos.set(juegos));
    this.sales.cargar().subscribe();
    if (this.esAdmin()) {
      this.usersSrv.getAll().subscribe((usuarios) => this.usuarios.set(usuarios));
    }
  }

  titulo(id: number): string {
    return this.juegos().find((j) => j.id === id)?.titulo ?? `Juego #${id} (eliminado)`;
  }

  // ---------- Acciones de videojuegos ----------
  eliminarJuego(juego: Videogame): void {
    const ventas = this.sales.ventas().filter((v) => v.videogameId === juego.id).length;
    const pregunta = ventas
      ? `"${juego.titulo}" tiene ${ventas} ventas registradas. ¿Eliminarlo igualmente?`
      : `¿Eliminar "${juego.titulo}" del catálogo?`;
    if (!confirm(pregunta)) return;
    this.juegosSrv.delete(juego.id).subscribe(() => {
      this.juegos.update((lista) => lista.filter((j) => j.id !== juego.id));
      this.avisos.ok(`"${juego.titulo}" eliminado`);
    });
  }

  // ---------- Acciones de ventas ----------
  ordenar(columna: keyof Sale): void {
    this.asc.set(this.columna() === columna ? !this.asc() : true);
    this.columna.set(columna);
  }

  flecha(columna: keyof Sale): string {
    return this.columna() === columna ? (this.asc() ? '▲' : '▼') : '';
  }

  cambiarEstado(venta: Sale, estado: string): void {
    this.sales
      .modificar({ ...venta, estado: estado as EstadoVenta })
      .subscribe(() => this.avisos.ok(`Venta #${venta.id}: ${estado}`));
  }

  cambiarCantidad(venta: Sale, valor: string): void {
    const cantidad = Number(valor);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      this.avisos.error('La cantidad tiene que ser un número entero mayor que 0');
      return;
    }
    const total = Math.round(venta.precioUnitario * cantidad * 100) / 100;
    this.sales
      .modificar({ ...venta, cantidad, total })
      .subscribe(() => this.avisos.ok(`Venta #${venta.id}: ${cantidad} uds.`));
  }

  eliminarVenta(venta: Sale): void {
    if (!confirm(`¿Eliminar la venta #${venta.id}?`)) return;
    this.sales.eliminar(venta.id).subscribe(() => this.avisos.ok(`Venta #${venta.id} eliminada`));
  }

  // ---------- Acciones de usuarios ----------
  cambiarRol(usuario: User, rol: string): void {
    this.usersSrv.cambiarRol(usuario.id, rol as Rol).subscribe((mod) => {
      this.usuarios.update((lista) => lista.map((u) => (u.id === mod.id ? mod : u)));
      this.avisos.ok(`${usuario.nombre} ahora es ${rol}`);
    });
  }

  eliminarUsuario(usuario: User): void {
    if (usuario.id === this.auth.session()?.user.id) {
      this.avisos.error('No puedes eliminar tu propia cuenta');
      return;
    }
    if (!confirm(`¿Eliminar a ${usuario.nombre}?`)) return;
    this.usersSrv.delete(usuario.id).subscribe(() => {
      this.usuarios.update((lista) => lista.filter((u) => u.id !== usuario.id));
      this.avisos.ok(`${usuario.nombre} eliminado`);
    });
  }
}
