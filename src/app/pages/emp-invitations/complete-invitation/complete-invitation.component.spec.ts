import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteInvitationComponent } from './complete-invitation.component';

describe('CompleteInvitationComponent', () => {
  let component: CompleteInvitationComponent;
  let fixture: ComponentFixture<CompleteInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteInvitationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
