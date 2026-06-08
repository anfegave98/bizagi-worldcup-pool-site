import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../../facades/auth.facade';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen bg-gradient-hero flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md animate-fade-in">
        <!-- Logo / Header -->
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                      bg-gradient-primary shadow-glow mb-4"
          >
            <span class="text-3xl">⚽</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Polla Mundialista</h1>
          <p class="text-slate-500 text-sm mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        <!-- Card -->
        <div class="card animate-slide-up">
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Error global -->
              @if (facade.error()) {
                <div
                  class="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200
                            text-red-700 text-sm animate-slide-down"
                >
                  <span class="mt-0.5">⚠</span>
                  <span>{{ facade.error() }}</span>
                </div>
              }

              <!-- Usuario o email -->
              <div>
                <label class="label">Usuario o correo electrónico</label>
                <input
                  formControlName="userNameOrEmail"
                  type="text"
                  placeholder="tu_usuario o correo@ejemplo.com"
                  class="input"
                  [class.input-error]="isInvalid('userNameOrEmail')"
                  autocomplete="username"
                />
                @if (isInvalid('userNameOrEmail')) {
                  <p class="error-msg">⚠ Este campo es requerido.</p>
                }
              </div>

              <!-- Contraseña -->
              <div>
                <label class="label">Contraseña</label>
                <div class="relative">
                  <input
                    formControlName="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="input pr-11"
                    [class.input-error]="isInvalid('password')"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                           hover:text-slate-600 transition-colors text-sm"
                  >
                    {{ showPassword() ? '👁' : '🙈' }}
                  </button>
                </div>
                @if (isInvalid('password')) {
                  <p class="error-msg">⚠ Este campo es requerido.</p>
                }
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="btn-primary w-full btn-lg mt-2"
                [disabled]="facade.loading()"
              >
                @if (facade.loading()) {
                  <span
                    class="w-4 h-4 border-2 border-white/30 border-t-white
                               rounded-full animate-spin"
                  ></span>
                  Ingresando...
                } @else {
                  Iniciar sesión
                }
              </button>
            </form>
          </div>

          <!-- Footer -->
          <div class="border-t border-slate-100 px-6 py-4 text-center">
            <p class="text-sm text-slate-500">
              ¿No tienes cuenta?
              <a
                routerLink="/auth/register"
                class="text-primary-600 font-semibold hover:text-primary-700 ml-1
                        transition-colors"
              >
                Regístrate
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly facade = inject(AuthFacade);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  showPassword = signal(false);

  constructor() {
  this.facade.clearError();
}

  form = this.fb.group({
    userNameOrEmail: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.facade.login(this.form.getRawValue() as any).subscribe({
      next: () => this.toast.success('¡Bienvenido de nuevo!'),
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
