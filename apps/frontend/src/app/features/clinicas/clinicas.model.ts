export interface Specialty {
  id: string;
  name: string;
}

export interface Clinic {
  id: string;
  fantasy_name: string;
  corporate_name: string;
  cnpj: string;
  is_active: Boolean;
  inauguration_date: string; // Formato dd/mm/aaaa
  specialties?: Specialty[];
  regional_name?: string;
  regional?: string;
}

export interface Region {
  id: string;
  name: string;
  label: string;
}

