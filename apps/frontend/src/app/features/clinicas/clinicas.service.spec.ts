import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClinicasService } from './clinicas.service';
import { API_BASE_URL } from '../../app.config';
// Importação dos modelos para tipagem e mocks
import { Clinic, Region, Specialty } from './clinicas.model';

describe('ClinicasService', () => {
  let service: ClinicasService;
  let httpTestingController: HttpTestingController;

  const mockBaseUrl = 'http://test-api.com';

  // --- Mocks de Dados Atualizados de acordo com a model ---
  const mockSpecialty: Specialty[] = [{ id: 'S1', name: 'Cardiologia' }];
  const mockRegion: Region[] = [{ id: 'R1', name: 'Norte', label: 'Regional Norte' }];

  const baseClinic: Clinic = {
    id: '1',
    fantasy_name: 'Clinica Teste',
    corporate_name: 'Corporação Teste S.A.',
    cnpj: '00.000.000/0001-00',
    is_active: true,
    inauguration_date: '01/01/2020',
    specialties: mockSpecialty,
    regional_name: 'Norte',
    regional: 'R1',
  };

  const mockClinics: Clinic[] = [
    { ...baseClinic, id: '1', fantasy_name: 'Clinica A Fantasia' },
    { ...baseClinic, id: '2', fantasy_name: 'Clinica B Fantasia', cnpj: '00.000.000/0001-01' }
  ];
  // ---------------------------------

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ClinicasService,
        // Fornece um valor mock para o token de injeção API_BASE_URL
        { provide: API_BASE_URL, useValue: mockBaseUrl }
      ]
    });

    service = TestBed.inject(ClinicasService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Garante que não há requisições HTTP pendentes não esperadas.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- Testes para Métodos de Clínica (CRUD) ---

  it('#list should send a GET request to /clinics and return data', (done) => {
    service.list().subscribe(clinics => {
      expect(clinics).toEqual(mockClinics);
      done();
    });

    const req = httpTestingController.expectOne(`${mockBaseUrl}/clinics`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockClinics); // Responde com os dados mockados
  });

  it('#getClinicById should send a GET request to /clinics/:id and return data', (done) => {
    const clinicId = '1';
    const mockClinic = mockClinics[0];

    service.getClinicById(clinicId).subscribe(clinic => {
      expect(clinic).toEqual(mockClinic);
      done();
    });

    const req = httpTestingController.expectOne(`${mockBaseUrl}/clinics/${clinicId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockClinic);
  });

  it('#create should send a POST request to /clinics with all required fields', (done) => {
    const newClinicData: Partial<Clinic> = {
      fantasy_name: 'Nova Clinica Criada',
      corporate_name: 'Nova Corp',
      cnpj: '11.111.111/1111-11',
      is_active: true,
      inauguration_date: '10/10/2023',
    };

    const mockCreatedClinic: Clinic = {
      ...newClinicData,
      id: '3',
      specialties: [],
      regional_name: 'Sul',
      regional: 'R2'
    } as Clinic;

    service.create(newClinicData).subscribe(clinic => {
      expect(clinic).toEqual(mockCreatedClinic);
      done();
    });

    const req = httpTestingController.expectOne(`${mockBaseUrl}/clinics`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newClinicData);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockCreatedClinic);
  });

  it('#update should send a PUT request to /clinics/:id with partial data', (done) => {
    const clinicId = '1';
    const updateData: Partial<Clinic> = { fantasy_name: 'Nome Fantasia Atualizado' };

    const mockUpdatedClinic = { ...mockClinics[0], fantasy_name: 'Nome Fantasia Atualizado' } as Clinic;

    service.update(clinicId, updateData).subscribe(clinic => {
      expect(clinic).toEqual(mockUpdatedClinic);
      done();
    });

    const req = httpTestingController.expectOne(`${mockBaseUrl}/clinics/${clinicId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockUpdatedClinic);
  });

  it('#delete should send a DELETE request to /clinics/:id', (done) => {
    const clinicId = '1';

    service.delete(clinicId).subscribe(() => {
      // O Observable completa, indicando sucesso
      done();
    });

    const req = httpTestingController.expectOne(`${mockBaseUrl}/clinics/${clinicId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(null);
  });

  // --- Testes para Métodos de Listas Auxiliares ---

  it('#getRegions should send a GET request to /regions and return data', (done) => {
    service.getRegions().subscribe(regions => {
      expect(regions).toEqual(mockRegion);
      done();
    });

    const req = httpTestingController.expectOne(`${mockBaseUrl}/regions`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockRegion);
  });

  it('#getSpecialties should send a GET request to /specialties and return data', (done) => {
    service.getSpecialties().subscribe(specialties => {
      expect(specialties).toEqual(mockSpecialty);
      done();
    });

    const req = httpTestingController.expectOne(`${mockBaseUrl}/specialties`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockSpecialty);
  });
});
