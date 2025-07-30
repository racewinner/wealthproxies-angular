import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Product, ProductVariant } from '../models/api.model';
import { ProductService } from './product.service';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'wealthproxies_cart';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartItemCountSubject = new BehaviorSubject<number>(0);

  cart$ = this.cartSubject.asObservable();
  cartItemCount$ = this.cartItemCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private productService: ProductService
  ) {
    this.loadCart();
  }

  /**
   * Load the cart from localStorage
   */
  loadCart(): void {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const cart: Cart = JSON.parse(cartData);
        this.cartSubject.next(cart);
        this.cartItemCountSubject.next(cart.totalItems);
      } else {
        const emptyCart = this.createEmptyCart();
        this.cartSubject.next(emptyCart);
        this.cartItemCountSubject.next(0);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      const emptyCart = this.createEmptyCart();
      this.cartSubject.next(emptyCart);
      this.cartItemCountSubject.next(0);
    }
  }

  /**
   * Get the current cart
   */
  getCart(): Observable<Cart | null> {
    return of(this.cartSubject.value);
  }

  /**
   * Save cart to localStorage
   */
  private saveCart(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  /**
   * Create an empty cart
   */
  private createEmptyCart(): Cart {
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
      currency: 'USD'
    };
  }

  /**
   * Add an item to the cart
   */
  addToCart(productId: string, variantId: string, quantity: number = 1): Observable<Cart> {
    console.log('Adding to cart:', { productId, variantId, quantity });

    return new Observable(observer => {
      this.productService.getProducts().subscribe({
        next: (products) => {
          const product = products.find(p => p.id === productId);
          const variant = product?.variants.find(v => v.id === variantId);

          if (!product || !variant) {
            observer.error(new Error('Product or variant not found'));
            return;
          }

          const currentCart = this.cartSubject.value || this.createEmptyCart();

          // Check if item already exists in cart
          const existingItemIndex = currentCart.items.findIndex(
            item => item.productId === productId && item.variantId === variantId
          );

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            currentCart.items[existingItemIndex].quantity += quantity;
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${productId}-${variantId}-${Date.now()}`,
              productId,
              variantId,
              quantity,
              product,
              variant,
              addedAt: new Date()
            };
            currentCart.items.push(newItem);
          }

          // Recalculate totals
          this.recalculateCart(currentCart);

          // Save and update
          this.saveCart(currentCart);
          this.cartSubject.next(currentCart);
          this.cartItemCountSubject.next(currentCart.totalItems);

          observer.next(currentCart);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(itemId: string, quantity: number): Observable<Cart> {
    console.log('Updating cart item:', { itemId, quantity });

    return new Observable(observer => {
      const currentCart = this.cartSubject.value || this.createEmptyCart();
      const itemIndex = currentCart.items.findIndex(item => item.id === itemId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          currentCart.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          currentCart.items[itemIndex].quantity = quantity;
        }

        this.recalculateCart(currentCart);
        this.saveCart(currentCart);
        this.cartSubject.next(currentCart);
        this.cartItemCountSubject.next(currentCart.totalItems);

        observer.next(currentCart);
        observer.complete();
      } else {
        observer.error(new Error('Cart item not found'));
      }
    });
  }

  /**
   * Remove an item from the cart
   */
  removeFromCart(itemId: string): Observable<Cart> {
    console.log('Removing from cart:', itemId);

    return new Observable(observer => {
      const currentCart = this.cartSubject.value || this.createEmptyCart();
      const itemIndex = currentCart.items.findIndex(item => item.id === itemId);

      if (itemIndex >= 0) {
        currentCart.items.splice(itemIndex, 1);
        this.recalculateCart(currentCart);
        this.saveCart(currentCart);
        this.cartSubject.next(currentCart);
        this.cartItemCountSubject.next(currentCart.totalItems);

        observer.next(currentCart);
        observer.complete();
      } else {
        observer.error(new Error('Cart item not found'));
      }
    });
  }

  /**
   * Clear the entire cart
   */
  clearCart(): Observable<void> {
    console.log('Clearing cart...');

    return new Observable(observer => {
      const emptyCart = this.createEmptyCart();
      this.saveCart(emptyCart);
      this.cartSubject.next(emptyCart);
      this.cartItemCountSubject.next(0);

      observer.next();
      observer.complete();
    });
  }

  /**
   * Recalculate cart totals
   */
  private recalculateCart(cart: Cart): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.variant.price * item.quantity);
    }, 0);
  }

  /**
   * Get cart item count as observable
   */
  getCartItemCount(): Observable<number> {
    return this.cartItemCount$;
  }

  /**
   * Get current cart value
   */
  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Get current cart item count
   */
  getCurrentCartItemCount(): number {
    return this.cartItemCountSubject.value;
  }

  /**
   * Get cart data for checkout (to be sent to API during checkout)
   */
  getCartForCheckout(): Cart | null {
    return this.cartSubject.value;
  }
}
