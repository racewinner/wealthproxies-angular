import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Product, Order, Subscription } from '../models/api.model';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalProducts: number;
}

export interface SystemSettings {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  maxUsersPerPlan: number;
  defaultCurrency: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard Statistics
  getAdminStats(): Observable<AdminStats> {
    console.log('Fetching admin statistics...');
    return this.http.get<AdminStats>(`${this.API_URL}/api/admin/stats`).pipe(
      catchError(error => {
        console.log('Failed to fetch admin stats:', error);
        return of({
          totalUsers: 0,
          activeUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          activeSubscriptions: 0,
          totalProducts: 0
        });
      })
    );
  }

  // User Management
  getAllUsers(): Observable<User[]> {
    console.log('Fetching all users...');
    return this.http.get<User[]>(`${this.API_URL}/api/admin/users`).pipe(
      catchError(error => {
        console.log('Failed to fetch users:', error);
        return of([]);
      })
    );
  }

  getUserById(userId: string): Observable<User | null> {
    console.log('Fetching user by ID:', userId);
    return this.http.get<User>(`${this.API_URL}/api/admin/users/${userId}`).pipe(
      catchError(error => {
        console.log('Failed to fetch user:', error);
        return of(null);
      })
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    console.log('Updating user:', userId);
    return this.http.patch<User>(`${this.API_URL}/api/admin/users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<void> {
    console.log('Deleting user:', userId);
    return this.http.delete<void>(`${this.API_URL}/api/admin/users/${userId}`);
  }

  suspendUser(userId: string): Observable<void> {
    console.log('Suspending user:', userId);
    return this.http.patch<void>(`${this.API_URL}/api/admin/users/${userId}/suspend`, {});
  }

  activateUser(userId: string): Observable<void> {
    console.log('Activating user:', userId);
    return this.http.patch<void>(`${this.API_URL}/api/admin/users/${userId}/activate`, {});
  }

  // Product Management
  getAllProducts(): Observable<Product[]> {
    console.log('Fetching all products for admin...');
    return this.http.get<Product[]>(`${this.API_URL}/api/admin/products`).pipe(
      catchError(error => {
        console.log('Failed to fetch products:', error);
        return of([]);
      })
    );
  }

  createProduct(productData: Partial<Product>): Observable<Product> {
    console.log('Creating product...');
    return this.http.post<Product>(`${this.API_URL}/api/admin/products`, productData);
  }

  updateProduct(productId: string, productData: Partial<Product>): Observable<Product> {
    console.log('Updating product:', productId);
    return this.http.patch<Product>(`${this.API_URL}/api/admin/products/${productId}`, productData);
  }

  deleteProduct(productId: string): Observable<void> {
    console.log('Deleting product:', productId);
    return this.http.delete<void>(`${this.API_URL}/api/admin/products/${productId}`);
  }

  // Order Management
  getAllOrders(): Observable<Order[]> {
    console.log('Fetching all orders for admin...');
    return this.http.get<Order[]>(`${this.API_URL}/api/admin/orders`).pipe(
      catchError(error => {
        console.log('Failed to fetch orders:', error);
        return of([]);
      })
    );
  }

  // Subscription Management
  getAllSubscriptions(): Observable<Subscription[]> {
    console.log('Fetching all subscriptions for admin...');
    return this.http.get<Subscription[]>(`${this.API_URL}/api/admin/subscriptions`).pipe(
      catchError(error => {
        console.log('Failed to fetch subscriptions:', error);
        return of([]);
      })
    );
  }

  // System Settings
  getSystemSettings(): Observable<SystemSettings> {
    console.log('Fetching system settings...');
    return this.http.get<SystemSettings>(`${this.API_URL}/api/admin/settings`).pipe(
      catchError(error => {
        console.log('Failed to fetch system settings:', error);
        return of({
          siteName: 'Wealth Proxies',
          maintenanceMode: false,
          registrationEnabled: true,
          emailNotifications: true,
          maxUsersPerPlan: 1000,
          defaultCurrency: 'USD'
        });
      })
    );
  }

  updateSystemSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    console.log('Updating system settings...');
    return this.http.patch<SystemSettings>(`${this.API_URL}/api/admin/settings`, settings);
  }

  // Export Functions
  exportUsers(format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    console.log('Exporting users as:', format);
    return this.http.get(`${this.API_URL}/api/admin/export/users?format=${format}`, {
      responseType: 'blob'
    });
  }

  exportOrders(format: 'csv' | 'xlsx' = 'csv'): Observable<Blob> {
    console.log('Exporting orders as:', format);
    return this.http.get(`${this.API_URL}/api/admin/export/orders?format=${format}`, {
      responseType: 'blob'
    });
  }

  // System Health
  getSystemHealth(): Observable<any> {
    console.log('Checking system health...');
    return this.http.get(`${this.API_URL}/api/admin/health`).pipe(
      catchError(error => {
        console.log('Failed to fetch system health:', error);
        return of({ status: 'unknown', uptime: 0, memory: 0, cpu: 0 });
      })
    );
  }
}
