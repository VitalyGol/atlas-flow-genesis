import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';

const blockInProduction = () => {
  const router = inject(Router);
  return environment.editorEnabled ? true : router.createUrlTree(['/']);
};

export const devOnlyGuard: CanActivateFn = () => blockInProduction();
export const devOnlyMatchGuard: CanMatchFn = () => blockInProduction();
