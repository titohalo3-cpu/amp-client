import { isDevMode } from '@angular/core';

/**
 * true en la versión publicada (ng build): no hay json-server y
 * el interceptor mockApiInterceptor simula la API en el navegador.
 * false con npm start: se usa json-server de verdad.
 */
export const MODO_DEMO = !isDevMode();

/** Dirección de la API REST que levanta json-server con `npm run api`. */
export const API_URL = 'http://localhost:3000';
