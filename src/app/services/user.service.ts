import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Rol, User } from '../models/user.interface';

/** Gestión de la tabla de usuarios (solo la usa el admin). */
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private url = `${API_URL}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  cambiarRol(id: number, rol: Rol): Observable<User> {
    return this.http.patch<User>(`${this.url}/${id}`, { rol });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
