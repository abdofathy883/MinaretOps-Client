import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleEntryComponent } from './single-entry.component';

describe('SingleEntryComponent', () => {
  let component: SingleEntryComponent;
  let fixture: ComponentFixture<SingleEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
