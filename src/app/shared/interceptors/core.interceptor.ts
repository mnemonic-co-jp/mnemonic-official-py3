import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

export const coreInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const toastService = inject(ToastService);
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    toastService.show({
      body: 'サーバとの通信時にエラーが発生しました。',
      classname: 'bg-danger text-light'
    });
    return throwError(() => error);
  }));
}
