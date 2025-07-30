import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Plan, UserBandwidthInfo, MonthUsage } from '../../../core/models/api.model';

Chart.register(...registerables);

interface BandwidthCardData {
  title: string;
  value: number;
  lastMonthValue: number;
  unit: string;
  percentage: number;
}

@Component({
  selector: 'app-overview',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatExpansionModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  loading = signal(true);
  plans = signal<Plan[]>([]);
  bandwidthCards = signal<BandwidthCardData[]>([]);
  usageData = signal<MonthUsage[]>([]);
  expandedPlanId = signal<string | null>(null);

  // Expose Math to template
  Math = Math;

  // Chart configuration
  chartType: ChartType = 'line';
  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Bandwidth Usage (GB)',
      data: [],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + ' GB';
          }
        }
      }
    }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    console.log('Loading dashboard data...');

    Promise.all([
      this.dashboardService.getPlans().toPromise(),
      this.dashboardService.getBandwidthInfo().toPromise()
    ]).then(([plans, bandwidthInfo]) => {
      console.log('Dashboard data loaded:', { plans, bandwidthInfo });

      this.plans.set(plans || []);
      this.processBandwidthData(bandwidthInfo!);
      this.loading.set(false);
    }).catch(error => {
      console.log('Failed to load dashboard data:', error);
      this.loading.set(false);
    });
  }

  private processBandwidthData(bandwidthInfo: UserBandwidthInfo): void {
    const { accountInfo, monthlyRecords } = bandwidthInfo;

    // Handle case when accountInfo is undefined
    const safeAccountInfo = accountInfo || {
      trafficBalance: 0,
      trafficConsumed: 0,
      trafficBalanceString: '0 GB',
      trafficConsumedString: '0 GB'
    };

    // Get last month data (will be undefined if no data exists)
    const lastMonthKey = new Date(new Date().setDate(0)).toISOString().slice(0, 7);
    const lastMonthData = monthlyRecords?.[lastMonthKey];

    // Create bandwidth cards
    const cards: BandwidthCardData[] = [
      {
        title: 'Remaining Bandwidth',
        value: safeAccountInfo.trafficBalance,
        lastMonthValue: lastMonthData?.remainingBandwidth || 0,
        unit: 'GB',
        percentage: this.dashboardService.calculatePercentageChange(
          safeAccountInfo.trafficBalance,
          lastMonthData?.remainingBandwidth || 0
        )
      },
      {
        title: 'Bandwidth Consumed',
        value: safeAccountInfo.trafficConsumed,
        lastMonthValue: lastMonthData?.consumedBandwidth || 0,
        unit: 'GB',
        percentage: this.dashboardService.calculatePercentageChange(
          safeAccountInfo.trafficConsumed,
          lastMonthData?.consumedBandwidth || 0
        )
      },
      {
        title: 'Total Bandwidth',
        value: safeAccountInfo.trafficBalance + safeAccountInfo.trafficConsumed,
        lastMonthValue: (lastMonthData?.remainingBandwidth || 0) + (lastMonthData?.consumedBandwidth || 0),
        unit: 'GB',
        percentage: this.dashboardService.calculatePercentageChange(
          safeAccountInfo.trafficBalance + safeAccountInfo.trafficConsumed,
          (lastMonthData?.remainingBandwidth || 0) + (lastMonthData?.consumedBandwidth || 0)
        )
      }
    ];

    this.bandwidthCards.set(cards);

    // Process usage data for chart
    const usageData = this.dashboardService.getUsageData(monthlyRecords || {});
    this.usageData.set(usageData);

    // Update chart data
    this.chartData.labels = usageData.map(item => item.month);
    this.chartData.datasets[0].data = usageData.map(item => item.usage);
  }

  togglePlan(planId: string): void {
    const currentExpanded = this.expandedPlanId();
    this.expandedPlanId.set(currentExpanded === planId ? null : planId);
  }

  getPercentageColor(percentage: number): string {
    return percentage >= 0 ? '#4caf50' : '#f44336';
  }

  getPercentageIcon(percentage: number): string {
    return percentage >= 0 ? 'trending_up' : 'trending_down';
  }
}
