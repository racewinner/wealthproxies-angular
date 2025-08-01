import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component'
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  route?: string;
  icon?: string;
  type?: 'item' | 'separator';
}

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatFormField,
    MatLabel,
    FormsModule,
    MatInputModule,
    ThemeToggleComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  isHandset = signal(false);
  sidenavOpened = signal(true);
  searchQuery = signal('');
  breadCrumb = signal('');
  breadCrumbCapt = computed(() => {
    return this.breadCrumb().toString().charAt(0).toUpperCase() + this.breadCrumb().toString().slice(1);
  });

  navItems: NavItem[] = [
    { label: 'Overview',        route: '/dashboard/overview', icon: 'dashboard', type: 'item' },
    { label: 'Shop',            route: '/dashboard/shop', icon: 'store', type: 'item' },
    { label: 'Order History',   route: '/dashboard/history', icon: 'history', type: 'item' },
    { label: 'Billing',         route: '/dashboard/billing', icon: 'payment', type: 'item' },
    { label: 'Settings',        route: '/dashboard/settings', icon: 'settings', type: 'item' },
    { label: '', type: 'separator' },
    { label: 'Manage Products', route: '/dashboard/manage-products', icon: 'shopping_cart', type: 'item' },
    { label: 'Manage Users',    route: '/dashboard/manage-users', icon: 'people', type: 'item' }
  ];

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.breakpointObserver.observe(Breakpoints.Handset)
      .subscribe(result => {
        this.isHandset.set(result.matches);
        this.sidenavOpened.set(!result.matches);
      });

    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const segments = url.split('/').filter(segment => segment);
        const lastPart = segments[segments.length - 1];
        this.breadCrumb.set(lastPart);
      });
  }

  onSearchChange(): void {
    const query = this.searchQuery().toLowerCase();
  }

  toggleSidenav(): void {
    this.sidenavOpened.set(!this.sidenavOpened());
  }

  logout(): void {
    console.log('Logout clicked');
    this.authService.logout().subscribe();
  }

  navigateToProfile(): void {
    this.router.navigate(['/dashboard/settings']);
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user?.name) return 'U';

    const names = user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}
