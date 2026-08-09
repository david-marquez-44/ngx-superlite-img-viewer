import { Component, input, output } from '@angular/core';

@Component({
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
})
export class NgxSlivIcon {
  iconName = input.required();
}
