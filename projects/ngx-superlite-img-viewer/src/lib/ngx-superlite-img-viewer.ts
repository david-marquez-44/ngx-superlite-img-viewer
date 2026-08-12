import { Component, computed, effect, ElementRef, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { NgxSlivIcon } from './components/ngx-sliv-icon/ngx-sliv-icon';
import { isPlatformBrowser } from '@angular/common';
import { VIEWER_TEXTS } from './i18n/i18n';

@Component({
  host: {
    'tabindex': '-1',
    '(keydown.arrowleft)': 'previous()',
    '(keydown.arrowright)': 'next()',
    '(keydown.escape)': 'onClosed()',
  },
  selector: 'ngx-superlite-img-viewer',
  imports: [NgxSlivIcon],
  templateUrl: './ngx-superlite-img-viewer.html',
  styleUrl: './ngx-superlite-img-viewer.scss',
})
export class NgxSuperliteImgViewer {

  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

  images = input.required<string[]>();
  imageIndex = input<number>(0);
  imageslength = computed<number>(() => this.images().length)
  showDownloadButton = input<boolean>(true);
  currentIndexIntern = signal(0);
  syncCurrentIndexIntern = effect(() => this.currentIndexIntern.set(this.imageIndex()));
  currentImage = computed(() => this.images()[this.currentIndexIntern()]);
  lang = input<'es' | 'en'>('en');
  currentTexts = computed(() => VIEWER_TEXTS[this.lang()])
  imageAlt = computed(() => `${this.currentTexts().image} ${this.currentIndexIntern() + 1} ${this.currentTexts().of} ${this.imageslength()}`);
  hasMultiple = computed(() => this.imageslength() > 1);
  imagePosition = computed(() => `${this.currentIndexIntern() + 1}/${this.imageslength()}`);
  private overflowUser = '';

  closed = output<void>();

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.elementRef.nativeElement.focus();
      this.overflowUser = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.overflowUser;
    }
  }

  next() {
    if (this.currentIndexIntern() < (this.imageslength() - 1)) this.currentIndexIntern.set(this.currentIndexIntern() + 1);
    else this.currentIndexIntern.set(0)
  }

  previous() {
    if (this.currentIndexIntern() > 0) this.currentIndexIntern.set(this.currentIndexIntern() - 1)
    else this.currentIndexIntern.set(this.imageslength() - 1)
  }

  async download() {
    if (isPlatformBrowser(this.platformId)) {
      const currentImage = this.currentImage();
      if (window.location.origin == new URL(currentImage, window.location.origin).origin) {
        const currentImageSplit = this.currentImage().split('/');
        const currentImageName = currentImageSplit[currentImageSplit.length - 1]
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('href', currentImage);
        a.setAttribute('download', currentImageName);
        a.click();
        document.body.removeChild(a);
      } else {
        try {
          const response: Response = await fetch(this.currentImage());
          if (!response.ok) throw new Error(`Response status: ${response.status}`);
          const headerContentType = response.headers.get('Content-Type');
          let imageExtension = 'jpg';
          if (headerContentType) imageExtension = headerContentType.split('/')[1];
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('href', blobUrl);
          a.setAttribute('download', `image.${imageExtension}`);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl)
        } catch (error) {
          console.error(`Error downloading the image ${error}`)
        }
      }
    }
  }

  onClosed() {
    this.closed.emit();
  }
}
