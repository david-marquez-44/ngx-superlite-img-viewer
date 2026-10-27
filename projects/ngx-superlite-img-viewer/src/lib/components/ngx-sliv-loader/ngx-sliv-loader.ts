import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'ngx-sliv-loader',
  imports: [],
  template: `
  <svg viewBox="25 25 50 50" class="container">
    <circle cx="50" cy="50" r="20" class="loader"></circle>
  </svg>
  `,
  styleUrl: './ngx-sliv-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxSlivLoader { }
