import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJdComponent } from './add-jd.component';

describe('AddJdComponent', () => {
  let component: AddJdComponent;
  let fixture: ComponentFixture<AddJdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddJdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddJdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
