import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BillingInfo, Subscription, PaymentMethod, OrdersResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBillingInfo(): Observable<BillingInfo> {
    console.log('Fetching billing info...');
    return this.http.get<BillingInfo>(`${this.API_URL}/api/order/subscriptions`).pipe(
      catchError(error => {
        console.log('Failed to fetch billing info:', error);
        return of({
          subscriptions: [],
          paymentMethods: [],
          totalSpent: 0,
          activeSubscriptions: 0
        });
      })
    );
  }

  getSubscriptions(): Observable<Subscription[]> {
    console.log('Fetching subscriptions...');
    return this.http.get<Subscription[]>(`${this.API_URL}/api/order/subscriptions`).pipe(
      catchError(error => {
        console.log('Failed to fetch subscriptions:', error);
        return of([]);
      })
    );
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    console.log('Fetching payment methods...');
    return this.http.get<PaymentMethod[]>(`${this.API_URL}/api/billing/payment-methods`).pipe(
      catchError(error => {
        console.log('Failed to fetch payment methods:', error);
        return of([]);
      })
    );
  }

  addPaymentMethod(paymentMethod: Partial<PaymentMethod>): Observable<PaymentMethod> {
    console.log('Adding payment method...');
    return this.http.post<PaymentMethod>(`${this.API_URL}/api/billing/payment-methods`, paymentMethod);
  }

  removePaymentMethod(paymentMethodId: string): Observable<void> {
    console.log('Removing payment method:', paymentMethodId);
    return this.http.delete<void>(`${this.API_URL}/api/billing/payment-methods/${paymentMethodId}`);
  }

  setDefaultPaymentMethod(paymentMethodId: string): Observable<void> {
    console.log('Setting default payment method:', paymentMethodId);
    return this.http.patch<void>(`${this.API_URL}/api/billing/payment-methods/${paymentMethodId}/default`, {});
  }

  cancelSubscription(subscriptionId: string): Observable<void> {
    console.log('Cancelling subscription:', subscriptionId);
    return this.http.patch<void>(`${this.API_URL}/api/order/subscriptions/${subscriptionId}/cancel`, {});
  }

  renewSubscription(subscriptionId: string): Observable<Subscription> {
    console.log('Renewing subscription:', subscriptionId);
    return this.http.patch<Subscription>(`${this.API_URL}/api/order/subscriptions/${subscriptionId}/renew`, {});
  }

  getOrders(page: number = 1, size: number = 10): Observable<OrdersResponse> {
    console.log('Fetching orders...', { page, size });
    return this.http.get<OrdersResponse>(`${this.API_URL}/api/order`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      catchError(error => {
        console.log('Failed to fetch orders:', error);
        return of({
          orders: [],
          total: 0,
          page: page,
          size: size
        });
      })
    );
  }

  downloadReceipt(orderId: string): Observable<Blob> {
    console.log('Downloading receipt for order:', orderId);
    return this.http.get(`${this.API_URL}/api/order/${orderId}/receipt`, {
      responseType: 'blob'
    });
  }

  exportOrders(format: 'csv' | 'pdf' = 'csv'): Observable<Blob> {
    console.log('Exporting orders as:', format);
    return this.http.get(`${this.API_URL}/api/order/export?format=${format}`, {
      responseType: 'blob'
    });
  }
}
