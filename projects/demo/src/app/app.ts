import { Component, signal } from '@angular/core';
import { NgxSuperliteImgViewer } from 'ngx-superlite-img-viewer';

@Component({
  selector: 'app-root',
  imports: [NgxSuperliteImgViewer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  isCloseViewer = signal(true);
  indexImg = signal(0);

  openViewer(index: number) {
    this.isCloseViewer.set(false);
    this.indexImg.set(index);
  }

  testImgs = ['https://picsum.photos/id/1/200/300', 'https://picsum.photos/id/2/200/300', 'https://picsum.photos/id/3/200/300', 'https://picsum.photos/id/4/200/300']
}
