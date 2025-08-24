import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleInternalTaskComponent } from './single-internal-task.component';

describe('SingleInternalTaskComponent', () => {
  let component: SingleInternalTaskComponent;
  let fixture: ComponentFixture<SingleInternalTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleInternalTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleInternalTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
