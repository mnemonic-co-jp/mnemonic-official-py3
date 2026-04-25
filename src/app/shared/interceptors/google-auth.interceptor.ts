import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OAuthStorage } from 'angular-oauth2-oidc';
import { GoogleAuthService } from '../../shared/services/google-auth.service';

export const googleAuthInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const oAuthStorage = inject(OAuthStorage);
  const authService = inject(GoogleAuthService);
  if (request.url.startsWith('/admin/api/') && !request.headers.has('Authorization')) {
    const token: string | null = oAuthStorage.getItem('id_token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        window.location.reload();
        return next(request);
      }
      return throwError(() => error);
    })
  );
};
