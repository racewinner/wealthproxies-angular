import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./tabbed-dashboard/tabbed-dashboard.component').then(m => m.TabbedDashboardComponent)
      },

      {
        path: 'shop',
        loadComponent: () => import('./shop/shop.component').then(m => m.ShopComponent)
      },
      {
        path: 'manage-products',
        loadComponent: () => import('./manage-products/manage-products.component').then(m => m.ManageProductsComponent)
      },
      {
        path: 'manage-users',
        loadComponent: () => import('./manage-users/manage-users.component').then(m => m.ManageUsersComponent)
      },
      {
        path: 'user/:id',
        loadComponent: () => import('./user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
      },

      {
        path: 'admin/settings',
        loadComponent: () => import('./admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      },

    ]
  }
];
