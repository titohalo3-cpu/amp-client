import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../../models/user.interface';
import { AuthService } from '../../services/auth.service';

/** Deja pasar solo a los roles indicados en data: { roles: [...] } de la ruta. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const roles = route.data['roles'] as Rol[];
  return auth.hasRole(...roles) || inject(Router).createUrlTree(['/dashboard']);
};
