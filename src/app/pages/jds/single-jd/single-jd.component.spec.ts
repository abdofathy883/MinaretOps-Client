import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleJdComponent } from './single-jd.component';

describe('SingleJdComponent', () => {
  let component: SingleJdComponent;
  let fixture: ComponentFixture<SingleJdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleJdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleJdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
