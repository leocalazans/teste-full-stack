import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClinicasService } from './clinicas.service';
import { API_BASE_URL } from '../../app.config';

describe('ClinicasService', () => {
  let service: ClinicasService;
  let httpMock: HttpTestingController;
  const base = '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClinicasService, { provide: API_BASE_URL, useValue: base }]
    });

    service = TestBed.inject(ClinicasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should list clinics', () => {
    service.list().subscribe();
    const req = httpMock.expectOne(`${base}/clinics`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // it('should create clinic', () => {
  //   const payload = { fantasyName: 'X' };
  //   service.create(payload).subscribe();
  //   const req = httpMock.expectOne(`${base}/clinics`);
  //   expect(req.request.method).toBe('POST');
  //   expect(req.request.body).toEqual(payload);
  //   req.flush({ id: 1, name: 'X' });
  // });

  it('should update clinic', () => {
    service.update(1, { fantasy_name: 'Y' }).subscribe();
    const req = httpMock.expectOne(`${base}/clinics/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, name: 'Y' });
  });

  it('should delete clinic', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${base}/clinics/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
