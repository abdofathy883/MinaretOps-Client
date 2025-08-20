import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const token = authService.getAuthorizationToken();
  const router = inject(Router);

  if (token) {
    return router.navigate(['/dashboard']);
  }
  return true;
};
