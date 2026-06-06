import { Injectable, signal, computed } from '@angular/core';
import { LeaderboardService } from '../services/leaderboard.service';
import { LeaderboardItemDto, UserPredictionHistoryDto } from '../models/pool.models';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LeaderboardFacade {

  readonly loading        = signal(false);
  readonly loadingHistory = signal(false);
  readonly error          = signal<string | null>(null);
  readonly selectedUserId = signal<number | null>(null);

  private readonly _leaderboard = signal<LeaderboardItemDto[]>([]);
  private readonly _history     = signal<UserPredictionHistoryDto[]>([]);

  readonly leaderboard    = computed(() => this._leaderboard());
  readonly history        = computed(() => this._history());
  readonly selectedUser   = computed(() =>
    this._leaderboard().find(u => u.idUser === this.selectedUserId()) ?? null
  );

  constructor(private leaderboardService: LeaderboardService) {}

  loadLeaderboard(): void {
    this.loading.set(true);
    this.leaderboardService.get().pipe(
      tap(data => {
        this._leaderboard.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('No se pudo cargar el ranking.');
        this.loading.set(false);
        return throwError(() => err);
      })
    ).subscribe();
  }

  loadUserHistory(userId: number): void {
    this.selectedUserId.set(userId);
    this.loadingHistory.set(true);
    this._history.set([]);
    this.leaderboardService.getUserHistory(userId).pipe(
      tap(data => {
        this._history.set(data);
        this.loadingHistory.set(false);
      }),
      catchError(err => {
        this.error.set('No se pudo cargar el historial.');
        this.loadingHistory.set(false);
        return throwError(() => err);
      })
    ).subscribe();
  }

  clearHistory(): void {
    this._history.set([]);
    this.selectedUserId.set(null);
  }
}
