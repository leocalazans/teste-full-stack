import { Component, ChangeDetectionStrategy, computed, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl
} from '@angular/forms';
import { clinicasStore } from '../clinic.store';
import { Region, Specialty, Clinic } from '../clinicas.model';
import { ClinicasService } from '../clinicas.service';
import { Router } from '@angular/router';
import { ToastService } from '../../toast/toast.service';

interface ClinicForm {
  corporate_name: FormControl<string | null>;
  fantasy_name: FormControl<string | null>;
  cnpj: FormControl<string | null>;
  regional: FormControl<string | null>;
  inauguration_date: FormControl<string | null>;
  specialties: FormControl<Specialty[] | null>;
  is_active: FormControl<boolean | null>;
}

@Component({
  selector: 'app-clinicas-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clinicas-form.component.html',
  styleUrl: './clinicas-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ClinicasFormComponent {
  private fb = inject(FormBuilder);
  private clinicasStore = inject(clinicasStore);
  private ClinicasService = inject(ClinicasService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Estado global
  clinicData = this.clinicasStore.selectedClinic;

  // Textos dinâmicos
  isEditing = computed(() => !!this.clinicData());
  cardTitle = computed(() => this.isEditing() ? 'Editar clínica' : 'Nova clínica');
  cardSubtitle = computed(() => this.isEditing() ? 'Altere os dados da clínica abaixo.' : 'Preencha os dados para cadastrar uma nova clínica.');
  submitButtonText = computed(() => this.isEditing() ? 'Salvar alterações' : 'Criar clínica');
  // // Mock de Dados para Dropdown
  regions = signal<Region[]>([]);
  // Mock de Dados para Multi-Select
  availableSpecialties = signal<Specialty[]>([]);

  fetchRegions = effect(() => {
    this.ClinicasService.getRegions().subscribe({
      next: (data) => this.regions.set(data),
      error: (err) => console.error('Erro ao buscar regiões', err),
    });
  })

  fetchAvailableSpecialties = effect(() => {
    this.ClinicasService.getSpecialties().subscribe({
      next: (data) => this.availableSpecialties.set(data),
      error: (err) => console.error('Erro ao buscar regiões', err),
    });
  })


  // Inicialização do Formulário Reativo
  clinicForm: FormGroup<ClinicForm> = this.fb.group<ClinicForm>({
    corporate_name: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    fantasy_name: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    cnpj: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    regional: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    inauguration_date: this.fb.control(null),
    specialties: this.fb.control<Specialty[] | null>([]),
    is_active: this.fb.control(true, { nonNullable: true }),
  });

  _syncEffect = effect(() => {
    const clinic = this.clinicData();
    if (clinic) {
      this.clinicForm.patchValue({
        corporate_name: clinic.corporate_name,
        fantasy_name: clinic.fantasy_name,
        cnpj: clinic.cnpj,
        regional: clinic.regional,
        inauguration_date: clinic.inauguration_date,
        specialties: clinic.specialties,
        is_active: clinic.is_active ? true : false,
      });
    } else {
      this.clinicForm.reset({ is_active: true, specialties: [] });
    }
  });


  // Lógica para adicionar especialidade ao multi-select
  addSpecialty(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const specialtyID = selectElement.value;
    console.log(' Selected Specialty:', specialtyID);
    if (!specialtyID) return;

    const specialtyObj = this.availableSpecialties().find(s => s.id === specialtyID);
    if (!specialtyObj) return;
    console.log(' Specialty Object:', specialtyObj);
    const currentSpecialties: Specialty[] = this.clinicForm.controls.specialties.value || [];
    if (!currentSpecialties.some(s => s.id === specialtyObj.id)) {
      this.clinicForm.controls.specialties.setValue([...currentSpecialties, specialtyObj]);
    }

    selectElement.value = '';
  }

  // Remove uma especialidade pelo id
  removeSpecialty(specialty: Specialty): void {
    const currentSpecialties: Specialty[] = this.clinicForm.controls.specialties.value || [];
    const updatedSpecialties = currentSpecialties.filter(s => s.id !== specialty.id);
    this.clinicForm.controls.specialties.setValue(updatedSpecialties);
  }

  // Verifica se a especialidade já foi selecionada pelo id
  isSpecialtySelected(specialty: Specialty): boolean {
    const currentSpecialties: Specialty[] = this.clinicForm.controls.specialties.value || [];
    return currentSpecialties.some(s => s.id === specialty.id);
  }

  goToCancel() {
    this.router.navigate(['/dashboard/clinicas']); // rota interna do Angular
  }

  onSubmit(): void {
    if (!this.clinicForm.valid) {
      this.clinicForm.markAllAsTouched();
      return;
    }

    const formData = this.clinicForm.value;
    if (this.isEditing()) {
      this.ClinicasService.update(this.clinicData()!.id, formData as Partial<Clinic>).subscribe({
        next: (updatedClinic) => {
          console.log('Clínica atualizada com sucesso:', updatedClinic);
          // Atualiza a clínica no estado global
          this.clinicasStore.setClinics(
            this.clinicasStore.clinics().map(clinic =>
              clinic.id === updatedClinic.id ? updatedClinic : clinic)
          );
          this.toastService.show('Clínica atualizada com sucesso!', 'success');
          this.clinicasStore.clearSelectedClinic();
          this.clinicForm.reset({ is_active: true, specialties: [] });
          this.router.navigate([`/dashboard/clinica/${updatedClinic.id}`]);
        },
        error: (err) => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          this.toastService.show('Erro ao atualizar clínica!', 'error');
          console.error('Erro ao atualizar clínica:', err);
        }
      });

    } else {
      this.ClinicasService.create(formData as Partial<Clinic>).subscribe({
        next: (newClinic) => {
          console.log('Clínica criada com sucesso:', newClinic);
          this.toastService.show('Clínica criada com sucesso!', 'success');
          this.clinicForm.reset({ is_active: true, specialties: [] });
          this.router.navigate([`/dashboard/clinica/${newClinic.id}`]);
        },
        error: (err) => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          this.toastService.show('Erro ao criar clínica!', 'error');
          console.error('Erro ao criar clínica:', err)
        }
      });

    }
  }
}
