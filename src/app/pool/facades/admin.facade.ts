import { Injectable, signal, computed } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { AdminDashboardDto, MatchResultCreateDto, MatchResultDto } from '../models/pool.models';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminFacade {

  readonly loading  = signal(false);
  readonly saving   = signal(false);
  readonly error    = signal<string | null>(null);
  private readonly _dashboard = signal<AdminDashboardDto | null>(null);

  readonly dashboard = computed(() => this._dashboard());

  constructor(private adminService: AdminService) {}

  loadDashboard(): void {
    this.loading.set(true);
    this.adminService.getDashboard().pipe(
      tap(data => {
        this._dashboard.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('No se pudo cargar el dashboard.');
        this.loading.set(false);
        return throwError(() => err);
      })
    ).subscribe();
  }

  registerResult(matchId: number, dto: MatchResultCreateDto): Observable<MatchResultDto> {
    this.saving.set(true);
    this.error.set(null);
    return this.adminService.registerResult(matchId, dto).pipe(
      tap(() => {
        this.saving.set(false);
        this.loadDashboard();
      }),
      catchError(err => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Error al registrar el resultado.');
        return throwError(() => err);
      })
    );
  }
}
