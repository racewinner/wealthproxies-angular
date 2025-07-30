import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  imports: [
    CommonModule,
    RouterLink,
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
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  loading = signal(true);
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  searchQuery = signal('');

  displayedColumns: string[] = ['avatar', 'name', 'email', 'role', 'status', 'totalSpent', 'createdAt', 'actions'];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    console.log('Loading users...');
    this.loading.set(true);

    // Simulate API call with mock data
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          name: 'John Doe',
          username: 'johndoe',
          role: 'user',
          emailVerified: true,
          totalSpent: 299.99,
          lastPurchase: new Date('2024-01-15'),
          createdAt: new Date('2023-06-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          username: 'janesmith',
          role: 'user',
          emailVerified: true,
          totalSpent: 599.99,
          lastPurchase: new Date('2024-01-10'),
          createdAt: new Date('2023-08-20'),
          updatedAt: new Date('2024-01-10')
        },
        {
          id: '3',
          email: 'admin@wealthproxies.io',
          name: 'Admin User',
          username: 'admin',
          role: 'admin',
          emailVerified: true,
          totalSpent: 0,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: '4',
          email: 'bob.johnson@example.com',
          name: 'Bob Johnson',
          username: 'bobjohnson',
          role: 'user',
          emailVerified: false,
          totalSpent: 149.99,
          lastPurchase: new Date('2023-12-20'),
          createdAt: new Date('2023-11-10'),
          updatedAt: new Date('2023-12-20')
        }
      ];

      this.users.set(mockUsers);
      this.filteredUsers.set(mockUsers);
      this.loading.set(false);
    }, 1000);
  }

  onSearchChange(): void {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
    this.filteredUsers.set(filtered);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'user':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  }

  getStatusColor(emailVerified: boolean): string {
    return emailVerified ? '#4caf50' : '#ff9800';
  }

  getStatusText(emailVerified: boolean): string {
    return emailVerified ? 'Verified' : 'Unverified';
  }

  formatCurrency(amount?: number): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewUser(userId: string): void {
    console.log('View user:', userId);
    // Navigation will be handled by routerLink
  }

  editUser(userId: string): void {
    console.log('Edit user:', userId);
    this.snackBar.open('Edit user feature coming soon', 'Close', {
      duration: 3000
    });
  }

  toggleUserStatus(userId: string): void {
    console.log('Toggle user status:', userId);
    this.snackBar.open('User status updated', 'Close', {
      duration: 3000
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('Delete user:', userId);
      this.snackBar.open('User deleted successfully', 'Close', {
        duration: 3000
      });
      // Remove user from list
      const updatedUsers = this.users().filter(user => user.id !== userId);
      this.users.set(updatedUsers);
      this.onSearchChange(); // Refresh filtered list
    }
  }

  exportUsers(): void {
    console.log('Export users');
    this.snackBar.open('Users exported successfully', 'Close', {
      duration: 3000
    });
  }
}
