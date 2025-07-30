import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../models/api.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all products from the API
   */
  getProducts(): Observable<Product[]> {
    console.log('Fetching products...');
    return this.http.get<Product[]>(`${this.API_URL}/api/products`).pipe(
      catchError(error => {
        console.log('Failed to fetch products:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific product by ID
   */
  getProduct(id: string): Observable<Product | null> {
    console.log('Fetching product:', id);
    return this.http.get<Product>(`${this.API_URL}/api/products/${id}`).pipe(
      catchError(error => {
        console.log('Failed to fetch product:', error);
        return of(null);
      })
    );
  }

  /**
   * Filter products by type
   */
  getProductsByType(productType: 'residential' | 'isp' | 'server' | 'proxy_list'): Observable<Product[]> {
    return new Observable(observer => {
      this.getProducts().subscribe({
        next: (products) => {
          const filtered = products.filter(product => product.productType === productType);
          observer.next(filtered);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Get only active products
   */
  getActiveProducts(): Observable<Product[]> {
    return new Observable(observer => {
      this.getProducts().subscribe({
        next: (products) => {
          const active = products.filter(product => product.isActive);
          observer.next(active);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Create a new product
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    console.log('Creating product:', product);
    return this.http.post<Product>(`${this.API_URL}/api/products`, product).pipe(
      catchError(error => {
        console.log('Failed to create product:', error);
        throw error;
      })
    );
  }

  /**
   * Update a product
   */
  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    console.log('Updating product:', id, product);
    return this.http.put<Product>(`${this.API_URL}/api/products/${id}`, product).pipe(
      catchError(error => {
        console.log('Failed to update product:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<void> {
    console.log('Deleting product:', id);
    return this.http.delete<void>(`${this.API_URL}/api/products/${id}`).pipe(
      catchError(error => {
        console.log('Failed to delete product:', error);
        throw error;
      })
    );
  }
}
