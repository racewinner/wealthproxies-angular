import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly SESSION_KEY = 'auth_session';

  constructor() {}

  /**
   * Store JWT token in localStorage
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Remove JWT token from localStorage
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Store user data in localStorage
   */
  setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Get user data from localStorage
   */
  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  /**
   * Remove user data from localStorage
   */
  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Store session data in localStorage
   */
  setSession(session: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  /**
   * Get session data from localStorage
   */
  getSession(): any | null {
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    }
    return null;
  }

  /**
   * Remove session data from localStorage
   */
  removeSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Clear all stored authentication data
   */
  clearAll(): void {
    this.removeToken();
    this.removeUser();
    this.removeSession();
  }

  /**
   * Check if user has valid stored authentication data
   */
  hasValidAuth(): boolean {
    const token = this.getToken();
    const user = this.getUser();

    // Simple: if we have both token and user, we're good
    return !!(token && user);
  }
}
