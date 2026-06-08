import {
  Component,
  inject,
  input,
  output,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { PredictionFacade } from '../../facades/prediction.facade';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { MatchDto, PredictionDto } from '../../models/pool.models';

/** Validator: entero mayor o igual a 0 */
function nonNegativeInt(control: AbstractControl) {
  const v = control.value;
  if (v === null || v === '') return { required: true };
  if (!Number.isInteger(Number(v)) || Number(v) < 0)
    return { nonNegative: true };
  return null;
}

@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      ></div>

      <!-- Modal -->
      <div class="relative w-full max-w-sm animate-scale-in">
        <div class="card shadow-card-lg">
          <div class="card-body">
            <!-- Header -->
            <div class="flex items-start justify-between mb-5">
              <div>
                <h3 class="font-bold text-slate-800 text-lg leading-tight">
                  {{ existing() ? 'Editar predicción' : 'Nueva predicción' }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ match().roundName }}
                </p>
              </div>
              <button
                (click)="close.emit()"
                class="btn-ghost btn-sm text-slate-400 -mt-1 -mr-1"
              >
                ✕
              </button>
            </div>

            <!-- Match info -->
            <div
              class="flex items-center justify-center gap-4 py-4 px-3
                        bg-gradient-hero rounded-xl mb-5"
            >
              <!-- Home team -->
              <div class="flex flex-col items-center gap-1.5 flex-1">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-primary shadow-md
                            flex items-center justify-center text-base font-bold text-white"
                >
                  {{ initial(match().homeTeamName) }}
                </div>
                <span class="text-xs font-semibold text-slate-700 text-center">
                  {{ match().homeTeamName }}
                </span>
              </div>

              <!-- Score inputs usando [formControl] directamente (sin formGroup padre) -->
              <div class="flex items-center gap-2">
                <input
                  [formControl]="homeGoalsControl"
                  type="number"
                  min="0"
                  max="99"
                  class="input w-14 text-center text-xl font-bold px-2"
                  [class.input-error]="isControlInvalid(homeGoalsControl)"
                  placeholder="0"
                />
                <span class="text-slate-400 font-bold text-lg">–</span>
                <input
                  [formControl]="awayGoalsControl"
                  type="number"
                  min="0"
                  max="99"
                  class="input w-14 text-center text-xl font-bold px-2"
                  [class.input-error]="isControlInvalid(awayGoalsControl)"
                  placeholder="0"
                />
              </div>

              <!-- Away team -->
              <div class="flex flex-col items-center gap-1.5 flex-1">
                <div
                  class="w-12 h-12 rounded-xl bg-violet-100 shadow-md
                            flex items-center justify-center text-base font-bold text-violet-700"
                >
                  {{ initial(match().awayTeamName) }}
                </div>
                <span class="text-xs font-semibold text-slate-700 text-center">
                  {{ match().awayTeamName }}
                </span>
              </div>
            </div>

            <!-- Validation errors -->
            @if (
              isControlInvalid(homeGoalsControl) ||
              isControlInvalid(awayGoalsControl)
            ) {
              <p class="error-msg justify-center mb-3">
                ⚠ Los goles deben ser números enteros mayores o iguales a 0 y
                menores o iguales a 99.
              </p>
            }

            <!-- Error del servicio -->
            @if (predictionFacade.error()) {
              <div
                class="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200
                          text-red-700 text-sm mb-3"
              >
                <span>⚠</span><span>{{ predictionFacade.error() }}</span>
              </div>
            }

            <!-- Date info -->
            <p class="text-xs text-center text-slate-400 mb-4">
              📅 {{ match().matchDate | date: 'EEEE dd MMM, HH:mm' }}
            </p>

            <!-- Actions -->
            <div class="flex gap-2">
              <button (click)="close.emit()" class="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                (click)="onSubmit()"
                class="btn-primary flex-1"
                [disabled]="predictionFacade.saving()"
              >
                @if (predictionFacade.saving()) {
                  <span
                    class="w-4 h-4 border-2 border-white/30 border-t-white
                               rounded-full animate-spin"
                  ></span>
                } @else {
                  {{ existing() ? 'Guardar cambios' : 'Confirmar predicción' }}
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PredictionFormComponent implements OnInit {
  readonly match = input.required<MatchDto>();
  readonly existing = input<PredictionDto | null>(null);
  readonly close = output<void>();

  protected readonly predictionFacade = inject(PredictionFacade);
  private readonly toast = inject(ToastService);

  // FormControls independientes — sin formGroup para evitar el error NG01050
  homeGoalsControl = new FormControl<number | null>(null, [
    Validators.required,
    nonNegativeInt,
    Validators.min(0),
    Validators.max(99),
  ]);
  awayGoalsControl = new FormControl<number | null>(null, [
    Validators.required,
    nonNegativeInt,
    Validators.min(0),
    Validators.max(99),
  ]);

  ngOnInit(): void {
    const pred = this.existing();
    if (pred) {
      this.homeGoalsControl.setValue(pred.homeGoals);
      this.awayGoalsControl.setValue(pred.awayGoals);
    }
    this.predictionFacade.error.set(null);
  }

  initial(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  isControlInvalid(control: FormControl): boolean {
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    this.homeGoalsControl.markAsTouched();
    this.awayGoalsControl.markAsTouched();

    if (this.homeGoalsControl.invalid || this.awayGoalsControl.invalid) return;

    this.predictionFacade
      .savePrediction({
        idMatch: this.match().id,
        homeGoals: Number(this.homeGoalsControl.value),
        awayGoals: Number(this.awayGoalsControl.value),
      })
      .subscribe({
        next: () => {
          this.toast.success('¡Predicción guardada exitosamente!');
          this.close.emit();
        },
      });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close.emit();
    }
  }
}
