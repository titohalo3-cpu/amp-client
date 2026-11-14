import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, switchMap, throwError, timer } from 'rxjs';
import datosIniciales from '../../../../db.original.json';
import { API_URL } from '../../api.config';

type Registro = { id: string; [campo: string]: unknown };
type BaseDatos = Record<string, Registro[]>;

const CLAVE = 'amp-db';
const RETARDO = 200; // ms, para que se note que es asíncrono como una petición real

/**
 * MODO DEMO (solo en la versión publicada, donde no hay servidor Express).
 * Simula la API dentro del navegador: responde a las mismas URLs
 * (/videojuegos, /ventas, /usuarios, /usuarios/login y /usuarios/registro)
 * con los datos de db.original.json y guarda los cambios en localStorage.
 * Los servicios no cambian nada: siguen usando HttpClient y Observables.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) return next(req);

  const [coleccion, id] = req.url.slice(API_URL.length + 1).split('/');
  const bd = leerBD();
  if (coleccion === 'usuarios' && (id === 'login' || id === 'registro')) return auth(req, id, bd);
  const lista = bd[coleccion];
  if (!lista) return error(404, req);
  const indice = id ? lista.findIndex((r) => r.id === id) : -1;

  switch (req.method) {
    case 'GET': {
      if (id) return indice >= 0 ? ok(sinPassword(lista[indice])) : error(404, req);
      const filtros = req.params.keys(); // por ejemplo ?email=...
      return ok(lista.filter((r) => filtros.every((k) => String(r[k]) === req.params.get(k))).map(sinPassword));
    }
    case 'POST': {
      const nuevo = { ...(req.body as object), id: String(Date.now()) } as Registro;
      lista.push(nuevo);
      guardarBD(bd);
      return ok(nuevo, 201);
    }
    case 'PUT': {
      if (indice < 0) return error(404, req);
      lista[indice] = { ...lista[indice], ...(req.body as object), id } as Registro; // como findByIdAndUpdate
      guardarBD(bd);
      return ok(sinPassword(lista[indice]));
    }
    case 'DELETE': {
      if (indice < 0) return error(404, req);
      lista.splice(indice, 1);
      guardarBD(bd);
      return ok({ status: 'operación realizada' });
    }
  }
  return error(405, req);
};

/** Simula POST /usuarios/login y POST /usuarios/registro. */
function auth(req: HttpRequest<unknown>, accion: string, bd: BaseDatos): Observable<HttpResponse<unknown>> {
  const usuarios = bd['usuarios'];
  const cuerpo = (req.body ?? {}) as Record<string, string>;
  const existente = usuarios.find((u) => u['email'] === cuerpo['email']);

  if (accion === 'login') {
    return existente && existente['password'] === cuerpo['password']
      ? ok(sinPassword(existente))
      : error(401, req, 'Usuario/clave invalida');
  }
  if (existente) return error(400, req, 'Error al crear el usuario');
  usuarios.push({ ...cuerpo, rol: 'cliente', id: String(Date.now()) });
  guardarBD(bd);
  return ok({ status: 'usuario creado' }, 201);
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
      throwError(() => new HttpErrorResponse({ status, url: req.url, statusText: 'Error', error: mensaje ? { status: mensaje } : null })),
    ),
  );
}
