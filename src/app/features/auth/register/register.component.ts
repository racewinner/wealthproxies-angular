import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  registrationSuccess = signal(false);
  userEmail = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { confirmPassword, ...userData } = this.registerForm.value;
      const registerData: RegisterRequest = userData;

      this.authService.register(registerData).subscribe({
        next: () => {
          console.log('Registration successful, showing verification message');
          this.userEmail.set(registerData.email);
          this.registrationSuccess.set(true);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.log('Registration error:', error);
          // Handle different error response formats
          let errorMessage = 'Registration failed. Please try again.';

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
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (fieldName === 'email' && field?.hasError('email')) {
      return 'Please enter a valid email';
    }

    if (fieldName === 'password' && field?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }

    if (fieldName === 'name' && field?.hasError('minlength')) {
      return 'Name must be at least 2 characters';
    }

    if (fieldName === 'username' && field?.hasError('minlength')) {
      return 'Username must be at least 3 characters';
    }

    if (fieldName === 'confirmPassword' && field?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }

  registerWithGoogle(): void {
    console.log('Google registration clicked');
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        // Redirect happens in the service
      },
      error: (error) => {
        console.log('Google registration error:', error);
        let errorMessage = 'Google registration failed. Please try again.';

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

  registerWithDiscord(): void {
    console.log('Discord registration clicked');
    this.authService.loginWithDiscord().subscribe({
      next: () => {
        // Redirect happens in the service
      },
      error: (error) => {
        console.log('Discord registration error:', error);
        let errorMessage = 'Discord registration failed. Please try again.';

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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
