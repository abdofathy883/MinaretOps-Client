import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCurrenciesComponent } from './all-currencies.component';

describe('AllCurrenciesComponent', () => {
  let component: AllCurrenciesComponent;
  let fixture: ComponentFixture<AllCurrenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCurrenciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCurrenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
