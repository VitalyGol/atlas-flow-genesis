import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private readonly adminSession = signal(false);
  private readonly username = 'admin';
  private readonly password = 'storymap';

  readonly isAdmin = this.adminSession.asReadonly();

  login(username: string, password: string): boolean {
    const success = username === this.username && password === this.password;
    this.adminSession.set(success);

    return success;
  }

  logout(): void {
    this.adminSession.set(false);
  }
}
