import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAccountShimmerComponent } from './my-account-shimmer.component';

describe('MyAccountShimmerComponent', () => {
  let component: MyAccountShimmerComponent;
  let fixture: ComponentFixture<MyAccountShimmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAccountShimmerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAccountShimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
