import { Routes } from '@angular/router';

import { devOnlyGuard, devOnlyMatchGuard } from './core/guards/dev-only.guard';

export const devEditorRoutes: Routes = [
  {
    path: 'dev/editor',
    canMatch: [devOnlyMatchGuard],
    canActivate: [devOnlyGuard],
    loadComponent: () =>
      import('./pages/dev-json-editor/dev-json-editor.component').then(
        (module) => module.DevJsonEditorComponent,
      ),
  },
];
