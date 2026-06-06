import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { encryptedResponseInterceptor } from './auth/interceptors/encrypted-response.interceptor';

/**
 * Configuración principal de la aplicación Angular 18.
 *
 * Interceptores registrados (se ejecutan en orden):
 *  1. encryptedResponseInterceptor
 *     → Adjunta el JWT a cada request (reemplaza authInterceptor)
 *     → Descifra las respuestas cifradas { data: "<Base64>" } de los endpoints críticos
 *     → Maneja errores 401 (logout + redirect) y 429 (toast)
 *
 * El authInterceptor original queda reemplazado por este,
 * ya que ambas responsabilidades (JWT + descifrado) están unificadas aquí.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(
      withInterceptors([encryptedResponseInterceptor])
    ),
    provideAnimations(),
  ],
};
