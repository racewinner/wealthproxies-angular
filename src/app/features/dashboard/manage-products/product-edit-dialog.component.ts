import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../../core/models/api.model';
import { ProductService } from '../../../core/services/product.service';

export interface ProductEditDialogData {
  product: Product | null;
}

@Component({
  selector: 'app-product-edit-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ data.product ? 'edit' : 'add' }}</mat-icon>
          {{ data.product ? 'Edit Product' : 'Add Product' }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="editForm" class="product-form">
          <!-- Product Name -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Product Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter product name">
            <mat-error *ngIf="editForm.get('name')?.hasError('required')">
              Product name is required
            </mat-error>
            <mat-error *ngIf="editForm.get('name')?.hasError('minlength')">
              Product name must be at least 2 characters
            </mat-error>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Enter product description"></textarea>
            <mat-error *ngIf="editForm.get('description')?.hasError('required')">
              Description is required
            </mat-error>
          </mat-form-field>

          <!-- Product Type -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Product Type</mat-label>
            <mat-select formControlName="productType">
              <mat-option value="residential">Residential</mat-option>
              <mat-option value="isp">ISP</mat-option>
              <mat-option value="server">Server</mat-option>
              <mat-option value="proxy_list">Proxy List</mat-option>
            </mat-select>
            <mat-error *ngIf="editForm.get('productType')?.hasError('required')">
              Product type is required
            </mat-error>
          </mat-form-field>

          <!-- Provider -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Provider</mat-label>
            <input matInput formControlName="provider" placeholder="Enter provider name">
            <mat-error *ngIf="editForm.get('provider')?.hasError('required')">
              Provider is required
            </mat-error>
          </mat-form-field>

          <!-- Active Status -->
          <div class="toggle-field">
            <mat-slide-toggle formControlName="isActive" color="primary">
              Active Product
            </mat-slide-toggle>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button mat-dialog-close>Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="saveProduct()"
          [disabled]="editForm.invalid || isSaving()">
          @if (isSaving()) {
            <mat-spinner diameter="20"></mat-spinner>
            Saving...
          } @else {
            {{ data.product ? 'Save Changes' : 'Create Product' }}
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      width: 100%;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;
      }
    }

    .dialog-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .product-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      justify-content: flex-end;
      gap: 8px;

      button {
        min-width: 100px;
      }
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class ProductEditDialogComponent implements OnInit {
  editForm: FormGroup;
  isSaving = signal(false);

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProductEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductEditDialogData
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      productType: ['', [Validators.required]],
      provider: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.product) {
      this.editForm.patchValue({
        name: this.data.product.name,
        description: this.data.product.description,
        productType: this.data.product.productType,
        provider: this.data.product.provider,
        isActive: this.data.product.isActive
      });
    }
  }

  saveProduct(): void {
    if (this.editForm.valid) {
      this.isSaving.set(true);

      const productData = {
        ...this.editForm.value
      };

      if (this.data.product) {
        // Update existing product
        this.productService.updateProduct(this.data.product.id, productData).subscribe({
          next: (updatedProduct) => {
            this.isSaving.set(false);
            this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(updatedProduct);
          },
          error: (error) => {
            this.isSaving.set(false);
            console.error('Failed to update product:', error);
            this.snackBar.open('Failed to update product', 'Close', { duration: 5000 });
          }
        });
      } else {
        // Create new product
        this.productService.createProduct(productData).subscribe({
          next: (newProduct) => {
            this.isSaving.set(false);
            this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(newProduct);
          },
          error: (error) => {
            this.isSaving.set(false);
            console.error('Failed to create product:', error);
            this.snackBar.open('Failed to create product', 'Close', { duration: 5000 });
          }
        });
      }
    }
  }
}
