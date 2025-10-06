import { ChangeDetectionStrategy, Component, computed, WritableSignal, signal, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Clinic } from '../clinicas.model';
import { ModalComponent } from '../../../components/modal/modal.component';
import { clinicasStore } from '../clinic.store';

@Component({
  selector: 'app-clinicas-view',
  imports: [CommonModule, ModalComponent],
  standalone: true,
  templateUrl: './clinicas-view.component.html',
  styleUrl: './clinicas-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ClinicasViewComponent {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);
  store = inject(clinicasStore);

  isModalOpen: WritableSignal<boolean> = signal(false);

  clinic: WritableSignal<Clinic | undefined> = signal(
    this.route.snapshot.data['clinic'] as Clinic | undefined
  );


  feedback: WritableSignal<string | null> = signal(null);

  statusText = computed(() => this.clinic()?.is_active ? 'Ativa' : 'Inativa');


  statusClass = computed(() => this.clinic()?.is_active ? 'bg-green-600' : 'bg-red-600');

  goBack(): void {
    this.location.back();
  }


  editClinic(): void {
    if (this.clinic()) {
      this.store.selectClinic(this.clinic()!);
      this.router.navigate(
        ['/dashboard/clinica/editar', this.clinic()?.id]
      );
    }
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  showAllSpecialty(): void {
    this.openModal();
  }

  private showFeedback(message: string): void {
    this.feedback.set(message);
    setTimeout(() => this.feedback.set(null), 3000);
  }
}
