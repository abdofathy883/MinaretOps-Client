import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSalaryPeriodComponent } from './single-salary-period.component';

describe('SingleSalaryPeriodComponent', () => {
  let component: SingleSalaryPeriodComponent;
  let fixture: ComponentFixture<SingleSalaryPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleSalaryPeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleSalaryPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
