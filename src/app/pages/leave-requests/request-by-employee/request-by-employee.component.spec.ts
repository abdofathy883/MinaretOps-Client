import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestByEmployeeComponent } from './request-by-employee.component';

describe('RequestByEmployeeComponent', () => {
  let component: RequestByEmployeeComponent;
  let fixture: ComponentFixture<RequestByEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestByEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestByEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
