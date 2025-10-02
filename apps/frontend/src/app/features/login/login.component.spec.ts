import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({ selector: 'app-logo', standalone: true, template: '' })
class StubLogoComponent { }

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authMock = { login: jasmine.createSpy('login').and.returnValue(of({})) };
    routerMock = { navigateByUrl: jasmine.createSpy('navigateByUrl') };

    // Override the component imports to use a stub logo component so compilation doesn't require the real one
    TestBed.overrideComponent(LoginComponent, {
      set: {
        imports: [CommonModule, ReactiveFormsModule, StubLogoComponent]
      }
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark submitted and show validation errors when form invalid and submitted', () => {
    component.onSubmit();
    fixture.detectChanges();
    expect(component.submitted).toBeTrue();
    // email control is required, expect invalid
    expect(component.form.controls.email.invalid).toBeTrue();
  });

  it('should navigate to /dashboard on successful login', () => {
    authMock.login.and.returnValue(of({}));
    component.form.setValue({ email: 'test@example.com', password: 'password' });
    component.onSubmit();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(component.error).toBeNull();
  });

  it('should set error message on failed login', () => {
    authMock.login.and.returnValue(throwError(() => ({ error: { message: 'Credenciais inválidas' } })));
    component.form.setValue({ email: 'test@example.com', password: 'wrong' });
    component.onSubmit();
    fixture.detectChanges();
    expect(component.error).toBe('Credenciais inválidas');
  });

  it('toggleShowPassword should flip showPassword flag', () => {
    expect(component.showPassword).toBeFalse();
    component.toggleShowPassword();
    expect(component.showPassword).toBeTrue();
    component.toggleShowPassword();
    expect(component.showPassword).toBeFalse();
  });

  it('should not call auth.login when form is invalid', () => {
    authMock.login.calls.reset();
    // form is invalid by default (empty fields)
    component.onSubmit();
    expect(component.submitted).toBeTrue();
    expect(component.form.invalid).toBeTrue();
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('should set default error message when server error has no message', () => {
    authMock.login.and.returnValue(throwError(() => ({})));
    component.form.setValue({ email: 'test@example.com', password: 'wrong' });
    component.onSubmit();
    fixture.detectChanges();
    expect(component.error).toBe('Credenciais inválidas. Tente novamente.');
    // router should not be called on error
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });
});
