import { TestBed } from '@angular/core/testing';
import { isPlatformBrowser } from '@angular/common';
import { NgxSuperliteImgViewer } from './ngx-superlite-img-viewer';
import { VIEWER_TEXTS } from './i18n/i18n';

const testClock = (globalThis as any).jasmine?.clock ?? {
  install: () => (globalThis as any).vi?.useFakeTimers?.(),
  uninstall: () => (globalThis as any).vi?.useRealTimers?.(),
  tick: (ms: number) => (globalThis as any).vi?.advanceTimersByTime?.(ms),
};

describe('NgxSuperliteImgViewer', () => {
  let fixture: any;
  let component: NgxSuperliteImgViewer;

  const buildImages = () => [
    `${window.location.origin}/images/one.jpg`,
    `${window.location.origin}/images/two.jpg`,
    `${window.location.origin}/images/three.jpg`,
  ];

  const createComponent = (overrides: Partial<{
    images: string[];
    imageIndex: number;
    showDownloadButton: boolean;
    lang: 'es' | 'en';
  }> = {}) => {
    fixture = TestBed.createComponent(NgxSuperliteImgViewer);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('images', overrides.images ?? buildImages());
    fixture.componentRef.setInput('imageIndex', overrides.imageIndex ?? 0);
    fixture.componentRef.setInput('showDownloadButton', overrides.showDownloadButton ?? true);
    fixture.componentRef.setInput('lang', overrides.lang ?? 'en');
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSuperliteImgViewer],
    }).compileComponents();
  });

  // Verifica la creación del componente y los valores computados básicos.
  describe('Creación y estado computado', () => {
    it('Debe crear el componente y sincronizar currentIndexIntern con imageIndex', () => {
      createComponent({ imageIndex: 2 });

      expect(component).toBeTruthy();
      expect(component['currentIndexIntern']()).toBe(2);
      expect(component.currentImage()).toBe(buildImages()[2]);
    });

    it('Debe devolver el total de imágenes, detectar múltiples y la imagen actual', () => {
      createComponent();

      expect(component['imageslength']()).toBe(3);
      expect(component.hasMultiple()).toBeTruthy();
      expect(component.currentImage()).toBe(buildImages()[0]);
    });

    it('Debe devolver false para hasMultiple con una sola imagen', () => {
      createComponent({ images: [`${window.location.origin}/images/solo.jpg`] });

      expect(component['imageslength']()).toBe(1);
      expect(component.hasMultiple()).toBeFalsy();
      expect(component.currentImage()).toBe(`${window.location.origin}/images/solo.jpg`);
    });

    it('Debe producir los textos y alt text correctos para los idiomas es y en', () => {
      createComponent({ lang: 'en', imageIndex: 1 });
      expect(component.currentTexts()).toEqual(VIEWER_TEXTS.en);
      expect(component.imageAlt()).toBe('Image 2 of 3');
      expect(component.imagePosition()).toBe('2/3');

      fixture.componentRef.setInput('lang', 'es');
      fixture.detectChanges();
      expect(component.currentTexts()).toEqual(VIEWER_TEXTS.es);
      expect(component.imageAlt()).toBe('Imagen 2 de 3');
      expect(component.imagePosition()).toBe('2/3');
    });
  });

  // Verifica el avance y retroceso circular del índice en los bordes.
  describe('Navegación', () => {
    it('Debe avanzar circularmente desde el último índice al primero', () => {
      createComponent({ imageIndex: 2 });

      component.next();
      expect(component['currentIndexIntern']()).toBe(0);
      expect(component.currentImage()).toBe(buildImages()[0]);
    });

    it('Debe retroceder circularmente desde el primer índice al último', () => {
      createComponent({ imageIndex: 0 });

      component.previous();
      expect(component['currentIndexIntern']()).toBe(2);
      expect(component.currentImage()).toBe(buildImages()[2]);
    });

    it('Debe avanzar y retroceder correctamente en el caso intermedio', () => {
      createComponent({ imageIndex: 1 });

      component.next();
      expect(component['currentIndexIntern']()).toBe(2);

      component.previous();
      expect(component['currentIndexIntern']()).toBe(1);
    });
  });

  // Verifica el evento de salida y los atajos del teclado del host.
  describe('Salida y accesibilidad de teclado', () => {
    it('Debe emitir closed al invocar onClosed', () => {
      createComponent();
      const closedSpy = vi.fn();
      component.closed.subscribe(closedSpy);

      component.onClosed();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('Debe responder a las flechas del teclado y al Escape en el host', () => {
      createComponent({ imageIndex: 0 });
      const host = fixture.nativeElement as HTMLElement;
      const closedSpy = vi.fn();
      component.closed.subscribe(closedSpy);

      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(component['currentIndexIntern']()).toBe(1);

      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(component['currentIndexIntern']()).toBe(0);

      host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });
  });

  // Verifica el flujo de descarga con origen local y cross-origin.
  describe('Descarga', () => {
    it('Debe descargar una imagen del mismo origen mediante un enlace con download correcto', () => {
      createComponent();
      const sameOriginUrl = `${window.location.origin}/images/local.png`;
      fixture.componentRef.setInput('images', [sameOriginUrl, buildImages()[1]]);
      fixture.detectChanges();

      const appendSpy = vi.spyOn(document.body, 'appendChild');
      const removeSpy = vi.spyOn(document.body, 'removeChild');

      component.download();

      const createdLink = appendSpy.mock.calls.at(-1)?.[0] as HTMLAnchorElement;
      expect(createdLink.tagName).toBe('A');
      expect(createdLink.getAttribute('href')).toBe(sameOriginUrl);
      expect(createdLink.getAttribute('download')).toBe('local.png');
      expect(removeSpy).toHaveBeenCalledWith(createdLink);
    });

    it('Debe descargar una imagen cross-origin usando fetch, blob y una URL local', async () => {
      createComponent({ images: ['https://cdn.example.com/demo.png'] });

      const blob = new Blob(['image'], { type: 'image/png' });
      const response = {
        ok: true,
        headers: { get: (name: string) => (name === 'Content-Type' ? 'image/png' : null) },
        blob: vi.fn().mockResolvedValue(blob),
      } as any;
      vi.spyOn(window, 'fetch').mockResolvedValue(response as Response);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL');

      const appendSpy = vi.spyOn(document.body, 'appendChild');
      const removeSpy = vi.spyOn(document.body, 'removeChild');

      await component.download();

      expect(window.fetch).toHaveBeenCalledWith('https://cdn.example.com/demo.png');
      const createdLink = appendSpy.mock.calls.at(-1)?.[0] as HTMLAnchorElement;
      expect(createdLink.getAttribute('href')).toBe('blob:mock-url');
      expect(createdLink.getAttribute('download')).toBe('image.png');
      expect(removeSpy).toHaveBeenCalledWith(createdLink);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('Debe usar el fallback jpg cuando el Content-Type del cross-origin es null', async () => {
      createComponent({ images: ['https://cdn.example.com/without-type.png'] });

      const blob = new Blob(['image'], { type: 'image/png' });
      const response = {
        ok: true,
        headers: { get: () => null },
        blob: vi.fn().mockResolvedValue(blob),
      } as any;
      vi.spyOn(window, 'fetch').mockResolvedValue(response as Response);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fallback');
      vi.spyOn(URL, 'revokeObjectURL');
      const appendSpy = vi.spyOn(document.body, 'appendChild');
      vi.spyOn(document.body, 'removeChild');

      await component.download();

      const createdLink = appendSpy.mock.calls.at(-1)?.[0] as HTMLAnchorElement;
      expect(createdLink.getAttribute('download')).toBe('image.jpg');
    });

    it('Debe registrar el error en consola y no lanzar excepción cuando fetch falla', async () => {
      createComponent({ images: ['https://cdn.example.com/fail.png'] });
      vi.spyOn(window, 'fetch').mockRejectedValue(new Error('network down'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      await component.download();

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('Debe registrar el error en consola y no lanzar excepción cuando response.ok es false', async () => {
      createComponent({ images: ['https://cdn.example.com/bad-status.png'] });
      vi.spyOn(window, 'fetch').mockResolvedValue({ ok: false, status: 500 } as Response);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      await component.download();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  // Verifica el comportamiento del loader con debounce y el evento de carga.
  describe('Loader con debounce', () => {
    beforeEach(() => {
      testClock.install();
    });

    afterEach(() => {
      testClock.uninstall();
    });

    it('No debe activar el loader si la imagen se renderiza antes de los 120ms', () => {
      createComponent();

      testClock.tick(100);
      component.imageIsRendered();
      expect(component.imageIsLoading()).toBeFalsy();

      testClock.tick(100);
      expect(component.imageIsLoading()).toBeFalsy();
    });

    it('Debe activar el loader después de 120ms si la imagen no se ha cargado', () => {
      createComponent();

      testClock.tick(120);
      expect(component.imageIsLoading()).toBeTruthy();
    });
  });

  // Verifica el estado del body y el foco inicial del componente.
  describe('Ciclo de vida', () => {
    it('Debe validar que el entorno es PlatformBrowser antes de ejecutar la lógica del DOM', () => {
      createComponent();
      const platformId = (component as any).platformId;
      const browserEnv = isPlatformBrowser(platformId);

      expect(browserEnv).toBeTruthy();
      if (browserEnv) {
        const originalOverflow = document.body.style.overflow;
        const focusSpy = vi.spyOn(fixture.nativeElement, 'focus');

        component.ngOnInit();

        expect(document.body.style.overflow).toBe('hidden');
        expect(focusSpy).toHaveBeenCalled();
        document.body.style.overflow = originalOverflow;
      }
    });

    it('Debe bloquear el scroll y enfocar el host en ngOnInit', () => {
      createComponent();

      const originalOverflow = document.body.style.overflow;
      const focusSpy = vi.spyOn(fixture.nativeElement, 'focus');

      component.ngOnInit();

      expect(document.body.style.overflow).toBe('hidden');
      expect(focusSpy).toHaveBeenCalled();
      document.body.style.overflow = originalOverflow;
    });

    it('Debe restaurar el overflow original y limpiar el timeout pendiente en ngOnDestroy', () => {
      const originalOverflow = 'visible';
      document.body.style.overflow = originalOverflow;

      createComponent();

      const clearSpy = vi.spyOn(component, 'clearTimeoutIDImageIsLoading');

      component.ngOnDestroy();

      expect(document.body.style.overflow).toBe(originalOverflow);
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
