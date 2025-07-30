import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Product } from '../../../core/models/api.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductCardComponent } from '../../../shared/components/product-card.component';
import { ResidentialProxyCardComponent } from '../../../shared/components/residential-proxy-card.component';
import { PurchaseSuccessDialogComponent } from '../../../shared/components/purchase-success-dialog.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDialogModule,
    ProductCardComponent,
    ResidentialProxyCardComponent
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.checkForSuccessRedirect();
  }

  private checkForSuccessRedirect(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Query params:', params);
      if (params['success'] === 'true') {
        console.log('Success parameter detected, showing dialog');
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });

        this.showSuccessDialog();
      }
    });
  }

  private showSuccessDialog(): void {
    console.log('Opening success dialog');
    const dialogRef = this.dialog.open(PurchaseSuccessDialogComponent, {
      width: '500px',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterOpened().subscribe(() => {
      console.log('Dialog opened successfully');
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        // Only show active products for shopping
        this.products.set(products.filter(product => product.isActive));
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load products', 'Close', {
          duration: 5000
        });
      }
    });
  }

  // Cart functionality removed - using direct purchase flow

  getResidentialProducts(): Product[] {
    return this.products().filter(product => product.productType === 'residential');
  }

  getISPProducts(): Product[] {
    return this.products().filter(product => product.productType === 'isp');
  }

  getServerProducts(): Product[] {
    return this.products().filter(product => product.productType === 'server');
  }

  getProxyListProducts(): Product[] {
    return this.products().filter(product => product.productType === 'proxy_list');
  }

  onProductPurchased(): void {
    console.log('Product purchased - redirecting to checkout...');
    this.snackBar.open('Redirecting to checkout...', 'Close', {
      duration: 3000
    });
  }
}
