import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicasFormComponent } from './clinicas-form.component';

describe('ClinicasFormComponent', () => {
  let component: ClinicasFormComponent;
  let fixture: ComponentFixture<ClinicasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
