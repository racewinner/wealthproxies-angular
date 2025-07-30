import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-user-detail',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './admin-user-detail.component.html',
  styleUrl: './admin-user-detail.component.scss'
})
export class AdminUserDetailComponent implements OnInit {
  loading = signal(true);
  user = signal<User | null>(null);
  userId = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId.set(params['id']);
      this.loadUser(params['id']);
    });
  }

  private loadUser(id: string): void {
    console.log('Loading user:', id);
    this.loading.set(true);

    // Simulate API call with mock data
    setTimeout(() => {
      const mockUser: User = {
        id: id,
        email: 'john.doe@example.com',
        name: 'John Doe',
        username: 'johndoe',
        role: 'user',
        emailVerified: true,
        totalSpent: 299.99,
        lastPurchase: new Date('2024-01-15'),
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2024-01-15')
      };

      this.user.set(mockUser);
      this.loading.set(false);
    }, 1000);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  editUser(): void {
    console.log('Edit user:', this.userId());
    // TODO: Implement edit functionality
  }

  deleteUser(): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('Delete user:', this.userId());
      this.router.navigate(['/dashboard/admin/users']);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/admin/users']);
  }
}
