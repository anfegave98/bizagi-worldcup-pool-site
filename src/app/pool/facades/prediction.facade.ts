import { Injectable, signal, computed } from '@angular/core';
import { PredictionService } from '../services/prediction.service';
import { PredictionCreateDto, PredictionDto } from '../models/pool.models';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PredictionFacade {

  readonly loading  = signal(false);
  readonly saving   = signal(false);
  readonly error    = signal<string | null>(null);
  private readonly _predictions = signal<PredictionDto[]>([]);

  readonly predictions     = computed(() => this._predictions());
  readonly totalPoints     = computed(() => this._predictions().reduce((s, p) => s + p.points, 0));
  readonly calculatedCount = computed(() => this._predictions().filter(p => p.isCalculated).length);

  constructor(private predictionService: PredictionService) {}

  loadMyPredictions(): void {
    this.loading.set(true);
    this.predictionService.getMine().pipe(
      tap(list => {
        this._predictions.set(list);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set('No se pudieron cargar tus predicciones.');
        this.loading.set(false);
        return throwError(() => err);
      })
    ).subscribe();
  }

  savePrediction(dto: PredictionCreateDto): Observable<PredictionDto> {
    this.saving.set(true);
    this.error.set(null);
    return this.predictionService.createOrUpdate(dto).pipe(
      tap(saved => {
        this.saving.set(false);
        // Actualizar la lista local si ya existe la predicción
        this._predictions.update(list => {
          const idx = list.findIndex(p => p.idMatch === saved.idMatch);
          if (idx >= 0) {
            const updated = [...list];
            updated[idx] = saved;
            return updated;
          }
          return [...list, saved];
        });
      }),
      catchError(err => {
        this.saving.set(false);
        this.error.set(
          err?.status === 400
            ? (err?.error?.message ?? 'No se puede predecir en un partido finalizado.')
            : 'Error al guardar la predicción.'
        );
        return throwError(() => err);
      })
    );
  }
}
