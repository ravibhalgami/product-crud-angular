import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const bypassUrls = ['/login', '/signup']; // Add your login and signup endpoints here

    // Check if the request URL contains any of the bypass URLs
    const shouldBypass = bypassUrls.some(url => req.url.includes(url));

    if (shouldBypass) {
      // Skip adding Authorization header for login or signup requests
      return next.handle(req);
    }
    const authToken = this.authService.getToken();
    if (!authToken || this.authService.isTokenExpired(authToken)) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('JWT token has expired, redirecting to login.'));
    }

    // Clone the request and add the Authorization header with the token
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    return next.handle(authReq);
  }
}
