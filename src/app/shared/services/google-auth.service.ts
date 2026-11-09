import { Injectable, inject } from '@angular/core';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';

const WHITELIST = ['somin1968@gmail.com'];
const TOKEN_ENDPOINT = `${window.location.origin}/admin/api/oauth/token`;

type Profile = Record<string, any> | null;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  profile: Profile = null;
  private oAuthService = inject(OAuthService);

  constructor() {
    this.oAuthService.configure({
      issuer: 'https://accounts.google.com',
      clientId: '269403970246-e82jf5rgdtacac3i65f02562g8hun073.apps.googleusercontent.com',
      redirectUri: `${window.location.origin}/admin`,
      responseType: 'code',
      scope: 'openid profile email',
      strictDiscoveryDocumentValidation: false,
      tokenEndpoint: TOKEN_ENDPOINT,
      // refresh_token で更新する。iframe の prompt=none は Google では通らない。
      useSilentRefresh: false,
    });
    this.oAuthService.setupAutomaticSilentRefresh();
  }

  getProfile(): Promise<Profile> {
    return new Promise<Profile>((resolve, reject) => {
      if (this.profile) {
        return resolve(this.profile);
      }
      this.oAuthService.loadDiscoveryDocument().then(() => {
        // discovery が token endpoint を Google に上書きするので、交換先を戻す。
        this.oAuthService.tokenEndpoint = TOKEN_ENDPOINT;
        return this.oAuthService.tryLogin();
      }).then(() => {
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
    // access_type=offline と prompt=consent は認可リクエストだけに付ける。
    // customQueryParams に置くとトークン交換にも送られてしまう。
    this.oAuthService.initCodeFlow('', {
      access_type: 'offline',
      prompt: 'consent',
    });
  }

  logout(): void {
    this.oAuthService.revokeTokenAndLogout();
    this.oAuthService.logOut();
    this.profile = null;
  }
}
