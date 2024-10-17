import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (next, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the user is logged in
  const isLoggedIn = authService.isLoggedIn();

  if (!isLoggedIn) {
    // Redirect to the login page if not logged in
    // router.navigate(['/login']);
    
    return false; // Prevent access to the route
  }

  return true; // Allow access to the route
};
