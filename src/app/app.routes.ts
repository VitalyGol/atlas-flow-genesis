import { Routes } from '@angular/router';

import { adminGuard } from './core/guards/admin.guard';
import { ShellComponent } from './layout/shell/shell.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { HomeComponent } from './pages/home/home.component';
import { SceneReaderComponent } from './pages/scene-reader/scene-reader.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'scenes/:sceneId',
        component: SceneReaderComponent
      },
      {
        path: 'admin/login',
        component: AdminLoginComponent
      },
      {
        path: 'access-denied',
        component: AccessDeniedComponent
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        component: AdminDashboardComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
