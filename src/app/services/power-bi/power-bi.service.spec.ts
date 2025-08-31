import { TestBed } from '@angular/core/testing';

import { PowerBIService } from './power-bi.service';

describe('PowerBIService', () => {
  let service: PowerBIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerBIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
