export interface Clinic {
  id: string;
  fantasy_name: string;
  corporate_name: string;
  cnpj: string;
  is_active: Boolean;
  inauguration_date: string; // Formato dd/mm/aaaa
  specialties?: string[];
  regional?: string;

}
