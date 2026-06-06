import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionFacade } from '../../facades/prediction.facade';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ScoreBadgeComponent } from '../../../shared/components/score-badge/score-badge.component';

@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ScoreBadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Header con resumen -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Mis predicciones</h2>
          <p class="text-sm text-slate-500 mt-0.5">Historial de tus pronósticos y puntos obtenidos</p>
        </div>
        <button (click)="facade.loadMyPredictions()" class="btn-secondary btn-sm self-start sm:self-auto">
          ↻ Actualizar
        </button>
      </div>

      <!-- Stat cards -->
      @if (!facade.loading() && facade.predictions().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-slide-up">
          <div class="stat-card">
            <p class="stat-label">Total predicciones</p>
            <p class="stat-value text-gradient">{{ facade.predictions().length }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">Puntos acumulados</p>
            <p class="stat-value text-gradient">{{ facade.totalPoints() }}</p>
          </div>
          <div class="stat-card col-span-2 sm:col-span-1">
            <p class="stat-label">Calculadas</p>
            <p class="stat-value text-gradient">{{ facade.calculatedCount() }} / {{ facade.predictions().length }}</p>
          </div>
        </div>
      }

      <!-- Loading -->
      @if (facade.loading()) {
        <app-spinner label="Cargando predicciones..." />
      }

      <!-- Error -->
      @if (facade.error()) {
        <div class="card card-body flex items-center gap-3 bg-red-50 border-red-200 text-red-600">
          <span>⚠</span><p class="text-sm font-medium">{{ facade.error() }}</p>
        </div>
      }

      <!-- Lista de predicciones -->
      @if (!facade.loading() && facade.predictions().length > 0) {
        <div class="space-y-3">
          @for (pred of facade.predictions(); track pred.id) {
            <div class="card card-hover animate-slide-up"
                 [class.border-emerald-200]="pred.isCalculated && pred.points === 3"
                 [class.border-amber-200]="pred.isCalculated && pred.points === 1"
                 [class.border-red-200]="pred.isCalculated && pred.points === 0">
              <div class="card-body">
                <div class="flex items-center gap-4">

                  <!-- Teams & Score -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-3">

                      <!-- Home -->
                      <div class="flex flex-col items-center gap-1 min-w-0">
                        <div class="w-9 h-9 rounded-lg bg-gradient-primary/10 border border-primary-100
                                    flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                          {{ initial(pred.homeTeamName) }}
                        </div>
                        <span class="text-xs font-medium text-slate-600 text-center leading-tight">
                          {{ pred.homeTeamName }}
                        </span>
                      </div>

                      <!-- Prediction vs Real -->
                      <div class="flex flex-col items-center gap-1.5 shrink-0">
                        <!-- Mi predicción -->
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs text-slate-400">Predicho:</span>
                          <span class="font-bold text-slate-800 text-sm">
                            {{ pred.homeGoals }} – {{ pred.awayGoals }}
                          </span>
                        </div>
                        <!-- Resultado real -->
                        @if (pred.matchStatus === 'Finished') {
                          <div class="flex items-center gap-1.5">
                            <span class="text-xs text-slate-400">Real:</span>
                            <span class="font-bold text-slate-600 text-sm">
                              {{ pred.realHomeGoals }} – {{ pred.realAwayGoals }}
                            </span>
                          </div>
                        } @else {
                          <span class="badge badge-primary text-[10px]">🕐 Pendiente</span>
                        }
                      </div>

                      <!-- Away -->
                      <div class="flex flex-col items-center gap-1 min-w-0">
                        <div class="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100
                                    flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                          {{ initial(pred.awayTeamName) }}
                        </div>
                        <span class="text-xs font-medium text-slate-600 text-center leading-tight">
                          {{ pred.awayTeamName }}
                        </span>
                      </div>

                    </div>
                  </div>

                  <!-- Points badge -->
                  <div class="shrink-0 flex flex-col items-end gap-1.5">
                    <app-score-badge
                      [points]="pred.points"
                      [isCalculated]="pred.isCalculated" />
                    <span class="text-[10px] text-slate-400">
                      {{ pred.dateCreated | date:'dd/MM HH:mm' }}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!facade.loading() && facade.predictions().length === 0) {
        <div class="card card-body text-center py-16">
          <span class="text-5xl mb-4 block">✏️</span>
          <h3 class="font-semibold text-slate-700">Sin predicciones aún</h3>
          <p class="text-sm text-slate-500 mt-1">
            Ve a <strong>Partidos</strong> y registra tus pronósticos.
          </p>
        </div>
      }

    </div>
  `
})
export class MyPredictionsComponent implements OnInit {
  protected readonly facade = inject(PredictionFacade);

  ngOnInit(): void {
    this.facade.loadMyPredictions();
  }

  initial(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
