import { isDevMode } from '@angular/core';

/**
 * true en la versión publicada (ng build): no hay servidor y
 * el interceptor mockApiInterceptor simula la API en el navegador.
 * false con npm start: se usa la API Express + MongoDB de verdad.
 */
export const MODO_DEMO = !isDevMode();

/** Dirección de la API Express (`npm run api`). */
export const API_URL = 'http://localhost:3000';
