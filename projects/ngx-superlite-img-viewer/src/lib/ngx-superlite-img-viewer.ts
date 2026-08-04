import { Component, computed, input, output, signal } from '@angular/core';
import { NgxSlivIcon } from './components/ngx-sliv-icon/ngx-sliv-icon';

@Component({
  selector: 'ngx-superlite-img-viewer',
  imports: [NgxSlivIcon],
  templateUrl: './ngx-superlite-img-viewer.html',
  styleUrl: './ngx-superlite-img-viewer.scss',
})
export class NgxSuperliteImgViewer {
  images = input.required<string[]>();
  imageslength = computed<number>(() => this.images().length)

  showDownloadButton = input<boolean>(true);
  currentIndex = signal<number>(0);

  closed = output<void>();

  next() {
    if (this.currentIndex() < (this.imageslength() - 1)) this.currentIndex.set(this.currentIndex() + 1);
    else this.currentIndex.set(0)
  }

  previous() {
    if (this.currentIndex() > 0) this.currentIndex.set(this.currentIndex() - 1)
    else this.currentIndex.set(this.imageslength() - 1)
  }

}
