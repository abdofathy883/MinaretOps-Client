import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeoPagesComponent } from './seo-pages.component';

describe('SeoPagesComponent', () => {
  let component: SeoPagesComponent;
  let fixture: ComponentFixture<SeoPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeoPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeoPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
