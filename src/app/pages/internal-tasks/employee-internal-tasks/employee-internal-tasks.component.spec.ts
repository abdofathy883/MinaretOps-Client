import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeInternalTasksComponent } from './employee-internal-tasks.component';

describe('EmployeeInternalTasksComponent', () => {
  let component: EmployeeInternalTasksComponent;
  let fixture: ComponentFixture<EmployeeInternalTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeInternalTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeInternalTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
