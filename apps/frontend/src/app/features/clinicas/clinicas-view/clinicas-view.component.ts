import { ChangeDetectionStrategy, Component, computed, WritableSignal, signal, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Clinic } from '../clinicas.model';
// Reutilizando a interface de dados para a estrutura da clínica

@Component({
  selector: 'app-clinicas-view',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './clinicas-view.component.html',
  styleUrl: './clinicas-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ClinicasViewComponent implements OnInit { // Adicionado 'implements OnInit' para clareza
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);

  clinic: WritableSignal<Clinic | undefined> = signal(
    this.route.snapshot.data['clinic'] as Clinic | undefined
  );


  ngOnInit(): void {

    console.log('ClinicasViewComponent initialized. Clinic data loaded into signal.');
  }

  feedback: WritableSignal<string | null> = signal(null);

  statusText = computed(() => this.clinic()?.is_active ? 'Ativa' : 'Inativa');


  statusClass = computed(() => this.clinic()?.is_active ? 'bg-green-600' : 'bg-red-600');

  goBack(): void {
    this.location.back();
  }


  editClinic(): void {
    this.router.navigate(['/dashboard/clinica/editar', this.clinic()?.id]);
  }


  addSpecialty(): void {
    const newSpecialty = 'Odontologia';
    let success = false;


    this.clinic.update((current) => {
      if (current) {
        success = true;
        return {
          ...current,
          specialties: [...(current.specialties ?? []), newSpecialty]
        };
      }
      return current; // Se 'current' for undefined, retorna undefined (sem mudança)
    });

    if (success) {
      this.showFeedback('Especialidade "' + newSpecialty + '" adicionada (simulado).');
    } else {
      this.showFeedback('Erro: Não é possível adicionar especialidade, clínica não carregada.');
    }
  }


  private showFeedback(message: string): void {
    this.feedback.set(message);
    setTimeout(() => this.feedback.set(null), 3000);
  }
}
