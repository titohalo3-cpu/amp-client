import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Rol } from './models/user.interface';
import { Cart } from './pages/cart/cart';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { Register } from './pages/register/register';
import { VideogameDetail } from './pages/videogame-detail/videogame-detail';
import { VideogameForm } from './pages/videogame-form/videogame-form';
import { VideogameList } from './pages/videogame-list/videogame-list';

/** Roles que pueden entrar en la parte de gestión. */
const gestores = { roles: ['admin', 'trabajador'] as Rol[] };

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Entrar · AmpClient' },
  { path: 'registro', component: Register, title: 'Registro · AmpClient' },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard], title: 'Inicio · AmpClient' },
  { path: 'videojuegos', component: VideogameList, canActivate: [authGuard], title: 'Videojuegos · AmpClient' },
  { path: 'detalle/:id', component: VideogameDetail, canActivate: [authGuard], title: 'Detalle · AmpClient' },
  { path: 'carrito', component: Cart, canActivate: [authGuard], title: 'Carrito · AmpClient' },
  { path: 'perfil', component: Profile, canActivate: [authGuard], title: 'Perfil · AmpClient' },
  {
    // Lazy loading: este componente solo se descarga cuando alguien entra en /admin
    path: 'admin',
    loadComponent: () => import('./pages/admin-management/admin-management').then((m) => m.AdminManagement),
    canActivate: [authGuard, roleGuard],
    data: gestores,
    title: 'Gestión · AmpClient',
  },
  {
    // :id puede ser un número (editar) o la palabra 'nuevo' (crear)
    path: 'admin/videojuego/:id',
    component: VideogameForm,
    canActivate: [authGuard, roleGuard],
    data: gestores,
    title: 'Editar videojuego · AmpClient',
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
