import { TestBed } from '@angular/core/testing';

import { AttendanceDashboardService } from './attendance-dashboard.service';

describe('AttendanceDashboardService', () => {
  let service: AttendanceDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
