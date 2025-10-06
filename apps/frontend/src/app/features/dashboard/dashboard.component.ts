import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div class="pt-[42px] space-y-6">
        <div class="flex items-center">
          <div class="flex-1">
            <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p class="text-gray-500">Gerencie o sistema.</p>
          </div>
          <div class="ml-auto">
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [``]
})
export class DashboardComponent {
  // private svc = inject(ClinicService);

  // clinics: Clinic[] = [];
  // newName = '';
  // newAddress = '';

  // editing: Clinic | null = null;

  // constructor() {
  //   this.refresh();
  // }

  // refresh() {
  //   this.svc.list().subscribe(list => this.clinics = list);
  // }

  create() {
    // if (!this.newName) return;
    // this.svc.create({ name: this.newName, address: this.newAddress }).subscribe(c => {
    //   this.clinics.push(c);
    //   this.newName = '';
    //   this.newAddress = '';
    // });
  }

  // startEdit(c: Clinic) {
  //   // this.editing = { ...c };
  // }

  saveEdit() {
    // if (!this.editing) return;
    // this.svc.update(this.editing.id, { name: this.editing.name, address: this.editing.address }).subscribe(updated => {
    //   const idx = this.clinics.findIndex(x => x.id === updated.id);
    //   if (idx >= 0) this.clinics[idx] = updated;
    //   this.editing = null;
    // });
  }

  cancelEdit() {
    // this.editing = null;
  }

  // remove(c: Clinic) {
  //   // this.svc.delete(c.id).subscribe(() => {
  //   //   this.clinics = this.clinics.filter(x => x.id !== c.id);
  //   // });
  // }
}
