import { TestBed } from '@angular/core/testing';

import { EmpInvitationService } from './emp-invitation.service';

describe('EmpInvitationService', () => {
  let service: EmpInvitationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpInvitationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
