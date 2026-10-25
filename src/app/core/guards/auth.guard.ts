import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session-store';

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionStore);
  const router = inject(Router);

  if (session.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);

  return session.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};

/** Every data endpoint is admin-only; non-admin accounts get an explanation page. */
export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);

  const user = session.user();
  if (!user) return router.createUrlTree(['/login']);
  if (user.role !== 'admin') return router.createUrlTree(['/akses-ditolak']);

  return true;
};
