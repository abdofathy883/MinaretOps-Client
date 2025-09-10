import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpisManagementComponent } from './kpis-management.component';

describe('KpisManagementComponent', () => {
  let component: KpisManagementComponent;
  let fixture: ComponentFixture<KpisManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpisManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpisManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
