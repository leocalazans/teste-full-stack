// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { DashboardComponent } from './dashboard.component';
// import { ClinicService } from '../clinic/clinic.service';
// import { of, throwError } from 'rxjs';
// import { FormsModule } from '@angular/forms';

// describe('DashboardComponent', () => {
//   let component: DashboardComponent;
//   let fixture: ComponentFixture<DashboardComponent>;
//   let svc: jasmine.SpyObj<ClinicService>;

//   beforeEach(async () => {
//     svc = jasmine.createSpyObj('ClinicService', ['list', 'create', 'update', 'delete']);
//     svc.list.and.returnValue(of([{ id: 1, name: 'Clinica A', address: 'Addr' }]));

//     await TestBed.configureTestingModule({
//       imports: [FormsModule, DashboardComponent],
//       providers: [{ provide: ClinicService, useValue: svc }]
//     }).compileComponents();

//     fixture = TestBed.createComponent(DashboardComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create and load clinics', () => {
//     expect(component).toBeTruthy();
//     expect(component.clinics.length).toBe(1);
//     expect(component.clinics[0].name).toBe('Clinica A');
//   });

//   it('should create a new clinic', fakeAsync(() => {
//     svc.create.and.returnValue(of({ id: 2, name: 'New', address: 'NewAddr' }));
//     component.newName = 'New';
//     component.newAddress = 'NewAddr';
//     component.create();
//     tick();
//     expect(svc.create).toHaveBeenCalledWith({ name: 'New', address: 'NewAddr' });
//     expect(component.clinics.find(c => c.id === 2)?.name).toBe('New');
//   }));

//   it('should edit a clinic', fakeAsync(() => {
//     const updated = { id: 1, name: 'Clinica A2', address: 'Addr2' };
//     svc.update.and.returnValue(of(updated));
//     component.startEdit({ id: 1, name: 'Clinica A', address: 'Addr' });
//     if (component.editing) {
//       component.editing.name = 'Clinica A2';
//       component.editing.address = 'Addr2';
//     }
//     component.saveEdit();
//     tick();
//     expect(svc.update).toHaveBeenCalledWith(1, { name: 'Clinica A2', address: 'Addr2' });
//     expect(component.clinics.find(c => c.id === 1)?.name).toBe('Clinica A2');
//   }));

//   it('should cancel edit', () => {
//     component.startEdit({ id: 1, name: 'Clinica A', address: 'Addr' });
//     component.cancelEdit();
//     expect(component.editing).toBeNull();
//   });

//   it('should delete a clinic', fakeAsync(() => {
//     svc.delete.and.returnValue(of(void 0));
//     const c = { id: 1, name: 'Clinica A', address: 'Addr' };
//     component.remove(c);
//     tick();
//     expect(svc.delete).toHaveBeenCalledWith(1);
//     expect(component.clinics.length).toBe(0);
//   }));

//   it('should handle service errors gracefully', fakeAsync(() => {
//     svc.create.and.returnValue(throwError(() => ({ status: 500 })));
//     component.newName = 'Err';
//     component.create();
//     tick();
//     // error should not add clinic
//     expect(component.clinics.find(c => c.name === 'Err')).toBeUndefined();
//   }));
// });
