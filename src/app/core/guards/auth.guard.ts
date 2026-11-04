import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/** Deja pasar solo si hay sesión. Si no, manda al login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLogged() || inject(Router).createUrlTree(['/login']);
};
