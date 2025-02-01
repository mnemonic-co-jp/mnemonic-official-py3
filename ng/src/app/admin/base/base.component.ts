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
  profile: Profile = null;

  constructor(private authService: GoogleAuthService) {
    this.authService.getProfile().then((profile: Profile) => {
      console.log(profile);
      if (!profile) {
        this.authService.login();
        return;
      }
      this.profile = profile;
    });
  }

  logout() {
    this.authService.logout();
    this.profile = null;
    window.location.href = '/admin';
  }
}
