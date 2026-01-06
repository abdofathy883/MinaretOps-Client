import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalaryPeriodComponent } from './add-salary-period.component';

describe('AddSalaryPeriodComponent', () => {
  let component: AddSalaryPeriodComponent;
  let fixture: ComponentFixture<AddSalaryPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSalaryPeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSalaryPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
