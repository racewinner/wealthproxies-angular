import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, CreateOrderResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Create a new order and get Stripe checkout URL
   */
  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse> {
    console.log('Creating order:', request);
    return this.http.post<CreateOrderResponse>(`${this.API_URL}/api/order`, request);
  }
}
