import { Injectable } from '@angular/core';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';

// const WHITELIST = ['somin1968@gmail.com', 'somin@mnemonic.co.jp'];
const WHITELIST = ['somin1968@gmail.com'];

type Profile = Record<string, any> | null;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  profile: Profile = null;

  constructor(
    private oAuthService: OAuthService
  ) {
    this.oAuthService.configure({
      issuer: 'https://accounts.google.com',
      clientId: '269403970246-e82jf5rgdtacac3i65f02562g8hun073.apps.googleusercontent.com',
      redirectUri: `${window.location.origin}/admin`,
      scope: 'openid profile email',
      strictDiscoveryDocumentValidation: false
    });
    this.oAuthService.setupAutomaticSilentRefresh();
  }

  getProfile(): Promise<Profile> {
    return new Promise<Profile>((resolve, reject) => {
      if (this.profile) {
        return resolve(this.profile);
      }
      this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(() => {
        if (this.oAuthService.hasValidIdToken()) {
          const profile: Profile = this.oAuthService.getIdentityClaims();
          if (profile && WHITELIST.includes(profile['email'])) {
            this.profile = profile;
            return resolve(this.profile);
          }
          this.logout();
          window.location.href = '/';
          return reject();
        }
        resolve(null);
      }, error => {
        if (error instanceof(OAuthErrorEvent)) {
          return resolve(null);
        }
        reject();
      });
    });
  }

  login(): void {
    this.oAuthService.initImplicitFlow();
  }

  logout(): void {
    this.oAuthService.revokeTokenAndLogout();
    this.oAuthService.logOut();
    this.profile = null;
  }
}
