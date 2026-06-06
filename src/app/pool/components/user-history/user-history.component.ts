import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardFacade } from '../../facades/leaderboard.facade';
import { ScoreBadgeComponent } from '../../../shared/components/score-badge/score-badge.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [CommonModule, ScoreBadgeComponent, SpinnerComponent],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex justify-end" (click)="onBackdrop($event)">
      <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-xs animate-fade-in"></div>

      <!-- Slide-in panel -->
      <div class="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-up
                  overflow-hidden">

        <!-- Panel header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div>
            <h3 class="font-bold text-slate-800">Historial de predicciones</h3>
            <p class="text-sm text-slate-500 mt-0.5">{{ userName() }}</p>
          </div>
          <button (click)="close.emit()" class="btn-ghost btn-sm text-slate-400">✕</button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">

          @if (facade.loadingHistory()) {
            <app-spinner label="Cargando historial..." />
          }

          @if (!facade.loadingHistory() && facade.history().length === 0) {
            <div class="text-center py-16">
              <span class="text-4xl block mb-3">📋</span>
              <p class="text-sm text-slate-500">Sin predicciones registradas aún.</p>
            </div>
          }

          @for (item of facade.history(); track item.idMatch) {
            <div class="card animate-slide-up">
              <div class="card-body py-4">

                <!-- Match + date -->
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs text-slate-400">
                    📅 {{ item.matchDate | date:'dd MMM, HH:mm' }}
                  </span>
                  <span class="badge"
                        [class]="item.matchStatus === 'Finished' ? 'badge-success' : 'badge-primary'">
                    {{ item.matchStatus === 'Finished' ? '✓ Finalizado' : '🕐 Programado' }}
                  </span>
                </div>

                <!-- Teams row -->
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold text-slate-700 flex-1 text-right">
                    {{ item.homeTeamName }}
                  </span>

                  <div class="flex flex-col items-center gap-1 shrink-0 px-3">
                    <!-- Predicted -->
                    <div class="flex items-center gap-1.5">
                      <span class="text-[10px] text-slate-400">Pred:</span>
                      <span class="font-bold text-slate-800">
                        {{ item.predictedHomeGoals }} – {{ item.predictedAwayGoals }}
                      </span>
                    </div>
                    <!-- Real -->
                    @if (item.matchStatus === 'Finished') {
                      <div class="flex items-center gap-1.5">
                        <span class="text-[10px] text-slate-400">Real:</span>
                        <span class="font-bold text-slate-600">
                          {{ item.realHomeGoals }} – {{ item.realAwayGoals }}
                        </span>
                      </div>
                    }
                  </div>

                  <span class="text-sm font-semibold text-slate-700 flex-1">
                    {{ item.awayTeamName }}
                  </span>
                </div>

                <!-- Score badge -->
                @if (item.matchStatus === 'Finished') {
                  <div class="flex justify-center mt-3">
                    <app-score-badge
                      [points]="item.points"
                      [isCalculated]="true"
                      [rule]="item.ruleApplied" />
                  </div>
                }

              </div>
            </div>
          }

        </div>

        <!-- Summary footer -->
        @if (!facade.loadingHistory() && facade.history().length > 0) {
          <div class="border-t border-slate-100 px-5 py-3 bg-slate-50 flex items-center justify-between">
            <span class="text-sm text-slate-500">Total acumulado</span>
            <span class="text-lg font-bold text-gradient">
              {{ totalPoints() }} pts
            </span>
          </div>
        }

      </div>
    </div>
  `
})
export class UserHistoryComponent implements OnInit {
  readonly userId   = input.required<number>();
  readonly userName = input('');
  readonly close    = output<void>();

  protected readonly facade = inject(LeaderboardFacade);

  ngOnInit(): void {
    this.facade.loadUserHistory(this.userId());
  }

  totalPoints(): number {
    return this.facade.history().reduce((sum, h) => sum + h.points, 0);
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close.emit();
    }
  }
}
