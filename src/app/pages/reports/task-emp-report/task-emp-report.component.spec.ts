import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskEmpReportComponent } from './task-emp-report.component';

describe('TaskEmpReportComponent', () => {
  let component: TaskEmpReportComponent;
  let fixture: ComponentFixture<TaskEmpReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskEmpReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskEmpReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
