import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInternalTasksComponent } from './admin-internal-tasks.component';

describe('AdminInternalTasksComponent', () => {
  let component: AdminInternalTasksComponent;
  let fixture: ComponentFixture<AdminInternalTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInternalTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInternalTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
