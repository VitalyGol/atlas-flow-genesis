import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { MockAuthService } from '../services/mock-auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(MockAuthService);
  const router = inject(Router);

  return auth.isAdmin() ? true : router.createUrlTree(['/access-denied']);
};
