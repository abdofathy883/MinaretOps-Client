import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInternalTaskComponent } from './add-internal-task.component';

describe('AddInternalTaskComponent', () => {
  let component: AddInternalTaskComponent;
  let fixture: ComponentFixture<AddInternalTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInternalTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInternalTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
