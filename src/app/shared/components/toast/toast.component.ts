import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-card-lg
                 border animate-toast-in"
          [ngClass]="toastClasses(toast)">
          <!-- Icon -->
          <span class="mt-0.5 shrink-0 text-lg">{{ toastIcon(toast.type) }}</span>
          <!-- Message -->
          <p class="text-sm font-medium leading-snug flex-1">{{ toast.message }}</p>
          <!-- Close -->
          <button
            (click)="toastService.remove(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">
            ×
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  toastClasses(toast: Toast): Record<string, boolean> {
    return {
      'bg-emerald-50 border-emerald-200 text-emerald-800': toast.type === 'success',
      'bg-red-50 border-red-200 text-red-800':             toast.type === 'error',
      'bg-amber-50 border-amber-200 text-amber-800':       toast.type === 'warning',
      'bg-blue-50 border-blue-200 text-blue-800':          toast.type === 'info',
    };
  }

  toastIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    return icons[type] ?? 'ℹ';
  }
}
