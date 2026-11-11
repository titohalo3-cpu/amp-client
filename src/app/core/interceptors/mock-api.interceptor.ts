import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, switchMap, throwError, timer } from 'rxjs';
import datosIniciales from '../../../../db.original.json';
import { API_URL } from '../../api.config';

type Registro = { id: number; [campo: string]: unknown };
type BaseDatos = Record<string, Registro[]>;

const CLAVE = 'amp-db';
const RETARDO = 200; // ms, para que se note que es asíncrono como una petición real

/**
 * MODO DEMO (solo en la versión publicada, donde no hay servidor Express).
 * Simula la API Express dentro del navegador: responde a las mismas URLs
 * (GET, POST, PUT, PATCH, DELETE, filtros y /auth) con los datos
 * de db.original.json y guarda los cambios en localStorage.
 * Los servicios no cambian nada: siguen usando HttpClient y Observables.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  // Las contraseñas de db.original.json están en claro solo para esta demo; Express las guarda con bcrypt.
  if (!req.url.startsWith(API_URL)) return next(req);

  const [coleccion, idTexto] = req.url.slice(API_URL.length + 1).split('/');
  const bd = leerBD();
  if (coleccion === 'auth') return auth(req, idTexto, bd);
  const lista = bd[coleccion];
  if (!lista) return error(404, req);

  const id = idTexto ? Number(idTexto) : null;
  const indice = id === null ? -1 : lista.findIndex((r) => r.id === id);

  switch (req.method) {
    case 'GET': {
      if (id !== null) return indice >= 0 ? ok(coleccion === 'users' ? sinPassword(lista[indice]) : lista[indice]) : error(404, req);
      const filtros = req.params.keys();
      const resultado = lista.filter((r) => filtros.every((k) => String(r[k]) === req.params.get(k)));
      return ok(coleccion === 'users' ? resultado.map(sinPassword) : resultado);
    }
    case 'POST': {
      const nuevo = { ...(req.body as object), id: Math.max(0, ...lista.map((r) => r.id)) + 1 } as Registro;
      lista.push(nuevo);
      guardarBD(bd);
      return ok(nuevo, 201);
    }
    case 'PUT':
    case 'PATCH': {
      if (indice < 0) return error(404, req);
      const anterior = req.method === 'PATCH' ? lista[indice] : {};
      lista[indice] = { ...anterior, ...(req.body as object), id: id! } as Registro;
      guardarBD(bd);
      return ok(coleccion === 'users' ? sinPassword(lista[indice]) : lista[indice]);
    }
    case 'DELETE': {
      if (indice < 0) return error(404, req);
      lista.splice(indice, 1);
      guardarBD(bd);
      return ok({});
    }
  }
  return error(405, req);
};

/** Simula las rutas /auth de Express (login, registro y email-disponible). */
function auth(req: HttpRequest<unknown>, accion: string, bd: BaseDatos): Observable<HttpResponse<unknown>> {
  const usuarios = bd['users'];
  const cuerpo = (req.body ?? {}) as Record<string, string>;
  const buscar = (email: string) => usuarios.find((u) => String(u['email']).toLowerCase() === email.toLowerCase());

  if (accion === 'login') {
    const usuario = buscar(cuerpo['email'] ?? '');
    return usuario && usuario['password'] === cuerpo['password']
      ? ok(sinPassword(usuario))
      : error(401, req, 'Email o contraseña incorrectos');
  }
  if (accion === 'registro') {
    if (buscar(cuerpo['email'] ?? '')) return error(409, req, 'Ese email ya está registrado');
    const nuevo: Registro = { ...cuerpo, rol: 'cliente', id: Math.max(0, ...usuarios.map((u) => u.id)) + 1 };
    usuarios.push(nuevo);
    guardarBD(bd);
    return ok(sinPassword(nuevo), 201);
  }
  if (accion.startsWith('email-disponible')) {
    return ok({ disponible: !buscar(req.params.get('email') ?? '') });
  }
  return error(404, req);
}

function sinPassword({ password, ...resto }: Registro): Registro {
  return resto as Registro;
}

/** Borra los cambios de la demo y vuelve a los datos de db.original.json. */
export function reiniciarDemo(): void {
  localStorage.removeItem(CLAVE);
}

function leerBD(): BaseDatos {
  try {
    const guardada = localStorage.getItem(CLAVE);
    if (guardada) return JSON.parse(guardada);
  } catch {
    /* si localStorage falla, se usan los datos iniciales */
  }
  return structuredClone(datosIniciales) as unknown as BaseDatos;
}

function guardarBD(bd: BaseDatos): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(bd));
  } catch {
    /* sin localStorage los cambios duran hasta recargar */
  }
}

function ok<T>(body: T, status = 200): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status, body })).pipe(delay(RETARDO));
}

function error(status: number, req: HttpRequest<unknown>, mensaje?: string): Observable<never> {
  return timer(RETARDO).pipe(
    switchMap(() =>
      throwError(() => new HttpErrorResponse({ status, url: req.url, statusText: 'Error', error: mensaje ? { error: mensaje } : null })),
    ),
  );
}
