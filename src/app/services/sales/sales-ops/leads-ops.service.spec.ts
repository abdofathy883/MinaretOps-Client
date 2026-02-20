import { TestBed } from '@angular/core/testing';

import { LeadsOpsService } from './leads-ops.service';

describe('LeadsOpsService', () => {
  let service: LeadsOpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeadsOpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
