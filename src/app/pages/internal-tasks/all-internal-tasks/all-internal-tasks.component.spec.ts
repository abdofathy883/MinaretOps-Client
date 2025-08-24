import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllInternalTasksComponent } from './all-internal-tasks.component';

describe('AllInternalTasksComponent', () => {
  let component: AllInternalTasksComponent;
  let fixture: ComponentFixture<AllInternalTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllInternalTasksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllInternalTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
