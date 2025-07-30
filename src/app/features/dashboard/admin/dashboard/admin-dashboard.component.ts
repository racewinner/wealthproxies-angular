import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

Chart.register(...registerables);

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalProducts: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'order_placed' | 'subscription_created' | 'product_purchased';
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    BaseChartDirective
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalProducts: 0
  });
  recentActivity = signal<RecentActivity[]>([]);

  // Chart configuration
  chartType: ChartType = 'line';
  revenueChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Revenue ($)',
      data: [],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };
  
  userChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'New Users',
      data: [],
      borderColor: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  displayedColumns: string[] = ['type', 'description', 'user', 'timestamp'];

  ngOnInit(): void {
    this.loadAdminData();
  }

  private loadAdminData(): void {
    console.log('Loading admin dashboard data...');
    this.loading.set(true);

    // Simulate API calls with mock data
    setTimeout(() => {
      this.stats.set({
        totalUsers: 1247,
        activeUsers: 892,
        totalOrders: 3456,
        totalRevenue: 125430,
        activeSubscriptions: 567,
        totalProducts: 12
      });

      this.recentActivity.set([
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          userId: 'user123',
          userName: 'John Doe'
        },
        {
          id: '2',
          type: 'order_placed',
          description: 'Order placed for Premium Proxies',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          userId: 'user456',
          userName: 'Jane Smith'
        },
        {
          id: '3',
          type: 'subscription_created',
          description: 'Monthly subscription activated',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          userId: 'user789',
          userName: 'Bob Johnson'
        }
      ]);

      // Mock chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      this.revenueChartData.labels = last7Days;
      this.revenueChartData.datasets[0].data = [1200, 1800, 1500, 2200, 1900, 2400, 2100];

      this.userChartData.labels = last7Days;
      this.userChartData.datasets[0].data = [12, 18, 15, 22, 19, 24, 21];

      this.loading.set(false);
    }, 1000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_registration':
        return 'person_add';
      case 'order_placed':
        return 'shopping_cart';
      case 'subscription_created':
        return 'subscriptions';
      case 'product_purchased':
        return 'shopping_bag';
      default:
        return 'info';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'user_registration':
        return '#4caf50';
      case 'order_placed':
        return '#2196f3';
      case 'subscription_created':
        return '#ff9800';
      case 'product_purchased':
        return '#9c27b0';
      default:
        return '#666';
    }
  }
}
