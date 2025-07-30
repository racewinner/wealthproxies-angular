import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-oauth-callback',
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="callback-container">
      <div class="callback-content">
        <mat-spinner diameter="40"></mat-spinner>
        <h2>Completing {{ provider }} authentication...</h2>
        <p>Please wait while we complete your {{ provider }} login.</p>

        @if (errorMessage) {
          <div class="error-message">
            <p>{{ errorMessage }}</p>
            <button (click)="redirectToLogin()" class="retry-button">
              Try Again
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8fafc;
    }

    .callback-content {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 100%;
    }

    h2 {
      margin: 1rem 0 0.5rem 0;
      color: #1f2937;
      font-size: 1.5rem;
      font-weight: 600;
    }

    p {
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .error-message {
      margin-top: 1rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.375rem;
      color: #dc2626;
    }

    .retry-button {
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .retry-button:hover {
      background: #2563eb;
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  errorMessage: string = '';
  provider: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Determine the OAuth provider from the current URL
    const currentUrl = this.router.url;
    if (currentUrl.includes('/auth/callback/discord')) {
      this.provider = 'Discord';
    } else if (currentUrl.includes('/auth/callback/google')) {
      this.provider = 'Google';
    }

    console.log(`OAuth callback for ${this.provider} provider`);

    // Check for error parameters in the URL
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error_description'] || `${this.provider} authentication failed. Please try again.`;
        console.log(`${this.provider} OAuth error:`, params['error'], params['error_description']);
        return;
      }

      // Handle the OAuth callback with code and state
      this.handleOAuthCallback(params);
    });
  }

  private handleOAuthCallback(params: any): void {
    const code = params['code'];
    const state = params['state'];

    if (!code) {
      this.errorMessage = 'Missing authorization code. Please try again.';
      return;
    }

    console.log(`Processing ${this.provider} callback with code:`, code, 'and state:', state);

    if (this.provider === 'Discord') {
      this.authService.handleDiscordCallback(code, state).subscribe({
        next: (response) => {
          console.log('Discord authentication successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.log('Discord authentication failed:', error);
          this.errorMessage = error.error?.message || 'Discord authentication failed. Please try again.';
        }
      });
    } else if (this.provider === 'Google') {
      this.authService.handleGoogleCallback(code, state).subscribe({
        next: (response) => {
          console.log('Google authentication successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.log('Google authentication failed:', error);
          this.errorMessage = error.error?.message || 'Google authentication failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Unknown OAuth provider. Please try again.';
    }
  }

  private checkAuthenticationStatus(): void {
    // Give the backend a moment to process the OAuth callback
    setTimeout(() => {
      this.authService.getSession().subscribe({
        next: (response) => {
          if (response?.user) {
            console.log('OAuth authentication successful:', response.user);
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Authentication failed. Please try again.';
          }
        },
        error: (error) => {
          console.log('OAuth authentication failed:', error);
          this.errorMessage = 'Authentication failed. Please try again.';
        }
      });
    }, 1000);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
