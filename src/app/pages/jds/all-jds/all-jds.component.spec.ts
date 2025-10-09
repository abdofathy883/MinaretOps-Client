import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllJdsComponent } from './all-jds.component';

describe('AllJdsComponent', () => {
  let component: AllJdsComponent;
  let fixture: ComponentFixture<AllJdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllJdsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllJdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
