import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService, Cart, CartItem } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Backdrop -->
    @if (isOpen) {
      <div class="cart-backdrop" (click)="close()"></div>
    }

    <!-- Cart Sidebar -->
    <div class="cart-sidebar" [class.open]="isOpen">
      <div class="cart-header">
        <h2>Shopping Cart</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="cart-content">
        @if (cart() && cart()!.items.length > 0) {
          <div class="cart-items">
            @for (item of cart()!.items; track item.id) {
              <div class="cart-item">
                <div class="item-info">
                  <h4>{{ item.product.name }}</h4>
                  <p class="variant-name">{{ item.variant.name }}</p>
                  <p class="item-price">\${{ formatPrice(item.variant.price) }} each</p>
                </div>
                
                <div class="item-controls">
                  <div class="quantity-controls">
                    <button mat-icon-button (click)="updateQuantity(item.id, item.quantity - 1)">
                      <mat-icon>remove</mat-icon>
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button mat-icon-button (click)="updateQuantity(item.id, item.quantity + 1)">
                      <mat-icon>add</mat-icon>
                    </button>
                  </div>
                  
                  <button mat-icon-button class="remove-btn" (click)="removeItem(item.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                
                <div class="item-total">
                  \${{ formatPrice(getItemTotal(item)) }}
                </div>
              </div>
              
              @if (!$last) {
                <mat-divider></mat-divider>
              }
            }
          </div>

          <div class="cart-footer">
            <div class="cart-total">
              <div class="total-items">{{ cart()!.totalItems }} items</div>
              <div class="total-price">Total: \${{ formatPrice(cart()!.totalAmount) }}</div>
            </div>
            
            <div class="cart-actions">
              <button mat-stroked-button (click)="clearCart()" class="clear-btn">
                Clear Cart
              </button>
              <button mat-raised-button color="primary" (click)="checkout()" class="checkout-btn">
                Checkout
              </button>
            </div>
          </div>
        } @else {
          <div class="empty-cart">
            <mat-icon class="empty-icon">shopping_cart</mat-icon>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <button mat-raised-button color="primary" (click)="close()">
              Continue Shopping
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './cart-sidebar.component.scss'
})
export class CartSidebarComponent {
  @Input() isOpen = false;
  @Output() closeCart = new EventEmitter<void>();

  cart = signal<Cart | null>(null);

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    // Subscribe to cart changes
    this.cartService.cart$.subscribe(cart => {
      this.cart.set(cart);
    });
  }

  close(): void {
    this.closeCart.emit();
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.cartService.updateCartItem(itemId, quantity).subscribe({
      next: () => {
        // Cart will be updated automatically via subscription
      },
      error: (error) => {
        console.error('Failed to update cart:', error);
        this.snackBar.open('Failed to update cart', 'Close', {
          duration: 3000
        });
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        this.snackBar.open('Item removed', 'Close', {
          duration: 2000
        });
      },
      error: (error) => {
        console.error('Failed to remove item:', error);
        this.snackBar.open('Failed to remove item', 'Close', {
          duration: 3000
        });
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.snackBar.open('Cart cleared', 'Close', {
          duration: 2000
        });
      },
      error: (error) => {
        console.error('Failed to clear cart:', error);
        this.snackBar.open('Failed to clear cart', 'Close', {
          duration: 3000
        });
      }
    });
  }

  checkout(): void {
    // TODO: Implement checkout
    this.snackBar.open('Checkout coming soon!', 'Close', {
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
