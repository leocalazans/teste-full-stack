import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService, User } from './auth.service';
import { HttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: jasmine.SpyObj<HttpClient>;

  const mockUser: User = { id: '1', name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    httpMock = jasmine.createSpyObj('HttpClient', ['post', 'get']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetchProfile should call GET /api/auth/me and return user', (done) => {
    httpMock.get.and.returnValue(of(mockUser));

    service.fetchProfile().subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(httpMock.get).toHaveBeenCalledWith('/api/auth/me', { withCredentials: true });
      done();
    });
  });

  it('login should POST /api/auth/login then fetch profile and update currentUser$', (done) => {
    httpMock.post.and.returnValue(of({}));
    httpMock.get.and.returnValue(of(mockUser));

    const emissions: Array<User | null> = [];
    const sub = service.currentUser$.subscribe(u => emissions.push(u));

    service.login('test@example.com', 'password').subscribe(user => {
      expect(httpMock.post).toHaveBeenCalledWith('/api/auth/login', { email: 'test@example.com', password: 'password' }, { withCredentials: true });
      expect(httpMock.get).toHaveBeenCalledWith('/api/auth/me', { withCredentials: true });
      expect(user).toEqual(mockUser);
      // last emission from currentUser$ should be the logged user
      expect(emissions[emissions.length - 1]).toEqual(mockUser);
      sub.unsubscribe();
      done();
    });
  });

  it('logout should POST /api/auth/logout and clear currentUser$', (done) => {
    // set current user directly on the subject for the test
    (service as any).currentUserSubject.next(mockUser);

    httpMock.post.and.returnValue(of({}));

    service.logout().subscribe(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/api/auth/logout', {}, { withCredentials: true });
      service.currentUser$.subscribe(u => {
        expect(u).toBeNull();
        done();
      });
    });
  });
});
