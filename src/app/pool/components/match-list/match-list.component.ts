import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchFacade } from '../../facades/match.facade';
import { PredictionFacade } from '../../facades/prediction.facade';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { PredictionFormComponent } from '../prediction-form/prediction-form.component';
import { MatchDto } from '../../models/pool.models';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, PredictionFormComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Partidos del Mundial</h2>
          <p class="text-sm text-slate-500 mt-0.5">
            Registra tus predicciones antes del inicio
          </p>
        </div>
        <button
          (click)="matchFacade.loadMatches()"
          class="btn-secondary btn-sm gap-1.5"
        >
          ↻ Actualizar
        </button>
      </div>

      <!-- Loading -->
      @if (matchFacade.loading()) {
        <app-spinner label="Cargando partidos..." />
      }

      <!-- Error -->
      @if (matchFacade.error()) {
        <div
          class="card card-body flex items-center gap-3 text-red-600 bg-red-50 border-red-200"
        >
          <span class="text-xl">⚠</span>
          <p class="text-sm font-medium">{{ matchFacade.error() }}</p>
        </div>
      }

      <!-- Grupos -->
      @for (group of groupEntries(); track group[0]) {
        <section>
          <div class="flex items-center gap-3 mb-3">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary-500"></span>
              <h3 class="font-semibold text-slate-700">{{ group[0] }}</h3>
            </div>
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-xs text-slate-400 font-medium">
              {{ group[1].length }} partidos
            </span>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (match of group[1]; track match.id) {
              <div
                class="card card-hover transition-all duration-200 hover:-translate-y-0.5 animate-slide-up"
                [class.opacity-75]="
                  match.status === 'Finished' || isMatchStarted(match)
                "
              >
                <div class="card-body">
                  <!-- Status badge + date -->
                  <div class="flex items-center justify-between mb-3">
                    <span
                      class="badge"
                      [class]="
                        match.status === 'Finished'
                          ? 'badge-success'
                          : isMatchStarted(match)
                            ? 'badge-warning'
                            : 'badge-primary'
                      "
                    >
                      {{
                        match.status === 'Finished'
                          ? '✓ Finalizado'
                          : isMatchStarted(match)
                            ? '⏳ En curso'
                            : '🕐 Programado'
                      }}
                    </span>
                    <span class="text-xs text-slate-400">
                      {{ match.matchDate | date: 'dd MMM, HH:mm' }}
                    </span>
                  </div>

                  <!-- Teams -->
                  <div class="flex items-center justify-between gap-2">
                    <!-- Home -->
                    <div
                      class="flex flex-col items-center gap-1.5 flex-1 min-w-0"
                    >
                      <div
                        class="w-10 h-10 rounded-xl bg-gradient-primary/10 border
                                  border-primary-100 flex items-center justify-center
                                  text-sm font-bold text-primary-700"
                      >
                        {{ teamInitial(match.homeTeamName) }}
                      </div>
                      <span
                        class="text-xs font-semibold text-slate-700 text-center leading-tight truncate w-full"
                      >
                        {{ match.homeTeamName }}
                      </span>
                    </div>

                    <!-- VS -->
                    <div class="flex flex-col items-center gap-1 shrink-0">
                      <span
                        class="text-xs font-bold text-slate-400 tracking-widest"
                        >VS</span
                      >
                      @if (getPrediction(match.id); as pred) {
                        <span class="text-sm font-bold text-slate-800">
                          {{ pred.homeGoals }} – {{ pred.awayGoals }}
                        </span>
                      }
                    </div>

                    <!-- Away -->
                    <div
                      class="flex flex-col items-center gap-1.5 flex-1 min-w-0"
                    >
                      <div
                        class="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100
                                  flex items-center justify-center text-sm font-bold text-violet-700"
                      >
                        {{ teamInitial(match.awayTeamName) }}
                      </div>
                      <span
                        class="text-xs font-semibold text-slate-700 text-center leading-tight truncate w-full"
                      >
                        {{ match.awayTeamName }}
                      </span>
                    </div>
                  </div>

                  <!-- Round -->
                  <p class="text-xs text-slate-400 text-center mt-2">
                    {{ match.roundName }}
                  </p>

                  <!-- Action button -->
                  <div class="mt-3 pt-3 border-t border-slate-100">
                    @if (match.status === 'Finished') {
                      <!-- Partido finalizado -->
                      <div class="text-center">
                        <span class="text-xs text-slate-400"
                          >Partido finalizado</span
                        >
                      </div>
                    } @else if (isMatchStarted(match)) {
                      <!-- Partido ya comenzó pero sin resultado aún -->
                      <div class="text-center">
                        <span class="text-xs text-amber-500 font-medium">
                          ⏳ Predicciones cerradas
                        </span>
                        @if (getPrediction(match.id); as pred) {
                          <p class="text-xs text-slate-400 mt-0.5">
                            Tu predicción: {{ pred.homeGoals }} –
                            {{ pred.awayGoals }}
                          </p>
                        }
                      </div>
                    } @else {
                      <!-- Partido disponible para predecir -->
                      <button
                        (click)="openPrediction(match)"
                        class="btn-primary w-full btn-sm"
                      >
                        {{
                          getPrediction(match.id)
                            ? '✏ Editar predicción'
                            : '+ Predecir'
                        }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Empty state -->
      @if (
        !matchFacade.loading() &&
        !matchFacade.error() &&
        matchFacade.matches().length === 0
      ) {
        <div class="card card-body text-center py-16">
          <span class="text-5xl mb-4 block">🏟</span>
          <h3 class="font-semibold text-slate-700">Sin partidos disponibles</h3>
          <p class="text-sm text-slate-500 mt-1">
            Los partidos se cargarán próximamente.
          </p>
        </div>
      }
    </div>

    <!-- Prediction modal -->
    @if (selectedMatch()) {
      <app-prediction-form
        [match]="selectedMatch()!"
        [existing]="getPrediction(selectedMatch()!.id)"
        (close)="selectedMatch.set(null)"
      />
    }
  `,
})
export class MatchListComponent implements OnInit {
  protected readonly matchFacade = inject(MatchFacade);
  protected readonly predictionFacade = inject(PredictionFacade);

  selectedMatch = signal<MatchDto | null>(null);

  ngOnInit(): void {
    this.matchFacade.loadMatches();
    this.predictionFacade.loadMyPredictions();
  }

  groupEntries() {
    return Object.entries(this.matchFacade.byGroup());
  }

  teamInitial(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  getPrediction(matchId: number) {
    return (
      this.predictionFacade.predictions().find((p) => p.idMatch === matchId) ??
      null
    );
  }

  openPrediction(match: MatchDto): void {
    this.selectedMatch.set(match);
  }

  /**
   * Verifica si la fecha del partido ya ocurrió comparando en UTC.
   * Se usa para bloquear predicciones aunque el partido siga en estado "Scheduled"
   * (el admin aún no ha registrado el resultado).
   */
  isMatchStarted(match: MatchDto): boolean {
    return new Date() >= new Date(match.matchDate);
  }
}
