import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSuperliteImgViewer } from './ngx-superlite-img-viewer';

describe('NgxSuperliteImgViewer', () => {
  let component: NgxSuperliteImgViewer;
  let fixture: ComponentFixture<NgxSuperliteImgViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSuperliteImgViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxSuperliteImgViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
