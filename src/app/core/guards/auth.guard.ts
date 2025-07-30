import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isLoggedIn();
  console.log('Auth guard check - isAuthenticated:', isAuthenticated);
  console.log('Auth guard check - current user:', authService.getCurrentUser());

  if (isAuthenticated) {
    console.log('User authenticated, allowing access to:', state.url);
    return true;
  } else {
    console.log('User not authenticated, redirecting to login from:', state.url);
    router.navigate(['/login']);
    return false;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Admin guard check - isAdmin:', authService.isAdmin());
  
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  } else {
    console.log('User not admin, redirecting to dashboard');
    router.navigate(['/dashboard']);
    return false;
  }
};


