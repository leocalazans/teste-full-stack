import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicasViewComponent } from './clinicas-view.component';

describe('ClinicasViewComponent', () => {
  let component: ClinicasViewComponent;
  let fixture: ComponentFixture<ClinicasViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicasViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicasViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
