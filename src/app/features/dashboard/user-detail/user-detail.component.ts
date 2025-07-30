import { Component, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { BillingService } from '../../../core/services/billing.service';
import { UserProfile } from '../../../core/models/user.model';
import { Order } from '../../../core/models/api.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = signal(true);
  ordersLoading = signal(false);
  saving = signal(false);
  editing = signal(false);
  user = signal<UserProfile | null>(null);
  orders = signal<Order[]>([]);
  dataSource = new MatTableDataSource<Order>([]);
  editForm: FormGroup;

  displayedColumns: string[] = ['product', 'orderNumber', 'quantity', 'price', 'date', 'status', 'receipt'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private billingService: BillingService,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      role: ['user', [Validators.required]],
      emailVerified: [false],
      stripeCustomerId: [''],
      discordId: [''],
      discordUsername: ['']
    });
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    } else {
      this.router.navigate(['/dashboard/manage-users']);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private loadUser(userId: string): void {
    console.log('Loading user:', userId);
    this.loading.set(true);

    this.userService.getUserProfile(userId).subscribe({
      next: (user) => {
        console.log('User loaded:', user);
        this.user.set(user);
        this.populateForm(user);
        this.loading.set(false);
      },
      error: (error) => {
        console.log('Failed to load user:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load user', 'Close', {
          duration: 5000
        });
        this.router.navigate(['/dashboard/manage-users']);
      }
    });
  }

  private populateForm(user: UserProfile): void {
    this.editForm.patchValue({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      emailVerified: user.emailVerified,
      stripeCustomerId: user.stripeCustomerId,
      discordId: user.discordId,
      discordUsername: user.discordUsername
    });
  }

  onTabChange(index: number): void {
    if (index === 1 && this.orders().length === 0) {
      this.loadOrders();
    }
  }

  private loadOrders(): void {
    const user = this.user();
    if (!user) return;

    console.log('Loading orders for user:', user.id);
    this.ordersLoading.set(true);

    this.userService.getUserOrders(user.id).subscribe({
      next: (orderData) => {
        console.log('Orders loaded:', orderData.orders);
        this.orders.set(orderData.orders);
        this.dataSource.data = orderData.orders;
        this.ordersLoading.set(false);
      },
      error: (error) => {
        console.log('Failed to load orders:', error);
        this.ordersLoading.set(false);
        this.snackBar.open('Failed to load purchase history', 'Close', {
          duration: 5000
        });
      }
    });
  }

  toggleEdit(): void {
    this.editing.set(!this.editing());
    if (!this.editing()) {
      // Reset form when canceling edit
      const user = this.user();
      if (user) {
        this.populateForm(user);
      }
    } else {
      // Mark all fields as touched when entering edit mode to show validation
      this.editForm.markAllAsTouched();
    }
  }

  saveUser(): void {
    if (this.editForm.valid && this.user()) {
      this.saving.set(true);

      const userData = {
        ...this.editForm.value
      };

      this.userService.updateUser(this.user()!.id, userData).subscribe({
        next: (updatedUser) => {
          this.saving.set(false);
          this.editing.set(false);
          this.user.set(updatedUser);
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.saving.set(false);
          console.error('Failed to update user:', error);
          this.snackBar.open('Failed to update user', 'Close', { duration: 5000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/manage-users']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      case 'failed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }

  downloadReceipt(orderId: string): void {
    this.billingService.downloadReceipt(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.log('Failed to download receipt:', error);
        this.snackBar.open('Failed to download receipt', 'Close', {
          duration: 5000
        });
      }
    });
  }

  copyToClipboard(text: string): void {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.snackBar.open('Copied to clipboard', 'Close', {
          duration: 2000
        });
      }).catch(() => {
        this.snackBar.open('Failed to copy to clipboard', 'Close', {
          duration: 3000
        });
      });
    }
  }

  connectDiscord(): void {
    // TODO: Implement Discord OAuth connection
    this.snackBar.open('Discord connection feature coming soon', 'Close', {
      duration: 3000
    });
  }

  disconnectDiscord(): void {
    // TODO: Implement Discord disconnection
    this.snackBar.open('Discord disconnected successfully', 'Close', {
      duration: 3000
    });
  }
}
