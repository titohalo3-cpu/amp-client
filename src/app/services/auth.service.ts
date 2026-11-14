import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { API_URL } from '../api.config';
import { Rol, Session, UsuarioSesion } from '../models/user.interface';

/**
 * Sesión del usuario: login, registro, logout, rol y permisos.
 * La contraseña la comprueba el servidor Express (POST /usuarios/login),
 * que nunca devuelve contraseñas. La sesión vive en una signal y se copia
 * en localStorage para que siga al recargar la página.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private url = `${API_URL}/usuarios`;

  // Signal privada: solo este servicio puede cambiarla.
  private readonly _session = signal<Session | null>(this.leerSesion());

  // Lo que ven los componentes (solo lectura y valores derivados).
  readonly session = this._session.asReadonly();
  readonly isLogged = computed(() => this._session() !== null);
  readonly rol = computed(() => this._session()?.user.rol ?? null);

  /** POST /usuarios/login. Devuelve true si entra y false si el email o la contraseña no son correctos. */
  login(email: string, password: string): Observable<boolean> {
    return this.http.post<UsuarioSesion>(`${this.url}/login`, { email, password }).pipe(
      tap((user) => this.guardarSesion(user)),
      map(() => true),
      // 401 = credenciales incorrectas: no es un fallo de la app, es un "no"
      catchError((e: HttpErrorResponse) => (e.status === 401 ? of(false) : throwError(() => e))),
    );
  }

  /** POST /usuarios/registro. El servidor pone el rol cliente. */
  register(datos: { nombre: string; email: string; password: string }): Observable<unknown> {
    return this.http
      .post(`${this.url}/registro`, datos)
      .pipe(catchError((e: HttpErrorResponse) => throwError(() => new Error(e.error?.status ?? 'No se pudo crear la cuenta'))));
  }

  /** GET /usuarios?email=... → true si nadie tiene ese email (lo usa el validador asíncrono del registro). */
  emailDisponible(email: string): Observable<boolean> {
    return this.http.get<UsuarioSesion[]>(this.url, { params: { email } }).pipe(map((lista) => lista.length === 0));
  }

  /** PUT /usuarios/:id con el nombre nuevo, y actualiza la sesión. */
  actualizarNombre(nombre: string): Observable<UsuarioSesion> {
    const id = this._session()!.user.id;
    return this.http.put<UsuarioSesion>(`${this.url}/${id}`, { nombre }).pipe(tap((user) => this.guardarSesion(user)));
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

  private guardarSesion(user: UsuarioSesion): void {
    const sesion: Session = { user, inicio: this._session()?.inicio ?? new Date().toISOString() };
    localStorage.setItem('sesion', JSON.stringify(sesion));
    this._session.set(sesion);
  }

  private leerSesion(): Session | null {
    const guardada = localStorage.getItem('sesion');
    return guardada ? JSON.parse(guardada) : null;
  }
}
