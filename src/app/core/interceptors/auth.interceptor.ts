import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);

  // Get JWT token if available
  const token = tokenStorage.getToken();

  // Prepare headers
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Clone the request and add headers
  const authReq = req.clone({
    setHeaders: headers
  });

  console.log('HTTP Request:', authReq.method, authReq.url, token ? 'with token' : 'without token');

  return next(authReq);
};
