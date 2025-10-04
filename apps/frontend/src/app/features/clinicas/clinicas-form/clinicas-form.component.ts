import { Component, ChangeDetectionStrategy, computed, signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl
} from '@angular/forms';

// 1. Interface de Dados da Clínica
export interface Clinic {
  id?: string; // Adicionado ID para edição
  corporateName: string;
  fantasyName: string;
  cnpj: string;
  regional: string;
  inaugurationDate: string | null;
  specialties: string[];
  isActive: boolean;
}

// Tipagem para o objeto de formulário
interface ClinicForm {
  corporateName: FormControl<string | null>;
  fantasyName: FormControl<string | null>;
  cnpj: FormControl<string | null>;
  regional: FormControl<string | null>;
  inaugurationDate: FormControl<string | null>;
  specialties: FormControl<string[] | null>;
  isActive: FormControl<boolean | null>;
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

  // 2. INPUT para receber os dados da clínica para edição. undefined para criação.
  clinicData = input<Clinic | undefined>(undefined);

  // 3. Sinais Calculados para textos dinâmicos
  isEditing = computed(() => !!this.clinicData());
  cardTitle = computed(() => this.isEditing() ? 'Editar Clínica' : 'Nova Clínica');
  cardSubtitle = computed(() => this.isEditing() ? 'Altere os dados da clínica abaixo.' : 'Preencha os dados abaixo para cadastrar uma nova clínica.');
  submitButtonText = computed(() => this.isEditing() ? 'Salvar Alterações' : 'Criar Clínica');

  // Mock de Dados para Dropdown
  regions = signal([
    { value: '', label: 'Selecione uma regional' },
    { value: 'alto_tiete', label: 'Alto Tietê' },
    { value: 'interior', label: 'Interior' },
    { value: 'sp', label: 'São Paulo' },
    { value: 'rj', label: 'Rio de Janeiro' },
    { value: 'mg', label: 'Minas Gerais' },
    { value: 'nacional', label: 'Nacional' },
  ]);

  // Mock de Dados para Multi-Select
  availableSpecialties = signal([
    'Clínica Geral',
    'Cardiologia',
    'Dermatologia',
    'Pediatria',
    'Ortopedia',
    'Ginecologia',
  ]);

  // Inicialização do Formulário Reativo
  clinicForm: FormGroup<ClinicForm>;

  constructor() {
    this.clinicForm = this.fb.group<ClinicForm>({
      corporateName: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)], nonNullable: true }),
      fantasyName: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)], nonNullable: true }),
      cnpj: this.fb.control('', { validators: [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)], nonNullable: true }),
      regional: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
      inaugurationDate: this.fb.control(null, { nonNullable: false }),
      specialties: this.fb.control([], { nonNullable: true }),
      isActive: this.fb.control(true, { nonNullable: true }),
    });

    // 4. Carrega os dados se estiver em modo de edição
    if (this.clinicData()) {
      const data = this.clinicData()!;
      this.clinicForm.patchValue({
        corporateName: data.corporateName,
        fantasyName: data.fantasyName,
        cnpj: data.cnpj,
        regional: data.regional,
        // Garante que o formato da data é 'YYYY-MM-DD' para o input type="date"
        inaugurationDate: data.inaugurationDate,
        specialties: data.specialties,
        isActive: data.isActive,
      });
      console.log('Modo Edição ativado. Formulário preenchido.');
    } else {
      console.log('Modo Criação ativado.');
    }
  }

  // Lógica para adicionar especialidade ao multi-select
  addSpecialty(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const specialty = selectElement.value;

    if (specialty && !this.isSpecialtySelected(specialty)) {
      const currentSpecialties = this.clinicForm.controls.specialties.value || [];
      this.clinicForm.controls.specialties.setValue([...currentSpecialties, specialty]);

      selectElement.value = '';
    }
  }

  // Lógica para remover especialidade do multi-select
  removeSpecialty(specialty: string): void {
    const currentSpecialties = this.clinicForm.controls.specialties.value || [];
    const updatedSpecialties = currentSpecialties.filter(s => s !== specialty);
    this.clinicForm.controls.specialties.setValue(updatedSpecialties);
  }

  // Verifica se a especialidade já foi selecionada para desabilitar a opção
  isSpecialtySelected(specialty: string): boolean {
    return (this.clinicForm.controls.specialties.value || []).includes(specialty);
  }


  onSubmit(): void {
    if (this.clinicForm.valid) {
      const formData = this.clinicForm.value;

      if (this.isEditing()) {
        const clinicId = this.clinicData()!.id;
        console.log(`[EDIÇÃO] Enviando atualização para a clínica ID: ${clinicId}`, formData);
        // Exemplo: this.clinicService.update(clinicId, formData);
        // alert(`Clínica ${clinicId} atualizada com sucesso!`);
      } else {
        console.log('[CRIAÇÃO] Enviando nova clínica:', formData);
        // Exemplo: this.clinicService.create(formData);
        // alert('Nova clínica cadastrada com sucesso!');
        this.clinicForm.reset({ isActive: true, specialties: [] });
      }
    } else {
      console.error('Formulário Inválido. Verifique os campos obrigatórios.');
      this.clinicForm.markAllAsTouched();
    }
  }
}
