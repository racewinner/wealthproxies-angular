import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  UserProfile, 
  UserProviderAccount, 
  UserProviderAccountStatus,
  UserBandwidthData,
  UserOrderData,
  UserSubscriptionData
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all users
   */
  getUsers(): Observable<UserProfile[]> {
    console.log('Fetching all users...');
    return this.http.get<UserProfile[]>(`${this.API_URL}/api/user`).pipe(
      catchError(error => {
        console.log('Failed to fetch users:', error);
        return of([]);
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<UserProfile | null> {
    console.log('Fetching user by ID:', id);
    return this.http.get<UserProfile>(`${this.API_URL}/api/user/${id}`).pipe(
      catchError(error => {
        console.log('Failed to fetch user:', error);
        return of(null);
      })
    );
  }

  /**
   * Get user profile by ID (alias for getUser)
   */
  getUserProfile(id: string): Observable<UserProfile> {
    console.log('Fetching user profile by ID:', id);
    return this.http.get<UserProfile>(`${this.API_URL}/api/user/${id}`).pipe(
      catchError(error => {
        console.log('Failed to fetch user profile:', error);
        throw error;
      })
    );
  }

  /**
   * Create new user
   */
  createUser(userData: Partial<UserProfile>): Observable<UserProfile> {
    console.log('Creating user:', userData);
    return this.http.post<UserProfile>(`${this.API_URL}/api/user`, userData).pipe(
      catchError(error => {
        console.log('Failed to create user:', error);
        throw error;
      })
    );
  }

  /**
   * Update user by ID
   */
  updateUser(id: string, userData: Partial<UserProfile>): Observable<UserProfile> {
    console.log('Updating user:', id, userData);
    return this.http.put<UserProfile>(`${this.API_URL}/api/user/${id}`, userData).pipe(
      catchError(error => {
        console.log('Failed to update user:', error);
        throw error;
      })
    );
  }

  /**
   * Delete user by ID
   */
  deleteUser(id: string): Observable<void> {
    console.log('Deleting user:', id);
    return this.http.delete<void>(`${this.API_URL}/api/user/${id}`).pipe(
      catchError(error => {
        console.log('Failed to delete user:', error);
        throw error;
      })
    );
  }

  /**
   * Force verify user email
   */
  forceVerifyUserEmail(id: string): Observable<void> {
    console.log('Force verifying user email:', id);
    return this.http.post<void>(`${this.API_URL}/api/user/${id}/verify-email`, {}).pipe(
      catchError(error => {
        console.log('Failed to force verify user email:', error);
        throw error;
      })
    );
  }

  /**
   * Get user orders (current user)
   */
  getUserOrders(): Observable<UserOrderData>;
  /**
   * Get user orders by user ID
   */
  getUserOrders(userId: string): Observable<UserOrderData>;
  getUserOrders(userId?: string): Observable<UserOrderData> {
    const endpoint = userId
      ? `${this.API_URL}/api/user/${userId}/orders`
      : `${this.API_URL}/api/user/orders`;

    console.log('Fetching user orders:', userId ? `for user ${userId}` : 'for current user');
    return this.http.get<UserOrderData>(endpoint).pipe(
      catchError(error => {
        console.log('Failed to fetch user orders:', error);
        return of({ orders: [], totalOrders: 0, totalSpent: 0 });
      })
    );
  }

  /**
   * Get user subscriptions
   */
  getUserSubscriptions(): Observable<UserSubscriptionData> {
    console.log('Fetching user subscriptions...');
    return this.http.get<UserSubscriptionData>(`${this.API_URL}/api/user/subscriptions`).pipe(
      catchError(error => {
        console.log('Failed to fetch user subscriptions:', error);
        return of({ subscriptions: [], activeSubscriptions: 0, totalSubscriptions: 0 });
      })
    );
  }

  /**
   * Get user bandwidth data
   */
  getUserBandwidth(): Observable<UserBandwidthData> {
    console.log('Fetching user bandwidth...');
    return this.http.get<UserBandwidthData>(`${this.API_URL}/api/user/bandwidth`).pipe(
      catchError(error => {
        console.log('Failed to fetch user bandwidth:', error);
        return of({ 
          totalBandwidth: 0, 
          usedBandwidth: 0, 
          remainingBandwidth: 0, 
          resetDate: new Date() 
        });
      })
    );
  }

  /**
   * Get all user provider accounts
   */
  getUserProviderAccounts(): Observable<UserProviderAccount[]> {
    console.log('Fetching user provider accounts...');
    return this.http.get<UserProviderAccount[]>(`${this.API_URL}/api/user/provider-accounts`).pipe(
      catchError(error => {
        console.log('Failed to fetch user provider accounts:', error);
        return of([]);
      })
    );
  }

  /**
   * Get specific user provider account
   */
  getUserProviderAccount(provider: string): Observable<UserProviderAccount | null> {
    console.log('Fetching user provider account:', provider);
    return this.http.get<UserProviderAccount>(`${this.API_URL}/api/user/provider-accounts/${provider}`).pipe(
      catchError(error => {
        console.log('Failed to fetch user provider account:', error);
        return of(null);
      })
    );
  }

  /**
   * Create user provider account
   */
  createUserProviderAccount(provider: string, accountData: Partial<UserProviderAccount>): Observable<UserProviderAccount> {
    console.log('Creating user provider account:', provider, accountData);
    return this.http.post<UserProviderAccount>(`${this.API_URL}/api/user/provider-accounts/${provider}`, accountData).pipe(
      catchError(error => {
        console.log('Failed to create user provider account:', error);
        throw error;
      })
    );
  }

  /**
   * Update user provider account
   */
  updateUserProviderAccount(provider: string, accountData: Partial<UserProviderAccount>): Observable<UserProviderAccount> {
    console.log('Updating user provider account:', provider, accountData);
    return this.http.put<UserProviderAccount>(`${this.API_URL}/api/user/provider-accounts/${provider}`, accountData).pipe(
      catchError(error => {
        console.log('Failed to update user provider account:', error);
        throw error;
      })
    );
  }

  /**
   * Delete user provider account
   */
  deleteUserProviderAccount(provider: string): Observable<void> {
    console.log('Deleting user provider account:', provider);
    return this.http.delete<void>(`${this.API_URL}/api/user/provider-accounts/${provider}`).pipe(
      catchError(error => {
        console.log('Failed to delete user provider account:', error);
        throw error;
      })
    );
  }

  /**
   * Get user provider account status
   */
  getUserProviderAccountStatus(provider: string): Observable<UserProviderAccountStatus | null> {
    console.log('Fetching user provider account status:', provider);
    return this.http.get<UserProviderAccountStatus>(`${this.API_URL}/api/user/provider-accounts/${provider}/status`).pipe(
      catchError(error => {
        console.log('Failed to fetch user provider account status:', error);
        return of(null);
      })
    );
  }

  /**
   * Filter provider accounts by status
   */
  getProviderAccountsByStatus(status: 'active' | 'inactive' | 'suspended' | 'pending'): Observable<UserProviderAccount[]> {
    return new Observable(observer => {
      this.getUserProviderAccounts().subscribe({
        next: (accounts) => {
          const filtered = accounts.filter(account => account.status === status);
          observer.next(filtered);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Get only active provider accounts
   */
  getActiveProviderAccounts(): Observable<UserProviderAccount[]> {
    return this.getProviderAccountsByStatus('active');
  }
}
