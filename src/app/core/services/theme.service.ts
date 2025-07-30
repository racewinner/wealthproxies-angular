import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  
  // Signal to track current theme
  private _theme = signal<Theme>('light');
  
  // Public readonly signal
  readonly theme = this._theme.asReadonly();

  constructor() {
    // Load theme from localStorage on initialization
    this.loadTheme();
    
    // Effect to apply theme changes to document
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(doTheme: Theme): void {
    this.setTheme(doTheme);
    // const newTheme: Theme = this._theme() === 'light' ? 'dark' : 'light';
    // this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.saveTheme(theme);
  }

  /**
   * Get current theme value
   */
  getCurrentTheme(): Theme {
    return this._theme();
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this._theme() === 'dark';
  }

  /**
   * Load theme from localStorage
   */
  private loadTheme(): void {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        this._theme.set(savedTheme);
      } else {
        // Default to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this._theme.set(prefersDark ? 'dark' : 'light');
      }
    }
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      
      // Remove existing theme classes
      htmlElement.classList.remove('light', 'dark');
      
      // Add new theme class
      htmlElement.classList.add(theme);
    }
  }
}
