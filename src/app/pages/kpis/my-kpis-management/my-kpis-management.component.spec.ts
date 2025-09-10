import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyKpisManagementComponent } from './my-kpis-management.component';

describe('MyKpisManagementComponent', () => {
  let component: MyKpisManagementComponent;
  let fixture: ComponentFixture<MyKpisManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyKpisManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyKpisManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
