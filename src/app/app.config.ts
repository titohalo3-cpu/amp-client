import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MODO_DEMO } from './api.config';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';

// Fechas y monedas en formato español (12,50 €, 4 de noviembre de 2026...)
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // En la versión publicada se añade el interceptor que simula json-server.
    provideHttpClient(withInterceptors(MODO_DEMO ? [errorInterceptor, mockApiInterceptor] : [errorInterceptor])),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};
