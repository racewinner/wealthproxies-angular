import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-product-detail',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="product-detail-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/dashboard/admin/products" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-title">
          <mat-icon class="page-icon">inventory</mat-icon>
          <h1>Product Details</h1>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="coming-soon">
            <mat-icon class="coming-soon-icon">construction</mat-icon>
            <h3>Coming Soon</h3>
            <p>Product detail management is currently under development.</p>
            <button mat-raised-button color="primary" routerLink="/dashboard/admin/products">
              Back to Products
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .product-detail-container {
      padding: 0;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;

      .back-button {
        color: #667eea;
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 1rem;

        .page-icon {
          font-size: 2rem;
          color: #667eea;
        }

        h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem 1rem;
      text-align: center;

      .coming-soon-icon {
        font-size: 4rem;
        color: #ff9800;
      }

      h3 {
        margin: 0;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
        max-width: 400px;
      }
    }
  `]
})
export class AdminProductDetailComponent {}
