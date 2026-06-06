import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { EncryptionUtil } from '../../shared/utils/encryption.util';
import { environment } from '../../../environments/environment';

/**
 * Rutas críticas cuyas respuestas vienen cifradas desde el backend.
 * Deben coincidir con las definidas en EncryptionResponseMiddleware.
 */
const ENCRYPTED_ROUTES = [
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/predictions',
  '/api/v1/admin/matches',
];

/**
 * Verifica si una URL corresponde a un endpoint cuya respuesta viene cifrada.
 */
function isCriticalRoute(url: string): boolean {
  return ENCRYPTED_ROUTES.some(route =>
    url.toLowerCase().includes(route.toLowerCase())
  );
}

/**
 * Verifica si el body de la respuesta es un wrapper cifrado { data: string }.
 */
function isEncryptedWrapper(body: unknown): body is { data: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'data' in body &&
    typeof (body as { data: unknown }).data === 'string'
  );
}

/**
 * Interceptor de respuestas cifradas.
 *
 * Flujo:
 *  1. Detecta si la respuesta viene de un endpoint crítico.
 *  2. Verifica si el body tiene formato { "data": "<Base64 AES>" }.
 *  3. Descifra el Base64 con AES-256-CBC.
 *  4. Parsea el JSON resultante.
 *  5. Reemplaza el body de la respuesta con el DTO original.
 *
 * Los servicios (AuthService, PredictionService, AdminService) reciben
 * el DTO limpio sin saber que hubo cifrado.
 *
 * Cuando `environment.encryption.enabled` es false (desarrollo),
 * el interceptor pasa la respuesta sin modificar.
 *
 * Este interceptor también maneja los errores 401 y 429 globalmente.
 */
export const encryptedResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const authService  = inject(AuthService);
  const router       = inject(Router);
  const toastService = inject(ToastService);

  // Adjuntar JWT al request
  const token = authService.token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(

    map(event => {
      // Solo procesar HttpResponse con body
      if (!(event instanceof HttpResponse)) return event;

      // Si el cifrado está deshabilitado o la ruta no es crítica, devolver sin modificar
      if (!environment.encryption.enabled || !isCriticalRoute(req.url)) {
        return event;
      }

      // Si el body no tiene formato cifrado, devolver sin modificar
      if (!isEncryptedWrapper(event.body)) {
        return event;
      }

      try {
        // Descifrar el payload
        const decryptedJson = EncryptionUtil.decrypt(event.body.data);

        if (!decryptedJson) {
          throw new Error('El payload descifrado está vacío.');
        }

        // Parsear el JSON descifrado al DTO original
        const decryptedBody = JSON.parse(decryptedJson);

        // Retornar la respuesta con el body descifrado
        return event.clone({ body: decryptedBody });

      } catch (error) {
        console.error('[EncryptedResponseInterceptor] Error al descifrar respuesta:', error);
        // En caso de error de descifrado, devolver la respuesta cifrada tal cual
        // para no romper el flujo — el servicio manejará el formato inesperado
        return event;
      }
    }),

    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
        toastService.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      }

      if (err.status === 429) {
        toastService.warning('Demasiadas solicitudes. Por favor espera un momento antes de continuar.');
      }

      return throwError(() => err);
    })
  );
};
