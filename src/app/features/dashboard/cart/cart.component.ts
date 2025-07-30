import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService, Cart, CartItem } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cart = signal<Cart | null>(null);
  loading = signal(true);

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart(): void {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load cart:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load cart', 'Close', {
          duration: 5000
        });
      }
    });
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.cartService.updateCartItem(itemId, quantity).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.snackBar.open('Cart updated', 'Close', {
          duration: 2000
        });
      },
      error: (error) => {
        console.error('Failed to update cart:', error);
        this.snackBar.open('Failed to update cart', 'Close', {
          duration: 5000
        });
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.snackBar.open('Item removed from cart', 'Close', {
          duration: 2000
        });
      },
      error: (error) => {
        console.error('Failed to remove item:', error);
        this.snackBar.open('Failed to remove item', 'Close', {
          duration: 5000
        });
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart.set(this.cartService.getCurrentCart());
        this.snackBar.open('Cart cleared', 'Close', {
          duration: 2000
        });
      },
      error: (error) => {
        console.error('Failed to clear cart:', error);
        this.snackBar.open('Failed to clear cart', 'Close', {
          duration: 5000
        });
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/dashboard/shop']);
  }

  proceedToCheckout(): void {
    // TODO: Implement checkout functionality
    this.snackBar.open('Checkout functionality coming soon!', 'Close', {
      duration: 3000
    });
  }

  getItemTotal(item: CartItem): number {
    return item.variant.price * item.quantity;
  }

  formatPrice(priceInCents: number): string {
    return (priceInCents / 100).toFixed(2);
  }
}
