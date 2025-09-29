import { TestBed } from '@angular/core/testing';

import { FingerPrientService } from './finger-prient.service';

describe('FingerPrientService', () => {
  let service: FingerPrientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FingerPrientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
