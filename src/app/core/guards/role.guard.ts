import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, map } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const roles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const requireAll = route.data?.['requireAll'] ?? false;

  const userId = authService.getCurrentUserId();
  if (!userId) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
  return authService.getById(userId).pipe(
    map(user => {
      if (!roles.length) return true;
      const hasAny = roles.some(r => user.roles.includes(r));
      const hasAll = roles.every(r => user.roles.includes(r));
      const authorized = requireAll ? hasAll : hasAny;
      return authorized ? true
      : router.createUrlTree(['/access-denied'], {
        queryParams: { returnUrl: state.url },
      });
    }),
    catchError(() => {
      return [router.createUrlTree(['/access-denied'], {
        queryParams: { returnUrl: state.url },
      })];
    })
  )
};
