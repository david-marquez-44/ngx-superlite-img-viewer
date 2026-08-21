# ngx-superlite-img-viewer

![npm version](https://img.shields.io/npm/v/ngx-superlite-img-viewer)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ngx-superlite-img-viewer)
![Angular](https://img.shields.io/badge/Angular-21+-red)
![License](https://img.shields.io/npm/l/ngx-superlite-img-viewer)

## Sobre ngx-superlite-img-viewer

Librería ultraligera para Angular diseñada para visualizar galerías de imágenes en un visor rápido e intuitivo. Incluye navegación fluida, descarga directa y control de cierre.

## Demo

[Abrir Demo](https://david-marquez-44.github.io/ngx-superlite-img-viewer/)

## Instalación

```bash
npm install ngx-superlite-img-viewer
```

## Descripción

`ngx-superlite-img-viewer` es un componente standalone pensado para abrir una imagen o una colección de imágenes en una vista modal estilo lightbox. Fue diseñado para ser simple, visualmente limpio y fácil de integrar en cualquier app Angular.

- **Visor modal centrado**: presentación limpia enfocada en el contenido visual.
- **Navegación fluida** entre imágenes mediante controles en pantalla o atajos de teclado (`←`, `→`, `Esc`).
- **Indicador de carga**: mientras cada imagen se renderiza, se muestra un loader; el estado se gestiona con un pequeño retraso interno para evitar parpadeos en cargas instantáneas (caché o red rápida).
- **Manejo de errores de carga**: si una imagen falla en cargar, se muestra un ícono y un mensaje de error en su lugar, sin romper la navegación del resto de la galería.
- **Soporte de idiomas**: `es` y `en`, incluyendo los mensajes de error y el contador de imágenes.
- **Botón de descarga** opcional, compatible con imágenes del mismo dominio y con recursos externos (cross-origin), con estado deshabilitado mientras la descarga está en proceso.
- **Estados de interacción** (hover) en los controles para mejor feedback visual.
- **Bloqueo automático del scroll** del `body` mientras el visor está abierto.
- **Accesible**: `aria-label`, `aria-live`, `aria-hidden` y foco de teclado gestionados internamente.

## Superlite de verdad

- Package size: **< 4.0 kB** (minified + gzipped).
- Cero dependencias externas.

## Uso básico

```ts
import { Component } from '@angular/core';
import { NgxSuperliteImgViewer } from 'ngx-superlite-img-viewer';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [NgxSuperliteImgViewer],
  template: `
    <button type="button" (click)="isOpen = true">Abrir visor</button>

    @if (isOpen) {
      <ngx-superlite-img-viewer
        [images]="images"
        [imageIndex]="0"
        [showDownloadButton]="true"
        [lang]="'es'"
        (closed)="isOpen = false"
      />
    }
  `,
})
export class DemoComponent {
  isOpen = false;

  images = [
    'https://picsum.photos/id/1/200/300',
    'https://picsum.photos/id/2/200/300',
    'https://picsum.photos/id/3/200/300',
    'https://picsum.photos/id/4/200/300',
  ];
}
```

## API

### Inputs

| Nombre | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `images` | `string[]` | requerido | Lista de URLs de las imágenes a mostrar. |
| `imageIndex` | `number` | `0` | Índice de la imagen activa al abrir el visor. |
| `showDownloadButton` | `boolean` | `true` | Muestra u oculta el botón de descarga. |
| `lang` | `'es' \| 'en'` | `'en'` | Idioma de los textos del visor. |

### Output

| Nombre | Tipo | Descripción |
| --- | --- | --- |
| `closed` | `void` | Se emite cuando el usuario cierra el visor (botón de cerrar o tecla `Escape`). |

## Comportamiento con teclado

| Tecla | Acción |
| --- | --- |
| `←` | Navega a la imagen anterior. |
| `→` | Navega a la imagen siguiente. |
| `Escape` | Cierra el visor. |

## Renderizado de imágenes

Mientras cada imagen se renderiza, el visor muestra un indicador de carga. Si la imagen falla (URL rota, error de red, recurso no disponible), se reemplaza por un mensaje de error con un ícono, sin afectar la navegación hacia otras imágenes de la galería. Ambos estados se reinician automáticamente al cambiar de imagen.

## Descarga de imágenes

El botón de descarga funciona sin importar el origen de la imagen, y se deshabilita brevemente al hacer clic para evitar doble clic accidental:

- **Mismo dominio que la app**: la descarga se dispara directamente mediante un enlace temporal.
- **Dominio externo** (por ejemplo, una API o un CDN): la imagen se obtiene primero con `fetch`, se convierte a un blob local y luego se descarga, evitando las restricciones del navegador para descargas cross-origin.

Si la descarga falla por cualquier motivo (red, CORS, recurso no disponible), el error se registra en la consola sin interrumpir la aplicación.

## Requisitos

- Angular 21+.
- Navegador compatible con `fetch`, `URL.createObjectURL` y APIs estándar del DOM.

## Desarrollo

Para arrancar la app de demo del proyecto:

```bash
npm install
ng serve demo
```

Para compilar la librería:

```bash
ng build ngx-superlite-img-viewer
```

Para ejecutar las pruebas unitarias de la librería, sitúate en la raíz del proyecto, donde están `angular.json` y `package.json`, y ejecuta:

```bash
npx ng test ngx-superlite-img-viewer --no-watch
```

Este comando ejecuta las pruebas una sola vez y finaliza al terminar.

## Licencia

[MIT](./LICENSE)
