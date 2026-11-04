import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, switchMap, throwError, timer } from 'rxjs';
import datosIniciales from '../../../../db.original.json';
import { API_URL } from '../../api.config';

type Registro = { id: number; [campo: string]: unknown };
type BaseDatos = Record<string, Registro[]>;

const CLAVE = 'amp-db';
const RETARDO = 200; // ms, para que se note que es asíncrono como una petición real

/**
 * MODO DEMO (solo en la versión publicada, donde no hay json-server).
 * Simula json-server dentro del navegador: responde a las mismas URLs
 * (GET, POST, PUT, PATCH, DELETE y filtros como ?email=) con los datos
 * de db.original.json y guarda los cambios en localStorage.
 * Los servicios no cambian nada: siguen usando HttpClient y Observables.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) return next(req);

  const [coleccion, idTexto] = req.url.slice(API_URL.length + 1).split('/');
  const bd = leerBD();
  const lista = bd[coleccion];
  if (!lista) return error(404, req);

  const id = idTexto ? Number(idTexto) : null;
  const indice = id === null ? -1 : lista.findIndex((r) => r.id === id);

  switch (req.method) {
    case 'GET': {
      if (id !== null) return indice >= 0 ? ok(lista[indice]) : error(404, req);
      const filtros = req.params.keys();
      return ok(lista.filter((r) => filtros.every((k) => String(r[k]) === req.params.get(k))));
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
      return ok(lista[indice]);
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

function error(status: number, req: HttpRequest<unknown>): Observable<never> {
  return timer(RETARDO).pipe(
    switchMap(() => throwError(() => new HttpErrorResponse({ status, url: req.url, statusText: 'Error' }))),
  );
}
