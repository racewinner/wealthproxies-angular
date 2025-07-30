import { Component, OnInit, AfterViewInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../../core/services/billing.service';
import { Order, OrdersResponse } from '../../../core/models/api.model';

@Component({
  selector: 'app-history',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = signal(true);
  orders = signal<Order[]>([]);
  searchQuery = signal('');
  dataSource = new MatTableDataSource<Order>([]);
  totalOrders = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);

  displayedColumns: string[] = ['product', 'orderNumber', 'quantity', 'price', 'startDate', 'status', 'receipt'];

  constructor(
    private billingService: BillingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    // Set up pagination event handler
    this.paginator.page.subscribe(() => {
      this.currentPage.set(this.paginator.pageIndex);
      this.pageSize.set(this.paginator.pageSize);
      this.loadOrders();
    });

    // Set up custom filter function for client-side filtering
    this.dataSource.filterPredicate = (order: Order, filter: string) => {
      const searchStr = filter.toLowerCase();
      return order.product.name.toLowerCase().includes(searchStr) ||
             order.id.toLowerCase().includes(searchStr) ||
             order.status.toLowerCase().includes(searchStr);
    };
  }

  private loadOrders(): void {
    console.log('Loading order history...', {
      page: this.currentPage() + 1, // Backend expects 1-based page numbers
      size: this.pageSize()
    });
    this.loading.set(true);

    this.billingService.getOrders(this.currentPage() + 1, this.pageSize()).subscribe({
      next: (response: OrdersResponse) => {
        console.log('Orders loaded:', response);
        this.orders.set(response.orders);
        this.dataSource.data = response.orders;
        this.totalOrders.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.log('Failed to load orders:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load order history', 'Close', {
          duration: 5000
        });
      }
    });
  }

  onSearchChange(): void {
    // Reset to first page when searching
    this.currentPage.set(0);
    this.paginator.pageIndex = 0;

    // For now, we'll use client-side filtering
    // In the future, you could add search parameter to the API
    const query = this.searchQuery().toLowerCase();
    this.dataSource.filter = query;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      case 'failed':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#9e9e9e';
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

  downloadReceipt(order: Order): void {
    if (order.receiptUrl) {
      // Open receipt URL in new window
      window.open(order.receiptUrl, '_blank');
    } else {
      this.snackBar.open('Receipt not available for this order', 'Close', {
        duration: 3000
      });
    }
  }

  exportOrders(format: 'csv' | 'pdf' = 'csv'): void {
    this.billingService.exportOrders(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open(`Orders exported as ${format.toUpperCase()}`, 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.log('Failed to export orders:', error);
        this.snackBar.open('Failed to export orders', 'Close', {
          duration: 5000
        });
      }
    });
  }

  openSupportCenter(): void {
    window.open('https://support.wealthproxies.io', '_blank');
  }
}
