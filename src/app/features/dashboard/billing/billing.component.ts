import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BillingService } from '../../../core/services/billing.service';
import { Subscription, PaymentMethod } from '../../../core/models/api.model';

@Component({
  selector: 'app-billing',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {
  loading = signal(true);
  subscriptions = signal<Subscription[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);
  totalSpent = signal(0);
  activeSubscriptions = signal(0);

  constructor(
    private billingService: BillingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBillingData();
  }

  private loadBillingData(): void {
    console.log('Loading billing data...');
    this.loading.set(true);

    this.billingService.getBillingInfo().subscribe({
      next: (data) => {
        console.log('Billing data loaded:', data);
        this.subscriptions.set(data.subscriptions);
        this.paymentMethods.set(data.paymentMethods);
        this.totalSpent.set(data.totalSpent);
        this.activeSubscriptions.set(data.activeSubscriptions);
        this.loading.set(false);
      },
      error: (error) => {
        console.log('Failed to load billing data:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load billing information', 'Close', {
          duration: 5000
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      case 'expired':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  }

  getPaymentMethodIcon(type: string): string {
    switch (type) {
      case 'card':
        return 'credit_card';
      case 'paypal':
        return 'account_balance_wallet';
      case 'bank_account':
        return 'account_balance';
      default:
        return 'payment';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  cancelSubscription(subscriptionId: string): void {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      this.billingService.cancelSubscription(subscriptionId).subscribe({
        next: () => {
          this.snackBar.open('Subscription cancelled successfully', 'Close', {
            duration: 3000
          });
          this.loadBillingData();
        },
        error: (error) => {
          console.log('Failed to cancel subscription:', error);
          this.snackBar.open('Failed to cancel subscription', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  renewSubscription(subscriptionId: string): void {
    this.billingService.renewSubscription(subscriptionId).subscribe({
      next: () => {
        this.snackBar.open('Subscription renewed successfully', 'Close', {
          duration: 3000
        });
        this.loadBillingData();
      },
      error: (error) => {
        console.log('Failed to renew subscription:', error);
        this.snackBar.open('Failed to renew subscription', 'Close', {
          duration: 5000
        });
      }
    });
  }

  removePaymentMethod(paymentMethodId: string): void {
    if (confirm('Are you sure you want to remove this payment method?')) {
      this.billingService.removePaymentMethod(paymentMethodId).subscribe({
        next: () => {
          this.snackBar.open('Payment method removed successfully', 'Close', {
            duration: 3000
          });
          this.loadBillingData();
        },
        error: (error) => {
          console.log('Failed to remove payment method:', error);
          this.snackBar.open('Failed to remove payment method', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  setDefaultPaymentMethod(paymentMethodId: string): void {
    this.billingService.setDefaultPaymentMethod(paymentMethodId).subscribe({
      next: () => {
        this.snackBar.open('Default payment method updated', 'Close', {
          duration: 3000
        });
        this.loadBillingData();
      },
      error: (error) => {
        console.log('Failed to set default payment method:', error);
        this.snackBar.open('Failed to update default payment method', 'Close', {
          duration: 5000
        });
      }
    });
  }

  addPaymentMethod(): void {
    // TODO: Open dialog to add payment method
    this.snackBar.open('Add payment method feature coming soon', 'Close', {
      duration: 3000
    });
  }
}
