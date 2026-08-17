import { Component, computed, effect, ElementRef, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { NgxSlivIcon } from './components/ngx-sliv-icon/ngx-sliv-icon';
import { NgxSlivLoader } from './components/ngx-sliv-loader/ngx-sliv-loader';
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
  imports: [NgxSlivIcon, NgxSlivLoader],
  templateUrl: './ngx-superlite-img-viewer.html',
  styleUrl: './ngx-superlite-img-viewer.scss',
})
export class NgxSuperliteImgViewer {

  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

  public images = input.required<string[]>();
  public imageIndex = input<number>(0);
  public showDownloadButton = input<boolean>(true);
  public lang = input<'es' | 'en'>('en');

  public closed = output<void>();

  private currentIndexIntern = signal(0);
  private syncCurrentIndexIntern = effect(() => this.currentIndexIntern.set(this.imageIndex()));
  public disabledDownloadButton = signal(false);
  private setTimeoutIDImageIsLoading?: number;
  public imageIsLoading = signal(false);
  private resetImageIsLoading = effect(() => {
    this.currentIndexIntern();
    this.clearTimeoutIDImageIsLoading();
    this.setTimeoutIDImageIsLoading = setTimeout(() => this.imageIsLoading.set(true), 120);
  });
  private overflowUser = '';

  private imageslength = computed(() => this.images().length)
  public currentImage = computed(() => this.images()[this.currentIndexIntern()]);
  public currentTexts = computed(() => VIEWER_TEXTS[this.lang()])
  public imageAlt = computed(() => `${this.currentTexts().image} ${this.currentIndexIntern() + 1} ${this.currentTexts().of} ${this.imageslength()}`);
  public hasMultiple = computed(() => this.imageslength() > 1);
  public imagePosition = computed(() => `${this.currentIndexIntern() + 1}/${this.imageslength()}`);



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
    this.clearTimeoutIDImageIsLoading();
  }

  next() {
    this.currentIndexIntern.set((this.currentIndexIntern() + 1) % this.imageslength());
  }

  previous() {
    this.currentIndexIntern.set(((this.currentIndexIntern() - 1) + this.imageslength()) % this.imageslength());
  }

  async download() {
    this.disabledDownloadButton.set(true);
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
    setTimeout(() => this.disabledDownloadButton.set(false), 1000);
  }

  onClosed() {
    this.closed.emit();
  }

  imageIsRendered() {
    this.clearTimeoutIDImageIsLoading();
    this.imageIsLoading.set(false);
  }

  clearTimeoutIDImageIsLoading() {
    if (this.setTimeoutIDImageIsLoading) clearTimeout(this.setTimeoutIDImageIsLoading);
  }

}
