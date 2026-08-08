import { Component, computed, effect, input, output, signal } from '@angular/core';
import { NgxSlivIcon } from './components/ngx-sliv-icon/ngx-sliv-icon';

@Component({
  selector: 'ngx-superlite-img-viewer',
  imports: [NgxSlivIcon],
  templateUrl: './ngx-superlite-img-viewer.html',
  styleUrl: './ngx-superlite-img-viewer.scss',
})
export class NgxSuperliteImgViewer {
  images = input.required<string[]>();
  imageIndex = input<number>(0);
  imageslength = computed<number>(() => this.images().length)
  showDownloadButton = input<boolean>(true);
  currentIndexIntern = signal(0);
  syncCurrentIndexIntern = effect(() => this.currentIndexIntern.set(this.imageIndex()));
  currentImage = computed(() => this.images()[this.currentIndexIntern()]);
  imageAlt = computed(() => `Imagen ${this.currentIndexIntern()} de ${this.imageslength()}`);
  hasMultiple = computed(() => this.imageslength() > 1);

  closed = output<void>();

  next() {
    if (this.currentIndexIntern() < (this.imageslength() - 1)) this.currentIndexIntern.set(this.currentIndexIntern() + 1);
    else this.currentIndexIntern.set(0)
  }

  previous() {
    if (this.currentIndexIntern() > 0) this.currentIndexIntern.set(this.currentIndexIntern() - 1)
    else this.currentIndexIntern.set(this.imageslength() - 1)
  }

  onClosed() {
    this.closed.emit();
  }
}
