/** Los tres perfiles de la aplicación. */
export type Rol = 'admin' | 'trabajador' | 'cliente';

/** Usuario tal y como está guardado en db.json. */
export interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

/** Usuario sin la contraseña: es lo único que guardamos en la sesión. */
export type UsuarioSesion = Omit<User, 'password'>;

/** Sesión activa: quién ha entrado y cuándo. */
export interface Session {
  user: UsuarioSesion;
  inicio: string; // fecha ISO del login
}
