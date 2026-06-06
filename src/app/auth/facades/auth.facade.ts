import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoginRequestDto, LoginResponseDto, RegisterUserDto, AuthUserDto } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthFacade {

  // ─── State ────────────────────────────────────────────────────────────────
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isLoggedIn  = computed(() => this.authService.isLoggedIn());
  readonly isAdmin     = computed(() => this.authService.isAdmin());

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // ─── Actions ──────────────────────────────────────────────────────────────

  register(dto: RegisterUserDto): Observable<AuthUserDto> {
    this.loading.set(true);
    this.error.set(null);
    return this.authService.register(dto).pipe(
      tap(() => this.loading.set(false)),
      catchError(err => {
        this.loading.set(false);
        this.error.set(this.extractError(err));
        return throwError(() => err);
      })
    );
  }

  login(dto: LoginRequestDto): Observable<LoginResponseDto> {
    this.loading.set(true);
    this.error.set(null);
    return this.authService.login(dto).pipe(
      tap(() => {
        this.loading.set(false);
        this.router.navigate(['/app/matches']);
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set(this.extractError(err));
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  clearError(): void {
    this.error.set(null);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private extractError(err: any): string {
    if (err?.status === 429) return 'Demasiadas solicitudes. Por favor espera un momento.';
    if (err?.status === 401) return 'Credenciales inválidas. Verifica tu usuario y contraseña.';
    if (err?.status === 400) return err?.error?.message ?? 'Datos inválidos. Revisa el formulario.';
    return err?.error?.message ?? 'Ocurrió un error inesperado. Intenta nuevamente.';
  }
}
