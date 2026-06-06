import { Injectable, signal, computed } from '@angular/core';
import { MatchService } from '../services/match.service';
import { MatchDto } from '../models/pool.models';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MatchFacade {

  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  private readonly _matches = signal<MatchDto[]>([]);

  readonly matches   = computed(() => this._matches());
  readonly scheduled = computed(() => this._matches().filter(m => m.status === 'Scheduled'));
  readonly finished  = computed(() => this._matches().filter(m => m.status === 'Finished'));
  readonly byGroup   = computed(() => {
    const groups: Record<string, MatchDto[]> = {};
    for (const m of this._matches()) {
      if (!groups[m.groupName]) groups[m.groupName] = [];
      groups[m.groupName].push(m);
    }
    return groups;
  });

  constructor(private matchService: MatchService) {}

  loadMatches(): void {
    this.loading.set(true);
    this.error.set(null);
    this.matchService.getAll().pipe(
      tap(matches => {
        this._matches.set(matches);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('No se pudieron cargar los partidos.');
        this.loading.set(false);
        return throwError(() => err);
      })
    ).subscribe();
  }
}
