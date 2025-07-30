import { Component, Inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserProfile } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { BillingService } from '../../../core/services/billing.service';
import { Order } from '../../../core/models/api.model';

export interface UserEditDialogData {
  user: UserProfile | null;
}

@Component({
  selector: 'app-user-edit-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ data.user ? 'edit' : 'add' }}</mat-icon>
          {{ data.user ? 'Edit User' : 'Add User' }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <mat-tab-group class="user-tabs" (selectedTabChange)="onTabChange($event.index)">
          <!-- General Tab -->
          <mat-tab label="General">
            <div class="tab-content">
              <form [formGroup]="editForm" class="user-form">
                <!-- User Name -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="name" placeholder="Enter full name">
                  <mat-error *ngIf="editForm.get('name')?.hasError('required')">
                    Full name is required
                  </mat-error>
                  <mat-error *ngIf="editForm.get('name')?.hasError('minlength')">
                    Name must be at least 2 characters
                  </mat-error>
                </mat-form-field>

                <!-- Email -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email" placeholder="Enter email address">
                  <mat-error *ngIf="editForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="editForm.get('email')?.hasError('email')">
                    Please enter a valid email address
                  </mat-error>
                </mat-form-field>

                <!-- Username -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username" placeholder="Enter username">
                  <mat-error *ngIf="editForm.get('username')?.hasError('required')">
                    Username is required
                  </mat-error>
                  <mat-error *ngIf="editForm.get('username')?.hasError('minlength')">
                    Username must be at least 3 characters
                  </mat-error>
                </mat-form-field>

                <!-- Role -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Role</mat-label>
                  <mat-select formControlName="role">
                    <mat-option value="user">User</mat-option>
                    <mat-option value="admin">Admin</mat-option>
                  </mat-select>
                  <mat-error *ngIf="editForm.get('role')?.hasError('required')">
                    Role is required
                  </mat-error>
                </mat-form-field>

                <!-- Stripe Customer ID -->
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Stripe Customer ID</mat-label>
                  <input matInput formControlName="stripeCustomerId" placeholder="Enter Stripe customer ID">
                  <mat-icon matSuffix matTooltip="Copy to clipboard" (click)="copyToClipboard(editForm.get('stripeCustomerId')?.value)">content_copy</mat-icon>
                </mat-form-field>

                <!-- Discord Information -->
                <div class="discord-section">
                  <h3>Discord Information</h3>
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Discord ID</mat-label>
                    <input matInput formControlName="discordId" placeholder="Enter Discord ID">
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Discord Username</mat-label>
                    <input matInput formControlName="discordUsername" placeholder="Enter Discord username">
                  </mat-form-field>
                  @if (editForm.get('discordId')?.value) {
                    <div class="discord-status">
                      <mat-icon class="connected-icon">check_circle</mat-icon>
                      <span>Discord Connected</span>
                    </div>
                  }
                </div>

                <!-- Email Verified -->
                <div class="toggle-field">
                  <mat-slide-toggle formControlName="emailVerified" color="primary">
                    Email Verified
                  </mat-slide-toggle>
                </div>
              </form>
            </div>
          </mat-tab>

          <!-- Purchase History Tab -->
          <mat-tab label="Purchase History">
            <div class="tab-content">
              @if (ordersLoading()) {
                <div class="loading-container">
                  <mat-spinner></mat-spinner>
                  <p>Loading purchase history...</p>
                </div>
              } @else {
                <div class="table-container">
                  <table mat-table [dataSource]="dataSource" class="orders-table">
                    <!-- Product Column -->
                    <ng-container matColumnDef="product">
                      <th mat-header-cell *matHeaderCellDef>Product</th>
                      <td mat-cell *matCellDef="let order">
                        <div class="product-info">
                          <div class="product-name">{{ order.product?.name || 'N/A' }}</div>
                          <div class="product-variant">{{ order.variant?.name || 'N/A' }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Order Number Column -->
                    <ng-container matColumnDef="orderNumber">
                      <th mat-header-cell *matHeaderCellDef>Order</th>
                      <td mat-cell *matCellDef="let order">
                        <span class="order-id">{{ order.id }}</span>
                      </td>
                    </ng-container>

                    <!-- Price Column -->
                    <ng-container matColumnDef="price">
                      <th mat-header-cell *matHeaderCellDef>Price</th>
                      <td mat-cell *matCellDef="let order">
                        <span class="amount">{{ formatCurrency(order.amount) }}</span>
                      </td>
                    </ng-container>

                    <!-- Status Column -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let order">
                        <mat-chip class="status-chip" [style.background-color]="getStatusColor(order.status)">
                          {{ order.status | titlecase }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Date Column -->
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let order">{{ formatDate(order.createdAt) }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>

                  @if (dataSource.data.length === 0) {
                    <div class="no-results">
                      <mat-icon>shopping_cart</mat-icon>
                      <p>No purchase history found</p>
                    </div>
                  }

                  <mat-paginator
                    [pageSizeOptions]="[5, 10, 25]"
                    [pageSize]="5"
                    [length]="dataSource.data.length"
                    showFirstLastButtons>
                  </mat-paginator>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button
          mat-raised-button
          color="primary"
          (click)="saveUser()"
          [disabled]="editForm.invalid || isSaving()">
          @if (isSaving()) {
            <mat-spinner diameter="20"></mat-spinner>
            Saving...
          } @else {
            {{ data.user ? 'Save Changes' : 'Create User' }}
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      width: 100%;
      max-width: 800px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;
      }
    }

    .dialog-content {
      padding: 0;
      max-height: 80vh;
      overflow: hidden;
    }

    .user-tabs {
      ::ng-deep .mat-mdc-tab-body-wrapper {
        overflow-y: auto;
        max-height: 75vh;
      }
    }

    .tab-content {
      padding: 24px;
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      width: calc(50% - 8px);
      display: inline-block;
      margin-right: 16px;

      &:last-child {
        margin-right: 0;
      }
    }

    .discord-section {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;

      h3 {
        margin: 0 0 16px 0;
        font-size: 1.1rem;
        color: #5865f2;
      }

      .discord-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        color: #4caf50;
        font-weight: 500;

        .connected-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .toggle-field {
      width: 100%;
      padding: 16px 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;

      p {
        margin: 0;
        color: #718096;
      }
    }

    .table-container {
      .orders-table {
        width: 100%;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        .product-info {
          .product-name {
            font-weight: 500;
            color: #1a202c;
            margin-bottom: 2px;
          }

          .product-variant {
            font-size: 12px;
            color: #64748b;
          }
        }

        .order-id {
          font-family: monospace;
          font-size: 12px;
          color: #64748b;
        }

        .amount {
          font-weight: 600;
          color: #1a202c;
        }

        .status-chip {
          color: white;
          font-size: 12px;
          font-weight: 500;
        }
      }

      .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        text-align: center;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #cbd5e0;
          margin-bottom: 16px;
        }

        p {
          margin: 0;
          color: #718096;
        }
      }
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      justify-content: flex-end;
      gap: 8px;

      button {
        min-width: 100px;
      }
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class UserEditDialogComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  editForm: FormGroup;
  isSaving = signal(false);
  ordersLoading = signal(false);
  orders = signal<Order[]>([]);
  dataSource = new MatTableDataSource<Order>([]);
  displayedColumns: string[] = ['product', 'orderNumber', 'price', 'status', 'date'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private billingService: BillingService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserEditDialogData
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
    if (this.data.user) {
      this.editForm.patchValue({
        name: this.data.user.name,
        email: this.data.user.email,
        username: this.data.user.username,
        role: this.data.user.role,
        emailVerified: this.data.user.emailVerified,
        stripeCustomerId: this.data.user.stripeCustomerId,
        discordId: this.data.user.discordId,
        discordUsername: this.data.user.discordUsername
      });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onTabChange(index: number): void {
    if (index === 1 && this.data.user && this.orders().length === 0) {
      this.loadOrders();
    }
  }

  private loadOrders(): void {
    if (!this.data.user) return;

    console.log('Loading orders for user:', this.data.user.id);
    this.ordersLoading.set(true);

    this.userService.getUserOrders(this.data.user.id).subscribe({
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

  saveUser(): void {
    if (this.editForm.valid) {
      this.isSaving.set(true);

      const userData = {
        ...this.editForm.value
      };

      if (this.data.user) {
        // Update existing user
        this.userService.updateUser(this.data.user.id, userData).subscribe({
          next: (updatedUser) => {
            this.isSaving.set(false);
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(updatedUser);
          },
          error: (error) => {
            this.isSaving.set(false);
            console.error('Failed to update user:', error);
            this.snackBar.open('Failed to update user', 'Close', { duration: 5000 });
          }
        });
      } else {
        // Create new user
        this.userService.createUser(userData).subscribe({
          next: (newUser) => {
            this.isSaving.set(false);
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(newUser);
          },
          error: (error) => {
            this.isSaving.set(false);
            console.error('Failed to create user:', error);
            this.snackBar.open('Failed to create user', 'Close', { duration: 5000 });
          }
        });
      }
    }
  }
}
