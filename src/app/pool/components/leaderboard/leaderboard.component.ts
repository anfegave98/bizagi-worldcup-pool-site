import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardFacade } from '../../facades/leaderboard.facade';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ScoreBadgeComponent } from '../../../shared/components/score-badge/score-badge.component';
import { UserHistoryComponent } from '../user-history/user-history.component';
import { AuthFacade } from '../../../auth/facades/auth.facade';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ScoreBadgeComponent, UserHistoryComponent],
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Ranking Global 🏆</h2>
          <p class="text-sm text-slate-500 mt-0.5">Clasificación por puntos acumulados</p>
        </div>
        <button (click)="facade.loadLeaderboard()" class="btn-secondary btn-sm">
          ↻ Actualizar
        </button>
      </div>

      <!-- Podio top 3 -->
      @if (!facade.loading() && facade.leaderboard().length >= 3) {
        <div class="grid grid-cols-3 gap-3 animate-slide-up">
          @for (item of facade.leaderboard().slice(0, 3); track item.idUser) {
            <div class="card card-body text-center cursor-pointer transition-all duration-200
                        hover:-translate-y-1 hover:shadow-card-md"
                 [class.ring-2]="item.position === 1"
                 [class.ring-primary-300]="item.position === 1"
                 (click)="selectUser(item.idUser)">

              <!-- Medal -->
              <div class="text-3xl mb-2">
                {{ item.position === 1 ? '🥇' : item.position === 2 ? '🥈' : '🥉' }}
              </div>

              <!-- Avatar -->
              <div class="avatar w-12 h-12 text-sm mx-auto mb-2"
                   [class]="avatarClass(item.position)">
                {{ initials(item.fullName) }}
              </div>

              <p class="font-semibold text-slate-800 text-sm truncate">{{ item.userName }}</p>
              <p class="text-2xl font-bold text-gradient mt-1">{{ item.totalPoints }}</p>
              <p class="text-xs text-slate-400">puntos</p>
            </div>
          }
        </div>
      }

      <!-- Loading -->
      @if (facade.loading()) {
        <app-spinner label="Cargando ranking..." />
      }

      <!-- Table -->
      @if (!facade.loading() && facade.leaderboard().length > 0) {
        <div class="card animate-slide-up">
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th class="w-12">#</th>
                  <th>Participante</th>
                  <th class="text-right">Puntos</th>
                  <th class="text-right hidden sm:table-cell">Exactos</th>
                  <th class="text-right hidden sm:table-cell">Predicciones</th>
                  <th class="w-16"></th>
                </tr>
              </thead>
              <tbody>
                @for (item of facade.leaderboard(); track item.idUser) {
                  <tr [class.bg-primary-50]="item.idUser === currentUserId()"
                      class="cursor-pointer" (click)="selectUser(item.idUser)">

                    <!-- Position -->
                    <td>
                      <span class="font-bold"
                            [class.text-amber-500]="item.position === 1"
                            [class.text-slate-400]="item.position === 2"
                            [class.text-orange-400]="item.position === 3"
                            [class.text-slate-500]="item.position > 3">
                        {{ item.position }}
                      </span>
                    </td>

                    <!-- User -->
                    <td>
                      <div class="flex items-center gap-2.5">
                        <div class="avatar w-8 h-8 text-xs shrink-0"
                             [class]="avatarClassSm(item.position)">
                          {{ initials(item.fullName) }}
                        </div>
                        <div class="min-w-0">
                          <p class="font-medium text-slate-800 truncate text-sm">
                            {{ item.fullName }}
                            @if (item.idUser === currentUserId()) {
                              <span class="badge badge-primary ml-1.5 text-[10px]">Tú</span>
                            }
                          </p>
                          <p class="text-xs text-slate-400 truncate">{{"@"}}{{ item.userName }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Points -->
                    <td class="text-right">
                      <span class="font-bold text-slate-800">{{ item.totalPoints }}</span>
                    </td>

                    <!-- Exact scores -->
                    <td class="text-right hidden sm:table-cell">
                      <span class="badge badge-success">{{ item.exactScoreCount }} ⭐</span>
                    </td>

                    <!-- Prediction count -->
                    <td class="text-right hidden sm:table-cell text-slate-500 text-xs">
                      {{ item.predictionCount }}
                    </td>

                    <!-- View history -->
                    <td class="text-right">
                      <button class="btn-ghost btn-sm text-xs text-primary-600">
                        Ver →
                      </button>
                    </td>

                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Empty -->
      @if (!facade.loading() && facade.leaderboard().length === 0) {
        <div class="card card-body text-center py-16">
          <span class="text-5xl mb-4 block">🏆</span>
          <h3 class="font-semibold text-slate-700">Ranking en construcción</h3>
          <p class="text-sm text-slate-500 mt-1">
            Aparecerá aquí cuando haya predicciones calculadas.
          </p>
        </div>
      }

    </div>

    <!-- History panel -->
    @if (facade.selectedUserId()) {
      <app-user-history
        [userId]="facade.selectedUserId()!"
        [userName]="facade.selectedUser()?.fullName ?? ''"
        (close)="facade.clearHistory()" />
    }
  `
})
export class LeaderboardComponent implements OnInit {
  protected readonly facade     = inject(LeaderboardFacade);
  protected readonly authFacade = inject(AuthFacade);

  readonly currentUserId = () => this.authFacade.currentUser()?.id ?? null;

  ngOnInit(): void {
    this.facade.loadLeaderboard();
  }

  selectUser(userId: number): void {
    this.facade.loadUserHistory(userId);
  }

  initials(fullName: string): string {
    return fullName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  avatarClass(position: number): string {
    if (position === 1) return 'bg-gradient-to-br from-amber-400 to-yellow-300 shadow-md';
    if (position === 2) return 'bg-gradient-to-br from-slate-400 to-slate-300 shadow-md';
    if (position === 3) return 'bg-gradient-to-br from-orange-400 to-amber-300 shadow-md';
    return 'bg-gradient-primary';
  }

  avatarClassSm(position: number): string {
    if (position === 1) return 'bg-gradient-to-br from-amber-400 to-yellow-300';
    if (position === 2) return 'bg-gradient-to-br from-slate-400 to-slate-300';
    if (position === 3) return 'bg-gradient-to-br from-orange-400 to-amber-300';
    return 'bg-gradient-primary';
  }
}
