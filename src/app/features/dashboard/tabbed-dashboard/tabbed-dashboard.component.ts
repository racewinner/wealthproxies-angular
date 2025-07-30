import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../core/services/auth.service';
import { OverviewComponent } from '../overview/overview.component';
import { AdminDashboardComponent } from '../admin/dashboard/admin-dashboard.component';

@Component({
  selector: 'app-tabbed-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    OverviewComponent,
    AdminDashboardComponent
  ],
  templateUrl: './tabbed-dashboard.component.html',
  styleUrl: './tabbed-dashboard.component.scss'
})
export class TabbedDashboardComponent {
  selectedTabIndex = signal(0);
  
  isAdmin = computed(() => this.authService.isAdmin());

  constructor(private authService: AuthService) {}
}
