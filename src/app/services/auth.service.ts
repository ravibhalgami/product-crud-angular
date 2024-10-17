import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment.development';
import { ErrorHandlerService } from './error-handler.service';

interface User {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}auth`;

  private userRoleSubject = new BehaviorSubject<string | null>(null); // BehaviorSubject for user role
  userRole$ = this.userRoleSubject.asObservable();

  private loggedInSubject = new BehaviorSubject<boolean>(false); // BehaviorSubject for logged-in status
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private errorHandlerSevice : ErrorHandlerService) {
    this.initializeAuthState()
  }

  signup(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user).pipe(
      catchError(this.errorHandlerSevice.handleError) // Handle errors
    );
  }

  login(credentials: Credentials): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.setAuthToken(response.accessToken);
        this.setUserRole();
        this.loggedInSubject.next(true);
      }),
      catchError(this.errorHandlerSevice.handleError)
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.clearAuthToken();
      this.loggedInSubject.next(false);
      this.userRoleSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const name = 'token=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        console.log(cookie);
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
    }
    return null; // Return null if no token is found
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      console.log(decodedToken.role);
      return decodedToken.role || null; // Adjust this based on your token structure
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token; // Return true if a token exists
  }

  getTokenExpiration(token: string): number {
    const decoded: any = jwtDecode(token);
    return decoded.exp;
  }

  // Check if the token is expired
  isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return now > expiration;
  }

  private clearAuthToken(): void {
    this.setCookie('token', '', -1); // Set cookie with max-age 0 to clear it
  }

  private setCookie(name: string, value: string, days: number = 1): void {
    if (isPlatformBrowser(this.platformId)) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/;`;
    }
  }

  private setAuthToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = `token=${token}; path=/;`; // Store token in a secure cookie
    }
  }

  private getCookie(name: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const nameEQ = name + '=';
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        let c = cookie.trim();
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
    }
    return null;
  }

  private setUserRole(): void {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userRoleSubject.next(decodedToken.role || null); // Emit the role value
    } else {
      this.userRoleSubject.next(null); // No token found
    }
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    this.loggedInSubject.next(!!token); // Set logged-in status based on token existence
    this.setUserRole(); // Initialize user role based on the token
  }
}
