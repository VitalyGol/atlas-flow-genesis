import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MockAuthService } from '../../core/services/mock-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(MockAuthService);
  private readonly router = inject(Router);

  protected readonly hasError = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['admin', Validators.required],
    password: ['storymap', Validators.required]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();
    const success = this.auth.login(username, password);
    this.hasError.set(!success);

    if (success) {
      void this.router.navigate(['/admin']);
    }
  }
}
