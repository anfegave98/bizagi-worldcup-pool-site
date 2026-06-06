import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { adminGuard } from './auth/guards/role.guard';

export const routes: Routes = [
  // Redirect raíz
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // Auth — público
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/components/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/components/register/register.component').then(m => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // App — autenticado
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pool/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'matches',
        loadComponent: () =>
          import('./pool/components/match-list/match-list.component').then(m => m.MatchListComponent),
      },
      {
        path: 'predictions',
        loadComponent: () =>
          import('./pool/components/my-predictions/my-predictions.component').then(m => m.MyPredictionsComponent),
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./pool/components/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pool/components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      { path: '', redirectTo: 'matches', pathMatch: 'full' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'auth/login' },
];
