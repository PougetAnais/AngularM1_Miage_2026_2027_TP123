import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Adds the bearer token to protected API requests. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const isPublicAuthRequest = request.url.startsWith('/api/auth/');
  const hasAuthentication = Boolean(token && !isPublicAuthRequest);

  return next(
    hasAuthentication && token
      ? request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : request,
  ).pipe(
    catchError((error: unknown) => {
      if (hasAuthentication && error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
