import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCheckpointsComponent } from './service-checkpoints.component';

describe('ServiceCheckpointsComponent', () => {
  let component: ServiceCheckpointsComponent;
  let fixture: ComponentFixture<ServiceCheckpointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceCheckpointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceCheckpointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
