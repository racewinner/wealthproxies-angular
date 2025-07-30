import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    console.log('onSubmit() called!');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form value:', this.loginForm.value);
    console.log('Is loading:', this.isLoading());
    console.log('Form errors:', this.loginForm.errors);

    if (this.loginForm.valid && !this.isLoading()) {
      console.log('Form validation passed, proceeding with login...');
      this.isLoading.set(true);
      this.errorMessage.set('');

      const credentials: LoginRequest = this.loginForm.value;
      console.log('Sending login request with credentials:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful, redirecting to dashboard');
          // Add small delay to ensure auth state is fully updated
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        },
        error: (error) => {
          console.log('Login error:', error);
          // Handle different error response formats
          let errorMessage = 'Login failed. Please try again.';

          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.errorMessage.set(errorMessage);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  loginWithGoogle(): void {
    console.log('Google login clicked');
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        // Redirect happens in the service
      },
      error: (error) => {
        console.log('Google login error:', error);
        let errorMessage = 'Google login failed. Please try again.';

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }

        this.errorMessage.set(errorMessage);
      }
    });
  }

  loginWithDiscord(): void {
    console.log('Discord login clicked');
    this.authService.loginWithDiscord().subscribe({
      next: () => {
        // Redirect happens in the service
      },
      error: (error) => {
        console.log('Discord login error:', error);
        let errorMessage = 'Discord login failed. Please try again.';

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }

        this.errorMessage.set(errorMessage);
      }
    });
  }
}
