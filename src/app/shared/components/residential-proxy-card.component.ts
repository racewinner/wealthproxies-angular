import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Product, ProductVariant, CreateOrderRequest } from '../../core/models/api.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-residential-proxy-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="border-box border-hover-box roxy-box">
      <div class="box-title-sz20 text-center mb-0d5r">{{ title }}</div>
      <div class="flex-box v-baseline">
        <div class="box-price-txt-sz30 text-center">\${{ getDisplayPrice() }}</div>
        <div class="box-price-unit-sz1d125r">/ per month</div>
      </div>
      <div class="box-extra-desc-sz16 text-center mt-0d5r mb-1d5r">{{ description }}</div>

      @for (feature of whatsIncluded; track feature) {
        <div class="flex-box-left box-content-txt-sz16 line-h-2">
          <mat-icon class="box-content-txt-chk-ico">check</mat-icon>{{ feature }}
        </div>
      }

      <div class="flex-box mt-1d5r mb-1d5r">
        <button mat-icon-button (click)="decreaseQuantity()" [disabled]="buyAmount() <= getMinimumQuantity()" class="cart-rm-btn">
          <mat-icon>remove</mat-icon>
        </button>
        <span class="quantity">{{ buyAmount() }}</span>
        <button mat-icon-button (click)="increaseQuantity()">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      @if (variants && variants.length > 1) {
        <div class="variants-section mb-1d5r">
          @for (variant of variants; track variant.id) {
            <mat-chip
              [class.selected]="currentVariantId() === variant.id"
              (click)="setCurrentVariant(variant.id)">
              {{ variant.name }}
            </mat-chip>
          }
        </div>
      }

      <button mat-stroked-button class="box-btn full-width mt-1d5r white-btn"
              (click)="handlePurchase()"
              [disabled]="purchasing()">
        @if (purchasing()) {
          <span>Processing...</span>
        } @else {
          <span>{{ enablePurchase ? 'Purchase now' : 'Get Started' }}</span>
        }
      </button>

      @if (purchaseError()) {
        <p class="error-message">{{ purchaseError() }}</p>
      }
    </div>
  `,
  styleUrl: './residential-proxy-card.component.scss'
})
export class ResidentialProxyCardComponent implements OnInit {
  @Input() title!: string;
  @Input() description!: string;
  @Input() whatsIncluded!: string[];
  @Input() variants!: ProductVariant[];
  @Input() enablePurchase: boolean = true;
  @Input() productId!: string;
  @Input() product!: Product;

  @Output() productPurchased = new EventEmitter<void>();

  buyAmount = signal(1);
  currentVariantId = signal<string>('');
  purchaseError = signal<string>('');
  purchasing = signal(false);

  constructor(
    private router: Router,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.variants && this.variants.length > 0) {
      this.currentVariantId.set(this.variants[0].id);
    }

    // Set initial quantity to product's minimum quantity
    if (this.product && this.product.minimumQuantity > 0) {
      this.buyAmount.set(this.product.minimumQuantity);
    }
  }

  getCurrentVariant(): ProductVariant | undefined {
    return this.variants.find(v => v.id === this.currentVariantId());
  }

  getDisplayPrice(): string {
    const variant = this.getCurrentVariant();
    if (!variant) return '0.00';
    return ((variant.price * this.buyAmount()) / 100).toFixed(2);
  }

  getMinimumQuantity(): number {
    return this.product?.minimumQuantity || 1;
  }

  increaseQuantity(): void {
    this.buyAmount.set(this.buyAmount() + 1);
  }

  decreaseQuantity(): void {
    const minQuantity = this.product?.minimumQuantity || 1;
    if (this.buyAmount() > minQuantity) {
      this.buyAmount.set(this.buyAmount() - 1);
    }
  }

  setCurrentVariant(variantId: string): void {
    this.currentVariantId.set(variantId);
  }

  handlePurchase(): void {
    if (!this.enablePurchase) {
      this.router.navigate(['/dashboard/shop']);
      return;
    }

    const minQuantity = this.getMinimumQuantity();
    if (this.buyAmount() < minQuantity) {
      this.purchaseError.set(`You must buy at least ${minQuantity} proxy(s).`);
      return;
    }

    if (!this.currentVariantId()) {
      this.purchaseError.set('Please select a variant.');
      return;
    }

    if (!this.productId) {
      this.purchaseError.set('Product information is missing.');
      return;
    }

    this.purchaseError.set('');
    this.purchasing.set(true);

    // Create order directly
    const orderRequest: CreateOrderRequest = {
      items: [{
        variant_id: this.currentVariantId(),
        quantity: this.buyAmount()
      }]
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        console.log('Order created:', response);
        this.purchasing.set(false);
        this.productPurchased.emit();

        // Redirect to Stripe checkout
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Failed to create order:', error);
        this.purchasing.set(false);
        this.purchaseError.set('Failed to create order. Please try again.');
        this.snackBar.open('Failed to create order', 'Close', {
          duration: 5000
        });
      }
    });
  }
}
