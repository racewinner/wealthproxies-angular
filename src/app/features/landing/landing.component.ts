import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

import { Product } from '../../core/models/api.model';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ResidentialProxyCardComponent } from '../../shared/components/residential-proxy-card.component';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    ProductCardComponent,
    ResidentialProxyCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  readonly panelOpenState = signal(false);

  // Expose auth state to template
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Products loaded:', data);
        this.products.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.log('Failed to load products:', error);
        this.loading.set(false);
      }
    });
  }

  getProxyListProducts(): Product[] {
    return this.products().filter(product => product.productType === 'proxy_list');
  }

  onLoginClick(): void {
    console.log('Login button clicked on landing page!');
    console.log('Current URL:', window.location.href);
    console.log('Current auth state:', this.authService.isLoggedIn());
    console.log('Current user:', this.authService.getCurrentUser());
    console.log('About to navigate to /login');

    this.router.navigate(['/login']).then(success => {
      console.log('Navigation to /login result:', success);
      console.log('New URL after navigation:', window.location.href);
    }).catch(error => {
      console.error('Navigation to /login failed:', error);
    });
  }

  onDashboardClick(): void {
    console.log('Dashboard button clicked on landing page!');
    this.router.navigate(['/dashboard']);
  }

  getResidentialProducts(): Product[] {
    return this.products().filter(product => product.productType === 'residential');
  }
}
