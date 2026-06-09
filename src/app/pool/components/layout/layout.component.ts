import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthFacade } from '../../../auth/facades/auth.facade';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <!-- Navbar -->
      <header class="glass sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a
              routerLink="/app/matches"
              class="flex items-center gap-2.5 group"
            >
              <div
                class="w-9 h-9 rounded-xl bg-gradient-primary shadow-md flex items-center
                          justify-center text-lg transition-transform group-hover:scale-105"
              >
                ⚽
              </div>
              <span class="font-bold text-slate-800 hidden sm:block"
                >Polla Mundialista</span
              >
            </a>

            <!-- Desktop nav -->
            <nav class="hidden md:flex items-center gap-1">
              @for (item of visibleNav(); track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-primary-50 text-primary-700"
                  class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
                          text-slate-600 hover:bg-slate-100 hover:text-slate-800
                          transition-all duration-150"
                >
                  <span>{{ item.icon }}</span>
                  {{ item.label }}
                </a>
              }
            </nav>

            <!-- User menu -->
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <button
                (click)="menuOpen.set(!menuOpen())"
                class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                       hover:bg-slate-100 transition-colors group"
              >
                <div
                  class="avatar w-8 h-8 text-xs bg-gradient-primary shadow-sm"
                >
                  {{ initials() }}
                </div>
                <span
                  class="text-sm font-medium text-slate-700 hidden sm:block"
                >
                  {{ facade.currentUser()?.userName }}
                </span>
                <span class="text-slate-400 text-xs">▾</span>
              </button>

              <!-- Dropdown -->
              @if (menuOpen()) {
                <div
                  class="absolute top-14 right-4 w-52 card shadow-card-lg animate-scale-in z-50"
                >
                  <div class="p-3 border-b border-slate-100">
                    <p class="text-sm font-semibold text-slate-800">
                      {{ facade.currentUser()?.fullName }}
                    </p>
                    <p class="text-xs text-slate-500 mt-0.5">
                      {{ facade.currentUser()?.email }}
                    </p>
                    @if (facade.isAdmin()) {
                      <span class="badge badge-primary mt-1.5">Admin</span>
                    }
                  </div>
                  <div class="p-1.5">
                    <button
                      (click)="logout()"
                      class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600
                             hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <span>→</span> Cerrar sesión
                    </button>
                  </div>
                </div>
              }

              <!-- Mobile menu button -->
              <button
                (click)="mobileOpen.set(!mobileOpen())"
                class="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
              >
                {{ mobileOpen() ? '✕' : '☰' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile nav -->
        @if (mobileOpen()) {
          <div
            class="md:hidden border-t border-slate-100 bg-white px-4 py-3
                      flex flex-col gap-1 animate-slide-down"
          >
            @for (item of visibleNav(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-primary-50 text-primary-700"
                (click)="mobileOpen.set(false)"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                        text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span>{{ item.icon }}</span>
                {{ item.label }}
              </a>
            }
          </div>
        }
      </header>

      <!-- Backdrop for dropdown -->
      @if (menuOpen()) {
        <div class="fixed inset-0 z-30" (click)="menuOpen.set(false)"></div>
      }

      <!-- Main content -->
      <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer
        class="border-t border-slate-200 py-4 text-center text-xs text-slate-400"
      >
        Polla Mundialista &copy; 2026 — Andres Felipe Galeano Velasco
      </footer>
    </div>
  `,
})
export class LayoutComponent {
  protected readonly facade = inject(AuthFacade);

  menuOpen = signal(false);
  mobileOpen = signal(false);

  private readonly navItems: NavItem[] = [
    { label: 'Partidos', icon: '🏟', route: '/app/matches' },
    { label: 'Mis pronósticos', icon: '✏️', route: '/app/predictions' },
    { label: 'Ranking', icon: '🏆', route: '/app/leaderboard' },
    { label: 'Admin', icon: '⚙️', route: '/app/admin', adminOnly: true },
  ];

  visibleNav = () =>
    this.navItems.filter((n) => !n.adminOnly || this.facade.isAdmin());

  initials = () => {
    const user = this.facade.currentUser();
    if (!user) return '?';
    return (user.fullName || user.userName)
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  logout(): void {
    this.menuOpen.set(false);
    this.facade.logout();
  }
}
