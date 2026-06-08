import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const token = authService.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const message = err.error?.message ?? '';

        if (message === 'Credenciales inválidas.') {
          return throwError(() => err);
        }

        authService.logout();
        router.navigate(['/auth/login']);
        toastService.error(
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        );
      }

      if (err.status === 429) {
        toastService.warning(
          'Demasiadas solicitudes. Por favor espera un momento antes de continuar.',
        );
      }

      return throwError(() => err);
    }),
  );
};
