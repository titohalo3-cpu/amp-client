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
      const texto =
        error.status === 0
          ? 'No hay conexión con la API. ¿Has arrancado json-server (npm run api)?'
          : `Error ${error.status} en ${req.method} ${req.url}`;
      avisos.error(texto);
      return throwError(() => error);
    }),
  );
};
