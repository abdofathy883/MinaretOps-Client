import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const token = authService.getAuthorizationToken();
  const router = inject(Router);
  const userId = authService.getCurrentUserId();

  if (token) {
    return router.navigate(['/users/my-account', userId]);
  }
  return true;
};
