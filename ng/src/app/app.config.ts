import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideMarkdown } from 'ngx-markdown';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { coreInterceptor } from './shared/interceptors/core.interceptor';
import { googleAuthInterceptor } from './shared/interceptors/google-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([coreInterceptor, googleAuthInterceptor])),
    provideOAuthClient(),
    provideMarkdown(),
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: '6Lcl_3MeAAAAANxWTdd4BHMG9WflFiTowhKk3JDK'
    }
  ]
};
