import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ngx-sliv-icon',
  styles: `
    svg {cursor: pointer}
  `,
  templateUrl: './ngx-sliv-icon.html',
})
export class NgxSlivIcon {
  iconName = input.required();
}
