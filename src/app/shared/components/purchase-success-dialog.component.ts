import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-purchase-success-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="success-dialog">
      <div class="dialog-header">
        <div class="success-icon">
          <mat-icon>check_circle</mat-icon>
        </div>
        <h2 mat-dialog-title>Purchase Successful!</h2>
      </div>
      
      <div mat-dialog-content class="dialog-content">
        <p>Your purchase has been completed successfully.</p>
        <p>You should receive a confirmation email shortly with your order details.</p>
      </div>
      
      <div mat-dialog-actions class="dialog-actions">
        <button mat-raised-button color="primary" (click)="close()">
          Continue Shopping
        </button>
      </div>
    </div>
  `,
  styles: [`
    .success-dialog {
      text-align: center;
      padding: 24px;
      min-width: 400px;
    }

    .dialog-header {
      margin-bottom: 24px;
    }

    .success-icon {
      margin-bottom: 16px;
      
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #4caf50;
      }
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a202c;
    }

    .dialog-content {
      margin-bottom: 24px;
      
      p {
        margin: 8px 0;
        color: #4a5568;
        line-height: 1.5;
      }
    }

    .dialog-actions {
      justify-content: center;
      padding: 0;
      margin: 0;
    }
  `]
})
export class PurchaseSuccessDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PurchaseSuccessDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
