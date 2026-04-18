import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleAuthService } from '../../shared/services/google-auth.service';

type Profile = Record<string, any> | null;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './base.component.html',
  styleUrl: './base.component.scss'
})
export class AdminBaseComponent {
  profile = signal<Profile>(null);

  constructor(private authService: GoogleAuthService) {
    this.authService.getProfile().then((profile: Profile) => {
      if (profile) {
        this.profile.set(profile);
      } else {
        this.authService.login();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.profile.set(null);
    window.location.href = '/admin';
  }
}
