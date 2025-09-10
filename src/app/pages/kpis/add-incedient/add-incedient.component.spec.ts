import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIncedientComponent } from './add-incedient.component';

describe('AddIncedientComponent', () => {
  let component: AddIncedientComponent;
  let fixture: ComponentFixture<AddIncedientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIncedientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIncedientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
