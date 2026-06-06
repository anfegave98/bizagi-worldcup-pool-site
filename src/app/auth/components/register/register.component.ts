import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../facades/auth.facade';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div class="w-full max-w-md animate-fade-in">

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                      bg-gradient-primary shadow-glow mb-4">
            <span class="text-3xl">⚽</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Crear cuenta</h1>
          <p class="text-slate-500 text-sm mt-1">Únete a la Polla Mundialista</p>
        </div>

        <!-- Card -->
        <div class="card animate-slide-up">
          <div class="card-body">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

              @if (facade.error()) {
                <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200
                            text-red-700 text-sm animate-slide-down">
                  <span>⚠</span><span>{{ facade.error() }}</span>
                </div>
              }

              @if (success()) {
                <div class="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50
                            border border-emerald-200 text-emerald-700 text-sm animate-slide-down">
                  <span>✓</span>
                  <span>¡Cuenta creada! Redirigiendo al login...</span>
                </div>
              }

              <!-- Nombre completo -->
              <div>
                <label class="label">Nombre completo</label>
                <input formControlName="fullName" type="text"
                  placeholder="Ej. Andres Galeano" class="input"
                  [class.input-error]="isInvalid('fullName')" />
                @if (isInvalid('fullName')) {
                  <p class="error-msg">⚠ El nombre completo es requerido.</p>
                }
              </div>

              <!-- Usuario -->
              <div>
                <label class="label">Nombre de usuario</label>
                <input formControlName="userName" type="text"
                  placeholder="Ej. agaleano" class="input"
                  [class.input-error]="isInvalid('userName')" />
                @if (isInvalid('userName')) {
                  <p class="error-msg">⚠ El nombre de usuario es requerido (máx. 100 caracteres).</p>
                }
              </div>

              <!-- Email -->
              <div>
                <label class="label">Correo electrónico</label>
                <input formControlName="email" type="email"
                  placeholder="correo@ejemplo.com" class="input"
                  [class.input-error]="isInvalid('email')" />
                @if (isInvalid('email')) {
                  <p class="error-msg">⚠ Ingresa un correo electrónico válido.</p>
                }
              </div>

              <!-- Contraseña -->
              <div>
                <label class="label">Contraseña</label>
                <div class="relative">
                  <input formControlName="password"
                    [type]="showPwd() ? 'text' : 'password'"
                    placeholder="Mínimo 8 caracteres" class="input pr-11"
                    [class.input-error]="isInvalid('password')" />
                  <button type="button" (click)="showPwd.set(!showPwd())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                           hover:text-slate-600 transition-colors text-sm">
                    {{ showPwd() ? '🙈' : '👁' }}
                  </button>
                </div>
                @if (isInvalid('password')) {
                  <p class="error-msg">⚠ La contraseña debe tener al menos 8 caracteres.</p>
                }
              </div>

              <button type="submit" class="btn-primary w-full btn-lg mt-2"
                      [disabled]="facade.loading() || success()">
                @if (facade.loading()) {
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white
                               rounded-full animate-spin"></span>
                  Creando cuenta...
                } @else {
                  Crear cuenta
                }
              </button>

            </form>
          </div>

          <div class="border-t border-slate-100 px-6 py-4 text-center">
            <p class="text-sm text-slate-500">
              ¿Ya tienes cuenta?
              <a routerLink="/auth/login"
                 class="text-primary-600 font-semibold hover:text-primary-700 ml-1 transition-colors">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class RegisterComponent {
  protected readonly facade = inject(AuthFacade);
  private readonly toast    = inject(ToastService);
  private readonly fb       = inject(FormBuilder);
  private readonly router = inject(Router);

  showPwd = signal(false);
  success = signal(false);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    userName: ['', [Validators.required, Validators.maxLength(100)]],
    email:    ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.facade.register(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.success.set(true);
        this.toast.success('¡Cuenta creada exitosamente! Inicia sesión para continuar.');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
