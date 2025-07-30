import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  isLoading = signal(true);
  isSuccess = signal(false);
  errorMessage = signal('');
  token = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the token from query parameters
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (!token) {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid verification link. No token provided.');
        return;
      }

      this.token.set(token);
      this.verifyEmail(token);
    });
  }

  private verifyEmail(token: string): void {
    console.log('Verifying email with token:', token);
    
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        console.log('Email verification successful:', response);
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (error) => {
        console.log('Email verification failed:', error);
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Email verification failed. The link may be invalid or expired.'
        );
      }
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
