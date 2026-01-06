import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSalaryPeriodsComponent } from './all-salary-periods.component';

describe('AllSalaryPeriodsComponent', () => {
  let component: AllSalaryPeriodsComponent;
  let fixture: ComponentFixture<AllSalaryPeriodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSalaryPeriodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSalaryPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
