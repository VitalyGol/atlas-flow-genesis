import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MockAuthService } from '../../core/services/mock-auth.service';

@Component({
  selector: 'app-shell',
  imports: [MatButtonModule, MatToolbarModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  protected readonly auth = inject(MockAuthService);

  protected toggleAdminSession(): void {
    if (this.auth.isAdmin()) {
      this.auth.logout();
      return;
    }

    this.auth.login('admin', 'storymap');
  }
}
