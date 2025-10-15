import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskShimmerComponent } from './task-shimmer.component';

describe('TaskShimmerComponent', () => {
  let component: TaskShimmerComponent;
  let fixture: ComponentFixture<TaskShimmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskShimmerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskShimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
