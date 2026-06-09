import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatchFacade } from '../../facades/match.facade';
import { AdminFacade } from '../../facades/admin.facade';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { MatchDto } from '../../models/pool.models';

@Component({
  selector: 'app-admin-results',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div>
        <h2 class="text-xl font-bold text-slate-800">
          Registrar Resultados ⚙️
        </h2>
        <p class="text-sm text-slate-500 mt-0.5">
          Registra el resultado real de cada partido. Se calculan los puntos
          automáticamente.
        </p>
      </div>

      @if (matchFacade.loading()) {
        <app-spinner label="Cargando partidos..." />
      }

      <!-- Partidos programados -->
      @if (matchFacade.scheduled().length > 0) {
        <section>
          <h3
            class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3"
          >
            Partidos pendientes de resultado
          </h3>
          <div class="space-y-3">
            @for (match of matchFacade.scheduled(); track match.id) {
              <div class="card card-hover animate-slide-up">
                <div class="card-body">
                  <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                    <!-- Match info -->
                    <div class="flex items-center gap-4 flex-1">
                      <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="flex flex-col items-center gap-1 min-w-0">
                          <div
                            class="w-10 h-10 rounded-xl bg-gradient-primary/10 border border-primary-100
                                      flex items-center justify-center text-xs font-bold text-primary-700"
                          >
                            {{ initial(match.homeTeamName) }}
                          </div>
                          <span
                            class="text-xs font-medium text-slate-700 text-center truncate max-w-[64px]"
                          >
                            {{ match.homeTeamName }}
                          </span>
                        </div>
                        <div
                          class="flex flex-col items-center shrink-0 gap-0.5"
                        >
                          <span class="text-xs font-bold text-slate-400"
                            >VS</span
                          >
                          <span class="text-[10px] text-slate-400">
                            {{ match.matchDate | date: 'dd/MM' }}
                          </span>
                        </div>
                        <div class="flex flex-col items-center gap-1 min-w-0">
                          <div
                            class="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100
                                      flex items-center justify-center text-xs font-bold text-violet-700"
                          >
                            {{ initial(match.awayTeamName) }}
                          </div>
                          <span
                            class="text-xs font-medium text-slate-700 text-center truncate max-w-[64px]"
                          >
                            {{ match.awayTeamName }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Formulario de resultado o botón -->
                    @if (selectedMatchId() === match.id) {
                      <div class="flex items-start gap-2 flex-wrap">
                        <!-- Goles local -->
                        <div class="flex flex-col gap-1">
                          <input
                            [formControl]="getForm(match.id).controls.homeGoals"
                            type="number"
                            min="0"
                            max="99"
                            placeholder="L"
                            class="input w-16 text-center font-bold"
                            [class.input-error]="
                              getForm(match.id).controls.homeGoals.invalid &&
                              getForm(match.id).controls.homeGoals.touched
                            "
                          />
                          @if (
                            getForm(match.id).controls.homeGoals.invalid &&
                            getForm(match.id).controls.homeGoals.touched
                          ) {
                            <p class="error-msg text-[10px] justify-center">
                              @if (
                                getForm(match.id).controls.homeGoals.errors?.[
                                  'required'
                                ]
                              ) {
                                ⚠ Requerido
                              } @else if (
                                getForm(match.id).controls.homeGoals.errors?.[
                                  'min'
                                ]
                              ) {
                                ⚠ Mín. 0
                              } @else if (
                                getForm(match.id).controls.homeGoals.errors?.[
                                  'max'
                                ]
                              ) {
                                ⚠ Máx. 99
                              }
                            </p>
                          }
                        </div>

                        <span class="text-slate-400 font-bold mt-2.5">–</span>

                        <!-- Goles visitante -->
                        <div class="flex flex-col gap-1">
                          <input
                            [formControl]="getForm(match.id).controls.awayGoals"
                            type="number"
                            min="0"
                            max="99"
                            placeholder="V"
                            class="input w-16 text-center font-bold"
                            [class.input-error]="
                              getForm(match.id).controls.awayGoals.invalid &&
                              getForm(match.id).controls.awayGoals.touched
                            "
                          />
                          @if (
                            getForm(match.id).controls.awayGoals.invalid &&
                            getForm(match.id).controls.awayGoals.touched
                          ) {
                            <p class="error-msg text-[10px] justify-center">
                              @if (
                                getForm(match.id).controls.awayGoals.errors?.[
                                  'required'
                                ]
                              ) {
                                ⚠ Requerido
                              } @else if (
                                getForm(match.id).controls.awayGoals.errors?.[
                                  'min'
                                ]
                              ) {
                                ⚠ Mín. 0
                              } @else if (
                                getForm(match.id).controls.awayGoals.errors?.[
                                  'max'
                                ]
                              ) {
                                ⚠ Máx. 99
                              }
                            </p>
                          }
                        </div>

                        <button
                          (click)="submitResult(match)"
                          class="btn-primary btn-sm mt-0.5"
                          [disabled]="adminFacade.saving()"
                        >
                          @if (adminFacade.saving()) {
                            <span
                              class="w-3.5 h-3.5 border-2 border-white/30 border-t-white
                                         rounded-full animate-spin"
                            ></span>
                          } @else {
                            ✓ Confirmar
                          }
                        </button>

                        <!-- Cancelar -->
                        <button
                          (click)="cancel(match.id)"
                          class="btn-ghost btn-sm mt-0.5"
                        >
                          Cancelar
                        </button>
                      </div>
                    } @else {
                      <button
                        (click)="selectMatch(match)"
                        class="btn-secondary btn-sm shrink-0"
                      >
                        + Registrar resultado
                      </button>
                    }
                  </div>

                  <!-- Error del servicio -->
                  @if (adminFacade.error() && selectedMatchId() === match.id) {
                    <p class="error-msg mt-2">⚠ {{ adminFacade.error() }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Partidos finalizados CON resultado -->
      @if (matchFacade.finished().length > 0) {
        <section>
          <h3
            class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3"
          >
            Partidos con resultado registrado
          </h3>
          <div class="space-y-2">
            @for (match of matchFacade.finished(); track match.id) {
              <div class="card opacity-80">
                <div class="card-body py-3.5">
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="badge badge-success shrink-0"
                      >✓ Finalizado</span
                    >

                    <!-- Equipos y resultado real -->
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        class="text-sm font-semibold text-slate-700 truncate"
                      >
                        {{ match.homeTeamName }}
                      </span>

                      <!-- Marcador real destacado -->
                      @if (
                        match.realHomeGoals !== null &&
                        match.realAwayGoals !== null
                      ) {
                        <span
                          class="px-3 py-0.5 rounded-lg bg-slate-100 text-slate-800
                                     font-extrabold text-sm shrink-0 tabular-nums"
                        >
                          {{ match.realHomeGoals }} – {{ match.realAwayGoals }}
                        </span>
                      } @else {
                        <span class="text-xs text-slate-400 shrink-0">vs</span>
                      }

                      <span
                        class="text-sm font-semibold text-slate-700 truncate"
                      >
                        {{ match.awayTeamName }}
                      </span>
                    </div>

                    <span class="text-xs text-slate-400 ml-auto shrink-0">
                      {{ match.matchDate | date: 'dd/MM/yyyy' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Todos finalizados -->
      @if (
        !matchFacade.loading() &&
        matchFacade.scheduled().length === 0 &&
        matchFacade.finished().length > 0
      ) {
        <div class="card card-body text-center py-12">
          <span class="text-4xl mb-3 block">🎉</span>
          <h3 class="font-semibold text-slate-700">
            Todos los partidos tienen resultado
          </h3>
          <p class="text-sm text-slate-500 mt-1">
            Los puntos ya fueron calculados.
          </p>
        </div>
      }
    </div>
  `,
})
export class AdminResultsComponent implements OnInit {
  protected readonly matchFacade = inject(MatchFacade);
  protected readonly adminFacade = inject(AdminFacade);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  selectedMatchId = signal<number | null>(null);

  private forms = new Map<number, ReturnType<typeof this.buildForm>>();

  ngOnInit(): void {
    this.matchFacade.loadMatches();
  }

  initial(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  selectMatch(match: MatchDto): void {
    this.adminFacade.error.set(null);
    this.selectedMatchId.set(match.id);
    if (!this.forms.has(match.id)) {
      this.forms.set(match.id, this.buildForm());
    }
  }

  getForm(matchId: number) {
    if (!this.forms.has(matchId)) this.forms.set(matchId, this.buildForm());
    return this.forms.get(matchId)!;
  }

  private buildForm() {
    return this.fb.group({
      homeGoals: [
        null as number | null,
        [Validators.required, Validators.min(0), Validators.max(99)],
      ],
      awayGoals: [
        null as number | null,
        [Validators.required, Validators.min(0), Validators.max(99)],
      ],
    });
  }

  cancel(matchId: number): void {
    const form = this.getForm(matchId);

    form.reset();

    Object.values(form.controls).forEach((control) => {
      control.markAsUntouched();
      control.markAsPristine();
      control.updateValueAndValidity();
    });

    this.adminFacade.error.set(null);
    this.selectedMatchId.set(null);
  }

  submitResult(match: MatchDto): void {
    const form = this.getForm(match.id);
    form.markAllAsTouched();
    if (form.invalid) return;

    const { homeGoals, awayGoals } = form.getRawValue();
    this.adminFacade
      .registerResult(match.id, {
        homeGoals: Number(homeGoals),
        awayGoals: Number(awayGoals),
      })
      .subscribe({
        next: () => {
          this.toast.success(
            `Resultado registrado: ${match.homeTeamName} ${homeGoals} – ${awayGoals} ${match.awayTeamName}. ¡Puntos calculados!`,
          );
          this.selectedMatchId.set(null);
          this.matchFacade.loadMatches();
        },
      });
  }
}
