import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'ngx-sliv-icon',
  styles: `
    svg {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  `,
  templateUrl: './ngx-sliv-icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxSlivIcon {
  iconName = input.required<'previous' | 'next' | 'download' | 'close' | 'error'>();
}
