import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in · Worker Admin',
    loadComponent: () => import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    title: 'Create account · Worker Admin',
    loadComponent: () =>
      import('./features/auth/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · Worker Admin',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'tasks',
        title: 'Tasks · Worker Admin',
        loadComponent: () => import('./features/tasks/tasks-page').then((m) => m.TasksPage),
      },
      {
        path: 'validation',
        title: 'Validation lab · Worker Admin',
        loadComponent: () =>
          import('./features/validation/validation-page').then((m) => m.ValidationPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
