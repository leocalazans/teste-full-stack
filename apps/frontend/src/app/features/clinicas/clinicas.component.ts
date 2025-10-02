import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../components/dropdown/dropdown.component';
interface Clinic {
  fantasyName: string;
  corporateName: string;
  cnpj: string;
  status: 'Ativa' | 'Inativa';
  inauguration: string; // Formato dd/mm/aaaa
}

interface SortState {
  column: keyof Clinic | null;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-clinicas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DropdownComponent],
  templateUrl: './clinicas.component.html',
  styleUrl: './clinicas.component.css',
})
export class ClinicasComponent {

  // 1. DADOS ORIGINAIS
  clinics = signal<Clinic[]>([
    { fantasyName: 'Clínica Sorriso', corporateName: 'Clínica Médica Sorriso LTDA', cnpj: '11.222.333/0001-44', status: 'Ativa', inauguration: '14/01/2020' },
    { fantasyName: 'Bem Estar', corporateName: 'Centro de Saúde Bem Estar S.A.', cnpj: '44.555.666/0001-77', status: 'Ativa', inauguration: '19/05/2018' },
    { fantasyName: 'AMI Saúde', corporateName: 'Atendimento Médico Integrado ME', cnpj: '77.888.999/0001-00', status: 'Inativa', inauguration: '31/10/2022' },
    { fantasyName: 'Clínica Visão', corporateName: 'Oftalmologia Visão Clara', cnpj: '22.333.444/0001-55', status: 'Ativa', inauguration: '10/03/2019' },
    { fantasyName: 'Ortobem', corporateName: 'Clínica Ortopédica Bem', cnpj: '55.666.777/0001-88', status: 'Ativa', inauguration: '01/07/2021' },
    { fantasyName: 'CardioMais', corporateName: 'Centro Cardiológico Mais LTDA', cnpj: '88.999.000/0001-11', status: 'Inativa', inauguration: '05/11/2017' },
    { fantasyName: 'FisioTotal', corporateName: 'Fisioterapia Total LTDA', cnpj: '00.111.222/0001-33', status: 'Ativa', inauguration: '22/04/2023' },
  ]);

  isModalOpen = signal(false);

  // 2. BUSCA (Signal para controlar o estado do input)
  searchTerm = signal('');

  // 3. PAGINAÇÃO (Sinais para controlar o estado da paginação)
  pageSize = signal(5);
  currentPage = signal(1);

  // 💥 NOVO: Estado da Ordenação
  sortState = signal<SortState>({ column: 'inauguration', direction: 'desc' });

  // Função utilitária para converter dd/mm/aaaa para um objeto Date.
  // IMPORTANTE: Esta é a forma padrão. Se você pudesse usar a Temporal API,
  // usaria Temporal.PlainDate.from('aaaa-mm-dd') para melhor precisão.
  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    // Cria a data no formato aaaa-mm-dd (ISO) para evitar problemas de fuso horário local.
    // Mês é base 0 no JavaScript, então month - 1.
    return new Date(`${year}-${month}-${day}`);
  }

  // 4. COMPUTED: Dados filtrados E ordenados
  sortedAndFilteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const state = this.sortState();

    // 1. FILTRAGEM
    const filtered = this.clinics().filter(clinic => {
      // (Lógica de busca copiada do exemplo anterior)
      if (!term) return true;
      return Object.values(clinic).some(value =>
        String(value).toLowerCase().includes(term)
      );
    });

    // 2. ORDENAÇÃO
    if (!state.column) {
      return filtered;
    }

    // Clonamos o array para não modificar o estado original (princípio de imutabilidade)
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[state.column!];
      const bValue = b[state.column!];

      let comparison = 0;

      if (state.column === 'inauguration') {
        // 💥 Lógica específica para DATA 💥
        const dateA = this.parseDate(aValue as string).getTime();
        const dateB = this.parseDate(bValue as string).getTime();
        comparison = dateA - dateB;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Lógica para strings (Nome, Razão Social, etc.)
        comparison = aValue.localeCompare(bValue);
      } else {
        // Lógica para outros tipos (se houver números)
        comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }

      // Aplica a direção da ordenação
      return state.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  });

  // 5. COMPUTED: Dados paginados (usa o sortedAndFilteredData)
  paginatedClinics = computed(() => {
    const data = this.sortedAndFilteredData();
    const size = this.pageSize();
    const page = this.currentPage();

    const start = (page - 1) * size;
    const end = start + size;

    return data.slice(start, end);
  });

  // 6. COMPUTED: Totais e Páginas
  totalPages = computed(() => {
    return Math.ceil(this.sortedAndFilteredData().length / this.pageSize());
  });

  // 7. MÉTODOS DE AÇÃO

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  // Método de Ordenação (Toggle)
  toggleSort(column: keyof Clinic): void {
    this.sortState.update(state => {
      let direction: 'asc' | 'desc';

      if (state.column === column) {
        // Se for a mesma coluna, inverte a direção
        direction = state.direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Se for uma nova coluna, define a direção padrão (ex: descendente para datas)
        direction = column === 'inauguration' ? 'desc' : 'asc';
      }

      // Reinicia a paginação para a primeira página após a ordenação
      this.currentPage.set(1);

      return { column, direction };
    });
  }

  menuItems = [
    { label: 'Ver', value: 'ver' },
    { label: 'Deletar', value: 'deletar' },
  ];

  selectedItemLabel: string = 'Nenhum';

  onItemSelected(item: { label: string, value: any }, id: string) {
    console.log('ID:', id);
    console.log('Selecionado:', item.value);
    this.selectedItemLabel = item.label;
    // Adicione a lógica de ação aqui
  }
}
