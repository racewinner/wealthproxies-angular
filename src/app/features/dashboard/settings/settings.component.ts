import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  loading = signal(false);
  currentUser = signal<User | null>(null);
  personalInfoForm: FormGroup;
  isUpdatingProfile = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.personalInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser.set(user);
      this.personalInfoForm.patchValue({
        name: user.name,
        username: user.username,
        email: user.email,
      });
    }
  }

  onUpdateProfile(): void {
    if (this.personalInfoForm.valid && !this.isUpdatingProfile()) {
      this.isUpdatingProfile.set(true);

      // TODO: Implement profile update API call
      // For now, just simulate the update
      setTimeout(() => {
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000
        });
        this.isUpdatingProfile.set(false);
      }, 1000);
    }
  }

  connectDiscord(): void {
    // TODO: Implement Discord OAuth connection
    this.snackBar.open('Discord connection feature coming soon', 'Close', {
      duration: 3000
    });
  }

  disconnectDiscord(): void {
    // TODO: Implement Discord disconnection
    this.snackBar.open('Discord disconnected successfully', 'Close', {
      duration: 3000
    });
  }

  openSupportCenter(): void {
    window.open('https://support.wealthproxies.io', '_blank');
  }

  openDiscordServer(): void {
    window.open('https://discord.gg/wealthproxies', '_blank');
  }

  sendSupportEmail(): void {
    const user = this.currentUser();
    const subject = encodeURIComponent('Support Request');
    const body = encodeURIComponent(`Hello,\n\nI need assistance with my account.\n\nUser ID: ${user?.id}\nEmail: ${user?.email}\n\nPlease describe your issue below:\n\n`);
    window.open(`mailto:support@wealthproxies.io?subject=${subject}&body=${body}`);
  }

  hasFormErrors(): boolean {
    return this.personalInfoForm.invalid && this.personalInfoForm.touched;
  }

  getFieldError(fieldName: string): string {
    const field = this.personalInfoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}
