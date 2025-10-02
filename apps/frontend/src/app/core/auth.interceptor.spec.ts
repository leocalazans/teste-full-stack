import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call refresh and retry original request with credentials on 401', (done) => {
    http.get('/api/protected').subscribe((res: any) => {
      expect(res).toEqual({ data: 'ok' });
      done();
    }, err => fail(err));

    // Original request
    const req1 = httpMock.expectOne('/api/protected');
    expect(req1.request.withCredentials).toBeFalsy();
    // Respond with 401 to trigger refresh
    req1.flush(null, { status: 401, statusText: 'Unauthorized' });

    // Refresh request should be sent with credentials
    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    expect(refreshReq.request.method).toBe('POST');
    expect(refreshReq.request.withCredentials).toBeTrue();
    refreshReq.flush({}, { status: 200, statusText: 'OK' });

    // Original request retried and should include credentials
    const req2 = httpMock.expectOne('/api/protected');
    expect(req2.request.withCredentials).toBeTrue();
    req2.flush({ data: 'ok' });
  });

  it('should propagate error when refresh fails', (done) => {
    http.get('/api/protected').subscribe(() => fail('should not succeed'), (err) => {
      expect(err.status).toBe(401);
      done();
    });

    const req1 = httpMock.expectOne('/api/protected');
    req1.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    refreshReq.flush(null, { status: 401, statusText: 'Unauthorized' });
  });
});
