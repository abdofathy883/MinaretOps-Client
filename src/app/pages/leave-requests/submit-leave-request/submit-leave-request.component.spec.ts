import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitLeaveRequestComponent } from './submit-leave-request.component';

describe('SubmitLeaveRequestComponent', () => {
  let component: SubmitLeaveRequestComponent;
  let fixture: ComponentFixture<SubmitLeaveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitLeaveRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitLeaveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
