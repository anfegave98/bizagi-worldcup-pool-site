import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
          [ngClass]="classes()">
      {{ points() }} pts
      @if (rule()) {
        <span class="font-normal opacity-75">· {{ ruleLabel() }}</span>
      }
    </span>
  `
})
export class ScoreBadgeComponent {
  points      = input.required<number>();
  isCalculated = input(false);
  rule        = input<string>('');

  classes = computed(() => {
    if (!this.isCalculated()) return 'bg-slate-100 text-slate-500';
    if (this.points() === 3)  return 'bg-emerald-100 text-emerald-700';
    if (this.points() === 1)  return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-600';
  });

  ruleLabel = computed(() => {
    const map: Record<string, string> = {
      ExactScore:  'Exacto',
      WinnerOrDraw: 'Ganador',
      Failed:      'Fallo',
    };
    return map[this.rule()] ?? '';
  });
}
