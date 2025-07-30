import { Component, OnInit, AfterViewInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { UserEditDialogComponent } from './user-edit-dialog.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-manage-users',
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
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="users-container">
      <!-- Header -->
      <div class="page-header">
        <h1>Manage Users</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="search-field">
            <input matInput
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyFilter()"
                  placeholder="Search Users...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="addUser()">
            <mat-icon>add</mat-icon>
            Add User
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading users...</p>
        </div>
      } @else {
        <!-- Users Table -->
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" class="users-table">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">
                <div class="user-info">
                  <div class="user-details">
                    <div class="user-name-row">
                      <strong>{{ user.name }}</strong>
                      @if (user.discordId) {
                        <div class="discord-indicator"
                             [title]="'Discord: ' + (user.discordUsername || 'Connected')">
                          <mat-icon class="discord-icon">chat</mat-icon>
                        </div>
                      }
                    </div>
                    @if (user.discordUsername) {
                      <div class="discord-username">{{ user.discordUsername }}</div>
                    }
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <!-- Username Column -->
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Username</th>
              <td mat-cell *matCellDef="let user">{{ user.username }}</td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                <span class="role-badge" [style.color]="getRoleColor(user.role)">
                  {{ user.role | titlecase }}
                </span>
              </td>
            </ng-container>

            <!-- Email Verified Column -->
            <ng-container matColumnDef="emailVerified">
              <th mat-header-cell *matHeaderCellDef>Verified</th>
              <td mat-cell *matCellDef="let user">
                <mat-icon [style.color]="user.emailVerified ? '#4caf50' : '#f44336'">
                  {{ user.emailVerified ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </td>
            </ng-container>

            <!-- Total Spent Column -->
            <ng-container matColumnDef="totalSpent">
              <th mat-header-cell *matHeaderCellDef>Total Spent</th>
              <td mat-cell *matCellDef="let user">{{ formatCurrency(user.totalSpent) }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button color="accent" [title]="'View ' + user.name" (click)="viewUser(user)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" [title]="'Delete ' + user.name" (click)="deleteUser(user)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- No results overlay -->
          @if (dataSource.data.length === 0) {
            <div class="no-results-overlay">
              <div class="no-results-content">
                No users found.
              </div>
            </div>
          }

          <!-- Pagination -->
          <div class="pagination-container">
            <mat-paginator
              [pageSizeOptions]="[5, 10, 25, 100]"
              [pageSize]="10"
              [length]="dataSource.data.length"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-container {
      padding: 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;

      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;

        .search-field {
          width: 300px;

          .mat-mdc-form-field-subscript-wrapper {
            display: none;
          }
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;

      p {
        color: #666;
        font-size: 1.1rem;
      }
    }

    .table-container {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      position: relative;

      .users-table {
        width: 100%;
        min-width: 800px;

        th {
          font-weight: 600;
          color: #333;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          padding: 1rem;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        tr {
          background-color: white;
        }

        .mat-mdc-row:last-child .mat-mdc-cell {
          border-bottom: none;
        }
      }

      .no-results-overlay {
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        z-index: 1;

        .no-results-content {
          text-align: center;
          color: #666;
          font-size: 1rem;
          padding: 3rem 1rem;
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      border-top: 1px solid #e0e0e0;
      min-height: 60px;

      mat-paginator {
        background: transparent;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-details {
        flex: 1;

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .discord-indicator {
            display: flex;
            align-items: center;
            padding: 2px 6px;
            background-color: #5865f2;
            border-radius: 12px;
            color: white;

            .discord-icon {
              font-size: 14px;
              width: 14px;
              height: 14px;
            }
          }
        }

        .discord-username {
          font-size: 0.8rem;
          color: #666;
        }
      }
    }

    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;

        h1 {
          font-size: 1.25rem;
        }

        .header-actions {
          .search-field {
            width: 100%;
          }
        }
      }

      .table-container {
        .users-table {
          min-width: 600px;

          th, td {
            padding: 0.75rem 0.5rem;
            font-size: 0.85rem;
          }
        }
      }
    }
  `]
})
export class ManageUsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = signal(true);
  searchQuery = signal('');
  dataSource = new MatTableDataSource<UserProfile>([]);
  displayedColumns: string[] = ['name', 'email', 'username', 'role', 'emailVerified', 'totalSpent', 'actions'];

  constructor(
    private userService: UserService,
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
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private loadUsers(): void {
    console.log('Loading users...');
    this.loading.set(true);

    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        this.dataSource.data = users;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.loading.set(false);
        this.snackBar.open('Failed to load users', 'Close', {
          duration: 5000
        });
      }
    });
  }

  applyFilter(): void {
    const filterValue = this.searchQuery().trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'user':
        return '#4caf50';
      default:
        return '#666';
    }
  }

  viewUser(user: UserProfile): void {
    this.router.navigate(['/dashboard/user', user.id]);
  }

  deleteUser(user: UserProfile): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted:', user.id);
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  addUser(): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '600px',
      data: { user: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: (newUser) => {
            console.log('User created:', newUser);
            this.snackBar.open('User created successfully', 'Close', {
              duration: 3000
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Failed to create user:', error);
            this.snackBar.open('Failed to create user', 'Close', {
              duration: 5000
            });
          }
        });
      }
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }
}
