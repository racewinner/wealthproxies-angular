import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GeometricIconColor = 'blue' | 'green' | 'gray';
export type GeometricPolygon = 'triangle' | 'circle' | 'square' | 'star';

interface GeometricIconVariant {
  border: string;
  firstColor: string;
  secondColor: string;
}

const geometricIconVariants: Record<GeometricIconColor, GeometricIconVariant> = {
  blue: {
    border: '#A5BEFC',
    firstColor: '#E1EAFF',
    secondColor: '#CDDBFF',
  },
  green: {
    border: '#C8ECFF',
    firstColor: '#EAF8FF',
    secondColor: '#D6EBF5',
  },
  gray: {
    border: '#ADC4D2',
    firstColor: '#DAE8F1',
    secondColor: '#C1D6E3',
  },
};

@Component({
  selector: 'app-geometric-icon',
  imports: [CommonModule],
  template: `
    <div [ngSwitch]="polygon" [class]="className">
      <svg *ngSwitchCase="'triangle'" width="43" height="37" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.9019 1.5C20.0566 -0.499996 22.9434 -0.5 24.0981 1.5L41.8516 32.25C43.0063 34.25 41.5629 36.75 39.2535 36.75H3.74648C1.43708 36.75 -0.00629711 34.25 1.1484 32.25L18.9019 1.5Z" [attr.fill]="'url(#paint0_radial_triangle_' + color + ')'"/>
        <path d="M19.3349 1.75C20.2972 0.0833359 22.7028 0.0833344 23.6651 1.75L41.4186 32.5C42.3808 34.1667 41.178 36.25 39.2535 36.25H3.74648C1.82198 36.25 0.619166 34.1667 1.58142 32.5L19.3349 1.75Z" [attr.stroke]="variant.border" stroke-opacity="0.3"/>
        <defs>
          <radialGradient [attr.id]="'paint0_radial_triangle_' + color" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(21.5 18.625) rotate(90) scale(18.625)">
            <stop [attr.stop-color]="variant.firstColor"/>
            <stop offset="1" [attr.stop-color]="variant.secondColor"/>
          </radialGradient>
        </defs>
      </svg>

      <svg *ngSwitchCase="'circle'" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="18.5" [attr.fill]="'url(#paint0_radial_circle_' + color + ')'" [attr.stroke]="variant.border"/>
        <defs>
          <radialGradient [attr.id]="'paint0_radial_circle_' + color" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(19 19) rotate(90) scale(19)">
            <stop [attr.stop-color]="variant.firstColor"/>
            <stop offset="1" [attr.stop-color]="variant.secondColor"/>
          </radialGradient>
        </defs>
      </svg>

      <svg *ngSwitchCase="'square'" width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="34" height="34" rx="4.5" [attr.fill]="'url(#paint0_radial_square_' + color + ')'" [attr.stroke]="variant.border"/>
        <defs>
          <radialGradient [attr.id]="'paint0_radial_square_' + color" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(17.5 17.5) rotate(90) scale(17.5)">
            <stop [attr.stop-color]="variant.firstColor"/>
            <stop offset="1" [attr.stop-color]="variant.secondColor"/>
          </radialGradient>
        </defs>
      </svg>

      <svg *ngSwitchCase="'star'" width="37" height="33" viewBox="0 0 37 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.5 0L22.1924 11.4377H34.2658L24.5367 18.5623L28.2291 30L18.5 22.8754L8.77094 30L12.4633 18.5623L2.73417 11.4377H14.8076L18.5 0Z" [attr.fill]="'url(#paint0_radial_star_' + color + ')'"/>
        <defs>
          <radialGradient [attr.id]="'paint0_radial_star_' + color" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(18.5 19.5) rotate(90) scale(23.5)">
            <stop [attr.stop-color]="variant.firstColor"/>
            <stop offset="1" [attr.stop-color]="variant.secondColor"/>
          </radialGradient>
        </defs>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class GeometricIconComponent {
  @Input() polygon: GeometricPolygon = 'triangle';
  @Input() color: GeometricIconColor = 'blue';
  @Input() className: string = '';

  get variant(): GeometricIconVariant {
    return geometricIconVariants[this.color];
  }
}
