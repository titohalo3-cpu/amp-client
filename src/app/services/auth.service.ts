import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, switchMap, tap, throwError } from 'rxjs';
import { API_URL } from '../api.config';
import { Rol, Session, User } from '../models/user.interface';

/**
 * Sesión del usuario: login, registro, logout, rol y permisos.
 * El estado vive en una signal y se copia en localStorage
 * para que la sesión siga al recargar la página.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = `${API_URL}/users`;

  // Signal privada: solo este servicio puede cambiarla.
  private readonly _session = signal<Session | null>(this.leerSesion());

  // Lo que ven los componentes (solo lectura y valores derivados).
  readonly session = this._session.asReadonly();
  readonly isLogged = computed(() => this._session() !== null);
  readonly rol = computed(() => this._session()?.user.rol ?? null);

  /** Busca el usuario por email y comprueba la contraseña. Devuelve true si entra. */
  login(email: string, password: string): Observable<boolean> {
    return this.http.get<User[]>(this.url, { params: { email } }).pipe(
      map((users) => users.find((u) => u.password === password)),
      tap((user) => {
        if (user) this.guardarSesion(user);
      }),
      map((user) => user !== undefined),
    );
  }

  /** Crea un usuario nuevo con rol cliente (si el email no existe ya). */
  register(datos: { nombre: string; email: string; password: string }): Observable<User> {
    return this.http.get<User[]>(this.url, { params: { email: datos.email } }).pipe(
      switchMap((existentes) =>
        existentes.length > 0
          ? throwError(() => new Error('Ese email ya está registrado'))
          : this.http.post<User>(this.url, { ...datos, rol: 'cliente' }),
      ),
    );
  }

  /** Cambia el nombre del usuario en la API y en la sesión. */
  actualizarNombre(nombre: string): Observable<User> {
    const id = this._session()!.user.id;
    return this.http
      .patch<User>(`${this.url}/${id}`, { nombre })
      .pipe(tap((user) => this.guardarSesion(user)));
  }

  /** ¿El usuario tiene alguno de estos roles? */
  hasRole(...roles: Rol[]): boolean {
    const rol = this.rol();
    return rol !== null && roles.includes(rol);
  }

  logout(): void {
    localStorage.removeItem('sesion');
    this._session.set(null);
    this.router.navigate(['/login']);
  }

  private guardarSesion({ password, ...user }: User): void {
    const sesion: Session = { user, inicio: this._session()?.inicio ?? new Date().toISOString() };
    localStorage.setItem('sesion', JSON.stringify(sesion));
    this._session.set(sesion);
  }

  private leerSesion(): Session | null {
    const guardada = localStorage.getItem('sesion');
    return guardada ? JSON.parse(guardada) : null;
  }
}
