import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show()) {
      <div class="flex flex-col items-center justify-center gap-3 py-12">
        <div class="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-600
                    animate-spin"></div>
        @if (label()) {
          <p class="text-sm text-slate-500 font-medium animate-pulse-soft">{{ label() }}</p>
        }
      </div>
    }
  `
})
export class SpinnerComponent {
  show  = input(true);
  label = input<string>('Cargando...');
}
