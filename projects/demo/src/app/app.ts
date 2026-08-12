import { Component, signal } from '@angular/core';
import { NgxSuperliteImgViewer } from 'ngx-superlite-img-viewer';

@Component({
  selector: 'app-root',
  imports: [NgxSuperliteImgViewer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  isOpenViewer = signal(false);
  indexImg = signal(0);

  openViewer(index: number) {
    this.isOpenViewer.set(true);
    this.indexImg.set(index);
  }

  imgArray: string[] = [];

  ngOnInit() {
    for (let i = 1; i <= 1; i++) {
      this.imgArray.push(`https://picsum.photos/id/${i}/800/800`);
    }
  }

  closeViewer() {
    this.isOpenViewer.set(false);
  }

}
