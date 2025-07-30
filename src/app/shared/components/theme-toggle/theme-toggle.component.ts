import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Theme, ThemeService } from '../../../core/services/theme.service';

/*
  <button 
      mat-icon-button 
      (click)="toggleTheme()"
      [matTooltip]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      class="theme-toggle-button">
      <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
*/
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="flex-box dark-light-act-card">
              <button mat-stroked-button (click)="toggleTheme('dark')" [class]="getThemeClassName('dark')">
                <mat-icon>dark_mode</mat-icon>
                dark
              </button>
              <div class="dark-light-divider"></div>
              <button mat-stroked-button (click)="toggleTheme('light')" [class]="getThemeClassName('light')">
                <mat-icon>light_mode</mat-icon>
                light
              </button>
            </div>
  `,
  styles: [`
    .flex-box { display: flex; align-items: center; }
    .theme-toggle-button {
      color: var(--sidebar-foreground);
      transition: all 0.2s ease;
      
      &:hover {
        background-color: var(--sidebar-accent);
        color: var(--sidebar-accent-foreground);
      }
    }
      .dark-light-action-btn {
  background-color: var(--card-sub-act-btn-pad2);
  color: var(--dark-light-act-title) !important;
  border: 3px solid var(--dark-light-act-card) !important;
  border-radius: 8px;
  height: 36px;
}
.dark-light-act-card {
  background-color: var(--dark-light-act-card);
  padding: 5px;
  border-radius: 8px;
}
.dark-light-divider {
  background-color: #9a9a9a;
  width: 1px;
  height: 20px;
  margin: 0px 10px;
}
.btn-dark.theme-active {
  border: 3px solid #9a9a9a !important;
}
.btn-light.theme-active {
  border: 3px solid #9a9a9a !important;

}
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  toggleTheme(doTheme: Theme): void {
    this.themeService.toggleTheme(doTheme);
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }

  getThemeClassName(themeName: string): string[] {
    let dynamicClass: string = 
        ((themeName === 'dark' &&  this.themeService.isDark()) || 
         (themeName !== 'dark' && !this.themeService.isDark()) )? 'theme-active' : '' 

    return ['dark-light-action-btn', 'btn-' + themeName, dynamicClass]; // combine static and dynamic classes
  }
}
