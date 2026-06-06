import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminFacade } from '../../facades/admin.facade';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { AdminResultsComponent } from '../admin-results/admin-results.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, AdminResultsComponent],
  template: `
    <div class="space-y-8 animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Panel Administrativo</h2>
          <p class="text-sm text-slate-500 mt-0.5">Indicadores operativos del sistema</p>
        </div>
        <button (click)="facade.loadDashboard()" class="btn-secondary btn-sm">
          ↻ Actualizar
        </button>
      </div>

      @if (facade.loading()) {
        <app-spinner label="Cargando dashboard..." />
      }

      <!-- Stats grid -->
      @if (facade.dashboard(); as dash) {
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">

          <!-- Total users -->
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <p class="stat-label">Usuarios activos</p>
              <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                👥
              </div>
            </div>
            <p class="stat-value text-gradient">{{ dash.totalUsers }}</p>
            <div class="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-primary rounded-full" style="width: 100%"></div>
            </div>
          </div>

          <!-- Matches -->
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <p class="stat-label">Partidos totales</p>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                🏟
              </div>
            </div>
            <p class="stat-value text-gradient">{{ dash.totalMatches }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="badge badge-success text-[10px]">✓ {{ dash.finishedMatches }} finalizados</span>
              <span class="badge badge-primary text-[10px]">🕐 {{ dash.pendingMatches }} pendientes</span>
            </div>
          </div>

          <!-- Predictions -->
          <div class="stat-card col-span-2 lg:col-span-1">
            <div class="flex items-center justify-between mb-3">
              <p class="stat-label">Predicciones</p>
              <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl">
                ✏️
              </div>
            </div>
            <p class="stat-value text-gradient">{{ dash.totalPredictions }}</p>
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Calculadas</span>
                <span>{{ dash.calculatedPredictions }} / {{ dash.totalPredictions }}</span>
              </div>
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-400 rounded-full transition-all duration-700"
                     [style.width]="progressWidth(dash.calculatedPredictions, dash.totalPredictions)">
                </div>
              </div>
            </div>
          </div>

          <!-- Match progress card -->
          <div class="stat-card col-span-2 lg:col-span-3">
            <div class="flex items-center justify-between mb-3">
              <p class="stat-label">Progreso del torneo</p>
              <span class="text-sm font-semibold text-slate-700">
                {{ dash.finishedMatches }} de {{ dash.totalMatches }} partidos jugados
              </span>
            </div>
            <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-primary rounded-full transition-all duration-700"
                   [style.width]="progressWidth(dash.finishedMatches, dash.totalMatches)">
              </div>
            </div>
            <div class="flex justify-between mt-1.5">
              <span class="text-xs text-slate-400">Inicio</span>
              <span class="text-xs font-medium text-primary-600">
                {{ progressPercent(dash.finishedMatches, dash.totalMatches) }}%
              </span>
              <span class="text-xs text-slate-400">Final</span>
            </div>
          </div>

        </div>
      }

      <!-- Register results section -->
      <div class="border-t border-slate-200 pt-6">
        <app-admin-results />
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  protected readonly facade = inject(AdminFacade);

  ngOnInit(): void {
    this.facade.loadDashboard();
  }

  progressWidth(value: number, total: number): string {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }

  progressPercent(value: number, total: number): number {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }
}
