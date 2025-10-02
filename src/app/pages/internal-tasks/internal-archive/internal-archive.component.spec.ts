import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalArchiveComponent } from './internal-archive.component';

describe('InternalArchiveComponent', () => {
  let component: InternalArchiveComponent;
  let fixture: ComponentFixture<InternalArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
