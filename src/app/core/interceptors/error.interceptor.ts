import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

/**
 * Pasa por aquí TODA petición HTTP. Si falla, muestra un aviso
 * y así ningún componente tiene que repetir este código.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const avisos = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 (login incorrecto) y 409 (email repetido) los explica el propio formulario
      if (error.status === 401 || error.status === 409) return throwError(() => error);

      const texto =
        error.status === 0
          ? 'No hay conexión con la API. ¿Has arrancado el servidor Express (npm run api)?'
          : (error.error?.error ?? `Error ${error.status} en ${req.method} ${req.url}`); // mensaje que manda Express
      avisos.error(texto);
      return throwError(() => error);
    }),
  );
};
