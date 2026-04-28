import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { GoogleAuthService } from '../../shared/services/google-auth.service';
import { ToastService } from '../../shared/services/toast.service';

type Profile = Record<string, any> | null;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NgbToastModule
  ],
  templateUrl: './base.component.html',
  styleUrl: './base.component.scss'
})
export class AdminBaseComponent {
  profile = signal<Profile>(null);
  private authService = inject(GoogleAuthService);
  toastService = inject(ToastService);

  constructor() {
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
