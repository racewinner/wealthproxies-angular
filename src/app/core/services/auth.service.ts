import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signal for reactive UI
  public currentUser = signal<User | null>(null);
  public isAuthenticated = signal<boolean>(false);

  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenStorage: TokenStorageService
  ) {
    // Don't call checkAuthStatus here - it will be called by APP_INITIALIZER
  }

  /**
   * Initialize authentication state - called by APP_INITIALIZER
   * Returns a Promise to ensure initialization completes before app starts
   */
  initializeAuth(): Promise<void> {
    console.log('🔐 Initializing authentication...');
    return new Promise((resolve) => {
      // Simple: if we have a token and user in localStorage, we're logged in
      const token = this.tokenStorage.getToken();
      const storedUser = this.tokenStorage.getUser();

      if (token && storedUser) {
        console.log('✅ Found token and user in localStorage - user is logged in');
        this.setCurrentUser(storedUser);
      } else {
        console.log('❌ No token or user found - user is not logged in');
        this.clearCurrentUser();
      }

      console.log('🔐 Authentication initialization complete');
      resolve();
    });
  }



  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Attempting login for:', credentials.email);
    return this.http.post<AuthResponse>(`${this.API_URL}/api/auth/login`, credentials).pipe(
      tap(response => {
        console.log('✅ Login successful:', response);
        this.setCurrentUser(response.user);
        // Store authentication data
        this.storeAuthData(response);
      }),
      catchError(error => {
        console.log('❌ Login failed:', error);
        throw error;
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    console.log('Attempting registration for:', userData.email);
    return this.http.post<AuthResponse>(`${this.API_URL}/api/auth/register`, userData).pipe(
      tap(response => {
        console.log('Registration successful:', response);
        // For email registration, don't set user as logged in until email is verified
        // OAuth registrations will handle login in their respective callback methods
      }),
      catchError(error => {
        console.log('Registration failed:', error);
        throw error;
      })
    );
  }

  logout(): Observable<any> {
    console.log('🚪 Logging out...');
    return this.http.post(`${this.API_URL}/api/auth/logout`, {}).pipe(
      tap(() => {
        console.log('✅ Logout successful');
        this.clearCurrentUser();
        this.router.navigate(['/']);
      }),
      catchError(error => {
        console.log('❌ Logout failed:', error);
        // Clear user anyway on logout error
        this.clearCurrentUser();
        this.router.navigate(['/']);
        return of(null);
      })
    );
  }

  // OAuth Methods
  loginWithGoogle(): Observable<{redirectUrl: string}> {
    console.log('Getting Google OAuth redirect URL...');
    return this.http.get<{redirectUrl: string}>(`${this.API_URL}/api/auth/google`).pipe(
      tap(response => {
        console.log('Google OAuth redirect URL received:', response.redirectUrl);
        window.location.href = response.redirectUrl;
      }),
      catchError(error => {
        console.log('Google OAuth initiation failed:', error);
        throw error;
      })
    );
  }

  loginWithDiscord(): Observable<{redirectUrl: string}> {
    console.log('Getting Discord OAuth redirect URL...');
    return this.http.get<{redirectUrl: string}>(`${this.API_URL}/api/auth/discord`).pipe(
      tap((response: any) => {
        console.log('Discord OAuth redirect URL received:', response.url);
        window.location.href = response.url;
      }),
      catchError(error => {
        console.log('Discord OAuth initiation failed:', error);
        throw error;
      })
    );
  }

  handleDiscordCallback(code: string, state?: string): Observable<AuthResponse> {
    console.log('🔐 Handling Discord callback with code:', code, 'and state:', state);
    const params = new URLSearchParams();
    params.append('code', code);
    if (state) {
      params.append('state', state);
    }

    return this.http.get<AuthResponse>(`${this.API_URL}/api/auth/callback/discord?${params.toString()}`).pipe(
      tap(response => {
        console.log('✅ Discord callback successful:', response);
        this.setCurrentUser(response.user);
        this.storeAuthData(response);
      }),
      catchError(error => {
        console.log('❌ Discord callback failed:', error);
        throw error;
      })
    );
  }

  handleGoogleCallback(code: string, state?: string): Observable<AuthResponse> {
    console.log('🔐 Handling Google callback with code:', code, 'and state:', state);
    const params = new URLSearchParams();
    params.append('code', code);
    if (state) {
      params.append('state', state);
    }

    return this.http.get<AuthResponse>(`${this.API_URL}/api/auth/callback/google?${params.toString()}`).pipe(
      tap(response => {
        console.log('✅ Google callback successful:', response);
        this.setCurrentUser(response.user);
        this.storeAuthData(response);
      }),
      catchError(error => {
        console.log('❌ Google callback failed:', error);
        throw error;
      })
    );
  }

  // Token refresh method
  refreshToken(): Observable<AuthResponse> {
    console.log('Refreshing token...');
    return this.http.post<AuthResponse>(`${this.API_URL}/api/auth/refresh`, {}).pipe(
      tap(response => {
        console.log('Token refresh successful:', response);
        this.setCurrentUser(response.user);
      }),
      catchError(error => {
        console.log('Token refresh failed:', error);
        this.clearCurrentUser();
        throw error;
      })
    );
  }

  getSession(): Observable<AuthResponse | null> {
    console.log('🔍 Checking session with server...');
    return this.http.get<AuthResponse>(`${this.API_URL}/api/auth/get-session`).pipe(
      catchError(error => {
        console.log('❌ Session check failed:', error);
        return of(null);
      })
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    console.log('🔐 Verifying email with token:', token);
    return this.http.post<{ message: string }>(`${this.API_URL}/api/auth/verify-email`, { token }).pipe(
      tap(response => {
        console.log('✅ Email verification successful:', response);
      }),
      catchError(error => {
        console.log('❌ Email verification failed:', error);
        throw error;
      })
    );
  }

  private setCurrentUser(user: User): void {
    console.log('✅ Setting current user:', user);
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    console.log('✅ Auth state updated - isAuthenticated:', this.isAuthenticated());
    console.log('✅ Current user signal:', this.currentUser());
  }

  private storeAuthData(response: AuthResponse): void {
    // Store user data
    this.tokenStorage.setUser(response.user);

    // Store session data
    if (response.session) {
      this.tokenStorage.setSession(response.session);
    }

    // Store JWT token if provided
    if (response.token) {
      this.tokenStorage.setToken(response.token);
    }
  }

  private clearCurrentUser(): void {
    console.log('🧹 Clearing current user and auth state');
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    // Clear all stored auth data
    this.tokenStorage.clearAll();
    console.log('🧹 Auth state cleared - isAuthenticated:', this.isAuthenticated());
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  isLoggedIn(): boolean {
    const authenticated = this.isAuthenticated();

    // If not authenticated in memory, check if we have token + user in localStorage
    if (!authenticated) {
      const token = this.tokenStorage.getToken();
      const storedUser = this.tokenStorage.getUser();

      if (token && storedUser) {
        console.log('📦 Restoring user from localStorage');
        this.setCurrentUser(storedUser);
        return true;
      }
    }

    return authenticated;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}
