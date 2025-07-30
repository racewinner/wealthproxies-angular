import { Component, OnInit, AfterViewInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/api.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductEditDialogComponent } from './product-edit-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-products',
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatCardModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.scss'
})
export class ManageProductsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = signal(true);
  searchQuery = signal('');
  dataSource = new MatTableDataSource<Product>([]);
  displayedColumns: string[] = ['name', 'productType', 'description', 'variants', 'status', 'actions'];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
    // Check if user is admin, if not redirect to overview
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard/overview']);
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private loadProducts(): void {
    console.log('Loading products...');
    this.loading.set(true);

    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.dataSource.data = products;
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

  applyFilter(): void {
    const filterValue = this.searchQuery().trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getProductTypeLabel(type: string): string {
    switch (type) {
      case 'residential': return 'Residential';
      case 'isp': return 'ISP';
      case 'server': return 'Server';
      case 'proxy_list': return 'Proxy List';
      default: return type;
    }
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? '#4caf50' : '#f44336';
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      width: '600px',
      data: { product: { ...product } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.updateProduct(product.id, result).subscribe({
          next: (updatedProduct) => {
            console.log('Product updated:', updatedProduct);
            this.snackBar.open('Product updated successfully', 'Close', {
              duration: 3000
            });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Failed to update product:', error);
            this.snackBar.open('Failed to update product', 'Close', {
              duration: 5000
            });
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          console.log('Product deleted:', product.id);
          this.snackBar.open('Product deleted successfully', 'Close', {
            duration: 3000
          });
          this.loadProducts();
        },
        error: (error) => {
          console.error('Failed to delete product:', error);
          this.snackBar.open('Failed to delete product', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  addProduct(): void {
    const dialogRef = this.dialog.open(ProductEditDialogComponent, {
      width: '600px',
      data: { product: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.createProduct(result).subscribe({
          next: (newProduct) => {
            console.log('Product created:', newProduct);
            this.snackBar.open('Product created successfully', 'Close', {
              duration: 3000
            });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Failed to create product:', error);
            this.snackBar.open('Failed to create product', 'Close', {
              duration: 5000
            });
          }
        });
      }
    });
  }
}
