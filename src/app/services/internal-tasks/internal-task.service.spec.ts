import { TestBed } from '@angular/core/testing';

import { InternalTaskService } from './internal-task.service';

describe('InternalTaskService', () => {
  let service: InternalTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternalTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
