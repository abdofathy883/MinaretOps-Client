import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JdForEmpComponent } from './jd-for-emp.component';

describe('JdForEmpComponent', () => {
  let component: JdForEmpComponent;
  let fixture: ComponentFixture<JdForEmpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JdForEmpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JdForEmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
