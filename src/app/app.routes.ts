import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Masuk · Admin Kepegawaian',
    loadComponent: () => import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-shell/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        title: 'Dashboard · Admin Kepegawaian',
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'pegawai',
        canActivate: [adminGuard],
        title: 'Pegawai · Admin Kepegawaian',
        loadComponent: () =>
          import('./features/pegawai/pegawai-page/pegawai-page').then((m) => m.PegawaiPage),
      },
      {
        path: 'bidang',
        canActivate: [adminGuard],
        title: 'Bidang · Admin Kepegawaian',
        loadComponent: () =>
          import('./features/bidang/bidang-page/bidang-page').then((m) => m.BidangPage),
      },
      {
        path: 'pangkat-golongan',
        canActivate: [adminGuard],
        title: 'Pangkat & Golongan · Admin Kepegawaian',
        loadComponent: () =>
          import('./features/pangkat-golongan/pangkat-golongan-page/pangkat-golongan-page').then(
            (m) => m.PangkatGolonganPage,
          ),
      },
      {
        path: 'akses-ditolak',
        title: 'Akses ditolak · Admin Kepegawaian',
        loadComponent: () =>
          import('./features/forbidden/forbidden-page').then((m) => m.ForbiddenPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
